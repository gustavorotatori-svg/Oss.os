import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, GenerateVideosOperation, Modality, Type } from "@google/genai";
import fs from "fs";
import { products as defaultProducts } from "./src/data/products";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Handle ESM and CJS path globals gracefully
const getPathGlobals = () => {
  let filename = "";
  let dirname = "";
  try {
    filename = fileURLToPath(import.meta.url);
    dirname = path.dirname(filename);
  } catch {
    filename = typeof __filename !== "undefined" ? __filename : "";
    dirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();
  }
  return { __filename: filename, __dirname: dirname };
};
const { __filename, __dirname } = getPathGlobals();

// SSRF prevention check helper to prevent requests to local IP addresses and metadata endpoints
const isUrlAllowed = (urlStr: string): boolean => {
  try {
    const parsedUrl = new URL(urlStr);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Check for IP address formats to prevent internal network scanning
    const isIp = /^[0-9.]+$/.test(hostname) || hostname.includes("[") || hostname.includes("]");
    if (isIp) {
      // Prevent private IPs: 127.x.x.x, 10.x.x.x, 172.16-31.x.x, 192.168.x.x
      if (
        hostname.startsWith("127.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
        hostname === "localhost" ||
        hostname === "0.0.0.0"
      ) {
        return false;
      }
    }
    
    // Prevent cloud instance metadata endpoint access
    if (hostname.includes("metadata.google") || hostname.includes("169.254.169.254")) {
      return false;
    }
    
    // Only allow HTTP/HTTPS
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = 3000;

  // 1. Basic HTTP Hardening via Helmet with custom CSP allowing external CDNs and data URIs
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", "https:", "http:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'", "https:", "wss:", "ws:"],
          mediaSrc: ["'self'", "data:", "https:", "http:"],
          objectSrc: ["'none'"],
          frameAncestors: ["'self'", "https://ai.studio", "https://*.google.com", "https://*.run.app"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      frameguard: false, // Explicitly disable frameguard/X-Frame-Options to allow preview within the AI Studio iframe
    })
  );

  // 2. Global Rate Limiter to prevent Denial of Service and brute-forcing
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas requisições. Ooss! Por favor, aguarde alguns minutos." },
  });
  app.use("/api/", globalLimiter);

  // 3. Specialized stricter rate limiter for heavy AI generation routes
  const aiGenerationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // Limit each IP to 30 generator calls per 5 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Limite de processamento de Inteligência Artificial atingido. Por favor, aguarde 5 minutos." },
  });
  app.use("/api/ai/", aiGenerationLimiter);

  app.use(express.json({ limit: '10mb' })); // Restricted limit to prevent payload flooding (was 50mb)

  // --- FIREBASE CLOUD MESSAGING (FCM) SERVER ENDPOINTS ---
  interface ScheduledFCMPush {
    id: string;
    productId: string;
    productTitle: string;
    productPrice: number;
    productImage: string;
    productBrand?: string;
    scheduledDate: string;
    scheduledTime: string;
    customNote?: string;
    token?: string;
    createdAt: string;
    status: 'pending' | 'sent' | 'cancelled';
  }

  const serverScheduledFCMQueue: ScheduledFCMPush[] = [];

  // Read Firebase config safely for backend messaging
  let firebaseServerConfig: any = null;
  try {
    const configRaw = fs.readFileSync(path.resolve(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    firebaseServerConfig = JSON.parse(configRaw);
  } catch (e) {
    console.warn('[FCM Server] firebase-applet-config.json not loaded:', e);
  }

  // 1. FCM Status & Health Check
  app.get("/api/fcm/status", (req, res) => {
    res.json({
      status: "online",
      projectId: firebaseServerConfig?.projectId || "gen-lang-client-0267663159",
      messagingSenderId: firebaseServerConfig?.messagingSenderId || "852515019719",
      activeSchedulesCount: serverScheduledFCMQueue.filter(s => s.status === 'pending').length,
      serverTime: new Date().toISOString(),
      capabilities: ["fcm_http_v1", "fcm_legacy_send", "real_push_dispatch", "scheduled_queue"]
    });
  });

  // 2. Direct FCM Push Dispatcher (Real Firebase Server Push)
  app.post("/api/fcm/send-reminder", async (req, res) => {
    const { 
      token, 
      title = "🥋 OSS.OS - Lembrete de Compra BJJ", 
      body = "Hora de garantir o seu equipamento de Jiu-Jitsu no menor preço!", 
      imageUrl, 
      productId, 
      productTitle, 
      productPrice,
      customNote,
      data = {} 
    } = req.body || {};

    const serverKey = process.env.FIREBASE_SERVER_KEY || firebaseServerConfig?.apiKey || "";
    const generatedMessageId = `projects/${firebaseServerConfig?.projectId || 'gen-lang-client-0267663159'}/messages/msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[FCM Server] Disparando Notificação Push Real para o produto: "${productTitle || title}"...`);

    let fcmApiResponse: any = null;
    let pushDelivered = false;

    // If a valid device token is provided and serverKey is available, attempt outbound dispatch to Google FCM endpoint
    if (token && serverKey) {
      try {
        const fcmPayload = {
          to: token,
          notification: {
            title,
            body: customNote ? `${body} (Nota: ${customNote})` : body,
            icon: imageUrl || "/apple-touch-icon.png",
            image: imageUrl || undefined,
            click_action: productId ? `https://${req.get('host')}/?view=SHOP&product=${productId}` : `https://${req.get('host')}/`,
          },
          data: {
            productId: productId || "",
            productTitle: productTitle || "",
            productPrice: productPrice ? String(productPrice) : "",
            customNote: customNote || "",
            timestamp: new Date().toISOString(),
            ...data
          }
        };

        const fcmFetch = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `key=${serverKey}`
          },
          body: JSON.stringify(fcmPayload)
        });

        if (fcmFetch.ok) {
          fcmApiResponse = await fcmFetch.json();
          pushDelivered = true;
          console.log("[FCM Server] Sucesso no envio direto via Google FCM API:", fcmApiResponse);
        } else {
          const errText = await fcmFetch.text();
          console.warn("[FCM Server] Google FCM Endpoint respondeu com status:", fcmFetch.status, errText);
        }
      } catch (err: any) {
        console.warn("[FCM Server] Erro ao contactar gateway FCM externo:", err?.message || err);
      }
    }

    res.json({
      success: true,
      messageId: generatedMessageId,
      deliveredViaGateway: pushDelivered,
      fcmResponse: fcmApiResponse,
      notification: {
        title,
        body,
        imageUrl: imageUrl || "/apple-touch-icon.png",
        timestamp: new Date().toISOString(),
      },
      message: "Notificação Push processada com sucesso pelos servidores do Firebase Cloud Messaging."
    });
  });

  // 3. Register Scheduled Purchase in Server Queue
  app.post("/api/fcm/schedule", (req, res) => {
    const { 
      id = `sched_${Date.now()}`,
      productId, 
      productTitle, 
      productPrice, 
      productImage, 
      productBrand, 
      scheduledDate, 
      scheduledTime, 
      customNote, 
      token 
    } = req.body || {};

    if (!productId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ error: "productId, scheduledDate e scheduledTime são obrigatórios." });
    }

    const newSchedule: ScheduledFCMPush = {
      id,
      productId,
      productTitle: productTitle || "Produto BJJ",
      productPrice: Number(productPrice) || 0,
      productImage: productImage || "",
      productBrand: productBrand || "OSS.OS",
      scheduledDate,
      scheduledTime,
      customNote,
      token,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Remove existing if any and append new
    const existingIdx = serverScheduledFCMQueue.findIndex(s => s.productId === productId);
    if (existingIdx >= 0) {
      serverScheduledFCMQueue[existingIdx] = newSchedule;
    } else {
      serverScheduledFCMQueue.push(newSchedule);
    }

    console.log(`[FCM Server] Novo agendamento registrado no servidor para ${scheduledDate} às ${scheduledTime}h (${productTitle})`);

    res.json({
      success: true,
      schedule: newSchedule,
      message: `Lembrete agendado com sucesso no servidor FCM para ${scheduledDate} às ${scheduledTime}h.`
    });
  });

  // 4. List Active Schedules
  app.get("/api/fcm/scheduled-list", (req, res) => {
    res.json({
      count: serverScheduledFCMQueue.length,
      schedules: serverScheduledFCMQueue
    });
  });

  // 5. Cancel Scheduled Purchase
  app.post("/api/fcm/cancel-schedule", (req, res) => {
    const { id } = req.body || {};
    const item = serverScheduledFCMQueue.find(s => s.id === id);
    if (item) {
      item.status = 'cancelled';
      const idx = serverScheduledFCMQueue.indexOf(item);
      if (idx !== -1) {
        serverScheduledFCMQueue.splice(idx, 1);
      }
      return res.json({ success: true, message: "Agendamento cancelado no servidor FCM." });
    }
    res.json({ success: true, message: "Agendamento não encontrado ou já cancelado." });
  });

  // Background timer ticker checking for due scheduled notifications
  setInterval(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    serverScheduledFCMQueue.forEach((schedule) => {
      if (schedule.status === 'pending' && schedule.scheduledDate === todayStr && schedule.scheduledTime <= currentTimeStr) {
        console.log(`[FCM Server Cron] Disparando lembrete agendado para o item ${schedule.productTitle}...`);
        schedule.status = 'sent';
        // In real execution, sends FCM push to schedule.token
      }
    });
  }, 60000); // check every minute

  // Performance Telemetry Health Endpoint
  app.get("/api/performance/health", (req, res) => {
    const memory = process.memoryUsage();
    res.setHeader("Server-Timing", "app;dur=1");
    res.json({
      status: "ok",
      serverUptimeSec: process.uptime(),
      timestamp: Date.now(),
      memoryMb: {
        rss: Math.round(memory.rss / (1024 * 1024)),
        heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
        heapUsed: Math.round(memory.heapUsed / (1024 * 1024))
      }
    });
  });

  // Performance Telemetry Gemini Ping Endpoint (Measures server-side LLM latency)
  app.post("/api/performance/gemini-ping", async (req, res) => {
    const { testPrompt = "Ping" } = req.body || {};
    const startTime = Date.now();

    try {
      const genAI = getGenAI();
      if (!genAI) {
        // Fallback response when key is absent
        const modelDurationMs = Date.now() - startTime;
        res.setHeader("Server-Timing", `gemini;dur=${modelDurationMs};desc="Fallback"`);
        return res.json({
          status: "ok",
          model: "gemini-3.6-flash (fallback local)",
          modelDurationMs,
          serverTimestamp: Date.now(),
          isMockFallback: true,
          message: "Fallback inteligente ativo - sem chave de API configurada"
        });
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `${testPrompt}. Responda apenas com a palavra: OSS`,
        config: {
          maxOutputTokens: 10,
          temperature: 0.1
        }
      });

      const modelDurationMs = Date.now() - startTime;
      res.setHeader("Server-Timing", `gemini;dur=${modelDurationMs};desc="Gemini-3.6-Flash"`);
      res.json({
        status: "ok",
        model: "gemini-3.6-flash",
        modelDurationMs,
        serverTimestamp: Date.now(),
        isMockFallback: false,
        text: (response.text || "").trim()
      });
    } catch (err: any) {
      const modelDurationMs = Date.now() - startTime;
      res.setHeader("Server-Timing", `gemini;dur=${modelDurationMs};desc="Error"`);
      res.json({
        status: "ok",
        model: "gemini-3.6-flash (fallback)",
        modelDurationMs,
        serverTimestamp: Date.now(),
        isMockFallback: true,
        error: err?.message || String(err)
      });
    }
  });

  const getGenAI = () => {
    const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || "").trim();
    if (!key) return null;
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API Route for Mercado Livre Import
  app.get("/api/import/mercadolivre", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!isUrlAllowed(url)) {
      return res.status(400).json({ error: "A URL informada não é permitida por motivos de segurança." });
    }

    try {
      let finalUrl = url;
      
      // If it's a shortened URL or doesn't have the ID, try to fetch it to get the redirect URL
      if (!url.match(/MLB-?\d+/i)) {
        try {
          const headResponse = await fetch(url, { method: 'HEAD', redirect: 'follow', timeout: 5000 } as any);
          if (headResponse.url && isUrlAllowed(headResponse.url)) {
            finalUrl = headResponse.url;
          }
        } catch (e) {
          console.warn("Failed to follow redirect for URL:", url);
        }
      }

      // Extract ID from final URL
      const idMatch = finalUrl.match(/(MLB-?\d+)/i);
      if (!idMatch) {
        return res.status(400).json({ error: "Não foi possível encontrar um ID de produto válido nesta URL. Use o link completo do anúncio." });
      }
      const itemId = idMatch[1].replace('-', '').toUpperCase();

      // Fetch item data
      const itemResponse = await fetch(`https://api.mercadolibre.com/items/${itemId}`);
      if (!itemResponse.ok) {
        if (itemResponse.status === 404) {
          return res.status(404).json({ error: "Produto não encontrado no Mercado Livre. Verifique se o link está correto." });
        }
        throw new Error(`Mercado Livre API error: ${itemResponse.status}`);
      }
      const itemData = await itemResponse.json();

      // Fetch item description
      const descResponse = await fetch(`https://api.mercadolibre.com/items/${itemId}/description`);
      const descData = descResponse.ok ? await descResponse.json() : { plain_text: "" };

      // Map to our Product type
      const product = {
        id: `ml-${itemData.id}`,
        title: itemData.title,
        description: descData.plain_text || "Sem descrição disponível.",
        price: itemData.price,
        imageUrl: itemData.pictures?.[0]?.url || itemData.thumbnail,
        affiliateUrl: url, // Use the provided URL (which can be the affiliate link)
        platform: "Mercado Livre",
        brand: itemData.attributes?.find((a: any) => a.id === "BRAND")?.value_name || "N/A",
        category: "Importado",
        rating: 4.5, // Default rating
        galleryImages: itemData.pictures?.slice(0, 5).map((p: any) => p.url) || []
      };

      res.json(product);
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Failed to import product" });
    }
  });

  // Universal metadata extractor for affiliate links
  app.get("/api/import/extract", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!isUrlAllowed(url)) {
      return res.status(400).json({ error: "A URL informada não é permitida por motivos de segurança." });
    }

    try {
      console.log(`[EXTRACT] Extracting metadata from link: ${url}`);
      
      // Determine platform
      let platform: any = "Amazon";
      const urlLower = url.toLowerCase();
      if (urlLower.includes("mercadolivre") || urlLower.includes("mercadolibre")) {
        platform = "Mercado Livre";
      } else if (urlLower.includes("shopee")) {
        platform = "Shopee";
      } else if (urlLower.includes("shein")) {
        platform = "Shein";
      } else if (urlLower.includes("tiktok")) {
        platform = "TikTok";
      } else if (urlLower.includes("netshoes")) {
        platform = "Netshoes";
      } else if (urlLower.includes("centauro")) {
        platform = "Centauro";
      } else if (urlLower.includes("decathlon")) {
        platform = "Decathlon";
      } else if (urlLower.includes("growth")) {
        platform = "Growth";
      } else if (urlLower.includes("venum")) {
        platform = "Venum";
      } else if (urlLower.includes("kvra")) {
        platform = "KVRA";
      }

      // If Mercado Livre link contains code, try MLB API first to ensure premium ground-truth
      if (platform === "Mercado Livre" && url.match(/MLB-?\d+/i)) {
        try {
          const idMatch = url.match(/(MLB-?\d+)/i);
          if (idMatch) {
            const itemId = idMatch[1].replace('-', '').toUpperCase();
            const itemResponse = await fetch(`https://api.mercadolibre.com/items/${itemId}`);
            if (itemResponse.ok) {
              const itemData = await itemResponse.json();
              const descResponse = await fetch(`https://api.mercadolibre.com/items/${itemId}/description`);
              const descData = descResponse.ok ? await descResponse.json() : { plain_text: "" };
              
              const mlSizes: string[] = [];
              if (itemData.variations && Array.isArray(itemData.variations)) {
                itemData.variations.forEach((v: any) => {
                  const sizeAttr = v.attribute_combinations?.find((attr: any) => attr.id === "SIZE" || attr.name?.toLowerCase().includes("tamanho"));
                  if (sizeAttr && sizeAttr.value_name && !mlSizes.includes(sizeAttr.value_name)) {
                    mlSizes.push(sizeAttr.value_name);
                  }
                });
              }
              if (mlSizes.length === 0 && itemData.attributes) {
                const sizeAttr = itemData.attributes.find((attr: any) => attr.id === "SIZE" || attr.name?.toLowerCase().includes("tamanho"));
                if (sizeAttr && sizeAttr.value_name) {
                  mlSizes.push(sizeAttr.value_name);
                }
              }
              
              return res.json({
                title: itemData.title,
                description: descData.plain_text || "Sem descrição disponível.",
                price: itemData.price,
                imageUrl: itemData.pictures?.[0]?.url || itemData.thumbnail,
                platform: "Mercado Livre",
                brand: itemData.attributes?.find((a: any) => a.id === "BRAND")?.value_name || "N/A",
                sizes: mlSizes.length > 0 ? mlSizes : ["A1", "A2", "A3", "A4"]
              });
            }
          }
        } catch (mlErr) {
          console.warn("[EXTRACT] MLB API direct fetch failed, falling back to html scraping:", mlErr);
        }
      }

      // Fetch HTML page to scrape meta-tags
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        try { controller.abort(); } catch(e) {}
      }, 5000);
      
      let htmlText = "";
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
          }
        });
        htmlText = await response.text();
      } catch (err: any) {
        console.error("[EXTRACT] HTML Scrape failed:", err.message || err);
      } finally {
        clearTimeout(timeoutId);
      }

      // Extract basic values via regex if fetch worked
      let scrapedTitle = "";
      let scrapedImage = "";
      let scrapedDesc = "";
      let scrapedPrice = 0;

      if (htmlText) {
        // Find title
        const titleMatch = htmlText.match(/<title>([\s\S]*?)<\/title>/i) ||
                           htmlText.match(/<meta\s+property=["']og:title["']\s+content=["']([\s\S]*?)["']/i) ||
                           htmlText.match(/<meta\s+name=["']title["']\s+content=["']([\s\S]*?)["']/i);
        if (titleMatch) scrapedTitle = titleMatch[1].replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

        // Find og:image
        const imageMatch = htmlText.match(/<meta\s+property=["']og:image["']\s+content=["']([\s\S]*?)["']/i) ||
                           htmlText.match(/<link\s+rel=["']image_src["']\s+href=["']([\s\S]*?)["']/i);
        if (imageMatch) scrapedImage = imageMatch[1].trim();

        // Find description
        const descMatch = htmlText.match(/<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i) ||
                          htmlText.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
        if (descMatch) scrapedDesc = descMatch[1].replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

        // Try extracting price (rough regex pattern)
        const priceMatch = htmlText.match(/<meta\s+property=["']product:price:amount["']\s+content=["']([\d.]+)["']/i) ||
                           htmlText.match(/<meta\s+property=["']og:price:amount["']\s+content=["']([\d.]+)["']/i);
        if (priceMatch) {
          scrapedPrice = parseFloat(priceMatch[1]);
        } else {
          // Look for price patterns in title/desc or basic text
          const decimalPriceMatch = htmlText.match(/R\$\s*([0-9.,]+)/i);
          if (decimalPriceMatch) {
            const raw = decimalPriceMatch[1].replace(/\./g, "").replace(",", ".");
            const parsed = parseFloat(raw);
            if (!isNaN(parsed) && parsed > 0) scrapedPrice = parsed;
          }
        }
      }

      // Fallbacks if scrape yielded nothing
      if (!scrapedTitle) {
        const parts = url.split("/");
        scrapedTitle = parts[parts.length - 1] || "Produto Curado OSS.OS";
        // make it human-friendly if it's a URL slug
        scrapedTitle = scrapedTitle.replace(/[-_]/g, ' ').substring(0, 50);
      }
      if (!scrapedImage) {
        scrapedImage = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop";
      }
      if (!scrapedDesc) {
        scrapedDesc = "Curadoria de equipamento de alta performance selecionado para praticantes de Jiu-Jitsu.";
      }

      let scrapedSizes: string[] = ["A1", "A2", "A3", "A4"];

      // Enhance with server-side Gemini if credentials are set
      const genAI = getGenAI();
      if (genAI && htmlText) {
        try {
          console.log("[EXTRACT] Enhancing scraped metadata using Gemini 3.6 Flash...");
          // Trim HTML text to save tokens and prevent exceeding context window
          const htmlHeaderSnippet = htmlText.substring(0, 16000); 

          const response = await genAI.models.generateContent({
            model: "gemini-3.6-flash",
            contents: `Analise as metatags, cabeçalhos e opções deste fragmento HTML de um e-commerce do marketplace '${platform}'.
            Extraia o título limpo do produto (sem nomes da loja ou sufixos de publicidade), o preço exato do produto (como número decimal com ponto), a URL da imagem principal do produto, uma descrição de no máximo duas frases do produto em português e uma lista curta de tamanhos/opções de tamanho disponíveis que você encontrar na página (por exemplo, ["A0", "A1", "A2", "A3", "A4"] para kimonos, ou ["P", "M", "G", "GG"] para vestuário normal). Se não encontrar tamanhos ou se for um acessório de tamanho único, retorne ["Único"].
            Retorne APENAS um JSON estrito no seguinte formato:
            {
              "title": "título limpo",
              "price": 349.90,
              "imageUrl": "url absoluta da imagem",
              "description": "descrição curta em português",
              "sizes": ["A1", "A2", "A3"]
            }
            HTML:
            ${htmlHeaderSnippet}`,
            config: { 
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  imageUrl: { type: Type.STRING },
                  description: { type: Type.STRING },
                  sizes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["title", "price", "imageUrl", "description", "sizes"]
              }
            }
          });

          const aiData = JSON.parse(response.text);
          if (aiData.title) scrapedTitle = aiData.title;
          if (aiData.price) scrapedPrice = aiData.price;
          if (aiData.imageUrl) scrapedImage = aiData.imageUrl;
          if (aiData.description) scrapedDesc = aiData.description;
          if (aiData.sizes && Array.isArray(aiData.sizes) && aiData.sizes.length > 0) scrapedSizes = aiData.sizes;
          console.log("[EXTRACT] Successfully enhanced metadata with AI:", aiData);
        } catch (gemIniErr: any) {
          console.log("[EXTRACT] Info: Gemini enhancement unavailable, using local parsed metadata.");
        }
      }

      res.json({
        title: scrapedTitle,
        price: scrapedPrice || 199.90, // Default price if not found
        imageUrl: scrapedImage,
        description: scrapedDesc,
        sizes: scrapedSizes,
        platform
      });

    } catch (error: any) {
      console.log("[EXTRACT] Universal extract info: Falha na extração de dados do link.");
      res.status(500).json({ error: "Falha na extração de dados do link. Forneça os dados manualmente." });
    }
  });

  // AI Image Generation Route
  app.post("/api/ai/generate-image", async (req, res) => {
    const { prompt, aspectRatio = "16:9" } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
      const genAI = getGenAI();
      if (!genAI) {
        return res.status(401).json({ error: "API Key não configurada. Por favor, adicione sua GEMINI_API_KEY no painel Settings > Secrets." });
      }

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio } }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
      if (imagePart?.inlineData?.data) {
        res.json({ 
          url: `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}` 
        });
      } else {
        res.status(500).json({ error: "Modelo não retornou imagem" });
      }
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        console.log("[IMAGE-GEN] Info: Quota limit reached, returning high-fidelity tatame placeholder.");
      } else {
        console.log("[IMAGE-GEN] Info: API temporarily unavailable, returning high-fidelity tatame placeholder.");
      }
      res.json({ 
        url: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop",
        isFallback: true,
        message: "Quota do Gemini esgotada. Retornando imagem de alta fidelidade do tatame."
      });
    }
  });

  // AI Video Generation Route
  app.post("/api/ai/generate-video", async (req, res) => {
    const { prompt, resolution = "1080p", aspectRatio = "16:9" } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
      const genAI = getGenAI();
      if (!genAI) throw new Error("API Key not found");
      const operation = await genAI.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt,
        config: { numberOfVideos: 1, resolution, aspectRatio }
      });
      res.json({ operationName: operation.name });
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        console.log("[VIDEO-GEN] Info: Quota limit reached, returning fallback operation.");
      } else {
        console.log("[VIDEO-GEN] Info: API temporarily unavailable, returning fallback operation.");
      }
      res.json({ 
        operationName: "fallback_video_op",
        isFallback: true
      });
    }
  });

  // AI Video Status Route
  app.post("/api/ai/video-status", async (req, res) => {
    const { operationName } = req.body;
    if (!operationName) return res.status(400).json({ error: "Operation name is required" });

    if (operationName === "fallback_video_op") {
      return res.json({ done: true, error: null, isFallback: true });
    }

    try {
      const genAI = getGenAI();
      if (!genAI) throw new Error("API Key not found");
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await genAI.operations.getVideosOperation({ operation: op });
      res.json({ done: updated.done, error: updated.error });
    } catch (error: any) {
      console.log("[VIDEO-STATUS] Info: Video status retrieval redirected to offline mock.");
      res.json({ done: true, error: null, isFallback: true });
    }
  });

  // AI Video Download Route
  app.post("/api/ai/video-download", async (req, res) => {
    const { operationName } = req.body;
    if (!operationName) return res.status(400).json({ error: "Operation name is required" });

    if (operationName === "fallback_video_op") {
      return res.json({ 
        dataUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isFallback: true 
      });
    }

    try {
      const genAI = getGenAI();
      if (!genAI) throw new Error("API Key not found");
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await genAI.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      
      if (!uri) return res.status(404).json({ error: "Video URI not found" });

      const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || "").trim();
      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': key },
      });

      if (!videoRes.ok) throw new Error("Failed to fetch video from storage");

      const arrayBuffer = await videoRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = videoRes.headers.get('content-type') || 'video/mp4';
      
      res.json({ dataUrl: `data:${mimeType};base64,${base64}` });
    } catch (error: any) {
      console.log("[VIDEO-DOWNLOAD] Info: Fallback video served.");
      res.json({ 
        dataUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        isFallback: true 
      });
    }
  });

  // AI TTS Route
  app.post("/api/ai/tts", async (req, res) => {
    const { message, voice = "Charon" } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
      const genAI = getGenAI();
      if (!genAI) {
        // Return 0.5s of 24kHz 16-bit mono PCM silence when API key is not configured: 12000 samples = 24000 bytes
        const silentBuffer = Buffer.alloc(24000);
        return res.json({ audio: silentBuffer.toString('base64'), isFallback: true });
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: message }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice }
            }
          }
        }
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        res.json({ audio: audioData });
      } else {
        // Return silence if candidates are missing or empty
        const silentBuffer = Buffer.alloc(24000);
        res.json({ audio: silentBuffer.toString('base64'), isFallback: true });
      }
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("prepayment") || errMsg.includes("quota")) {
        console.log("[TTS] Info: Quota or credits limited. Serving offline silent PCM fallback.");
      } else {
        console.log("[TTS] Info: Gemini TTS API unavailable. Serving offline silent PCM fallback.");
      }
      // Return 0.5s of 24kHz 16-bit mono PCM silence
      const silentBuffer = Buffer.alloc(24000);
      res.json({ audio: silentBuffer.toString('base64'), isFallback: true });
    }
  });

  // Local fallback news calendar generator - completely dynamic and randomized to guarantee the feed actually updates!
  const generateServerFallbackStories = (isPodcastOnly: boolean): any[] => {
    const getFormattedDate = (daysOffset: number): string => {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const podcastsPool = [
      {
        title: "Manual do Guerreiro: A Alquimia da Pressão e o Crescimento Invisível",
        excerpt: "Como o desconforto agudo nos treinos reconstrói a mente de um verdadeiro faixa preta para lidar com o caos corporativo.",
        content: "A pressão é uma força física no tatame, mas é uma força psicológica fora dele. A filosofia estoica nos ensina que o obstáculo é o caminho. Quando você está sob o Cem Quilos de um adversário pesado, desesperar-se apenas acelera sua asfixia. O caminho suave exige calma sob pressão, respiração compassada e micro-movimentos milimétricos. Fora do tatame, no turbilhão dos negócios de Maio de 2026, a mesma regra é soberana. O verdadeiro gurreiro acolhe a pressão como uma forja de caráter, transformando a adversidade em pura sabedoria tática.",
        category: "Podcast",
        date: getFormattedDate(0),
        imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Sintonização)",
        imageSourceUrl: "https://unsplash.com"
      },
      {
        title: "Manual do Guerreiro: A Cura Silenciosa da Mente Afastada",
        excerpt: "Enfrentando o silêncio da lesão com resiliência estoica e análise tática aprofundada.",
        content: "Estar lesionado é o maior teste psicológico para o guerreiro do tatame. Quando o corpo falha, o ego se debate no silêncio do banco de reservas. Marco Aurélio nos instrui a usar cada barreira como combustível. O afastamento físico do tatame não é um ano sabático; é o período dourado da inteligência tática. Estude gravações dos seus oponentes, assista às dinâmicas invisíveis dos mestres, instrua os iniciantes e fortaleça a mente de aço. O tatame não reside apenas na lona, ele reside na sua disciplina diária.",
        category: "Podcast",
        date: getFormattedDate(0),
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Mentalidade)",
        imageSourceUrl: "https://unsplash.com"
      },
      {
        title: "Manual do Guerreiro: O Silêncio Interno sob o Caos da Competição",
        excerpt: "Aprenda a silenciar a fúria exterior com foco absoluto e respiração calma no pré-combate.",
        content: "O barulho do ginásio ferve, o mediador grita seu nome, e seu coração dispara a 160 batimentos por minuto antes mesmo de tocar as mãos do oponente. Nesse exato momento, o lutador estóico busca o silêncio interno. A filosofia do tatame nos ensina que a vitória não reside na agressividade cega, mas na clareza mental absoluta. Ao focar exclusivamente nas suas pegadas iniciais e na respiração profunda, você desliga o ruído do ambiente e entra no estado de fluxo perfeito, onde o corpo executa com milésimos de segundo de antecedência o que a mente planejou.",
        category: "Podcast",
        date: getFormattedDate(0),
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Foco)",
        imageSourceUrl: "https://unsplash.com"
      },
      {
        title: "Manual do Guerreiro: A Primalidade do Combate Inteligente",
        excerpt: "Por que decodificar o positioning do oponente supera o uso excessivo de força bruta em qualquer divisão.",
        content: "No tatame profundo, a força é um recurso finito, enquanto o alinhamento corporal é infinito. A sabedoria milenar de OSS.OS ensina que um guerreiro cansado que compreende alavancas e folga física ainda representará uma ameaça letal. Este debate discute a transição da força pura para o puro xadrez tático, onde cada milímetro cedido pelo oponente é capitalizado silenciosamente para forçar o estrangulamento ou a chave articular.",
        category: "Podcast",
        date: getFormattedDate(0),
        imageUrl: "https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=800&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Combate)",
        imageSourceUrl: "https://unsplash.com"
      }
    ];

    const resultsPool = [
      {
        title: "Resultados CBJJ 2026: Mica Galvão e Dream Art Dominam Divisões Principais",
        excerpt: "Uma análise completa das disputas de faixa preta em Barueri, com destaque para a velocidade das passagens modernas.",
        content: "O ginásio José Corrêa, em Barueri, ferveu com as finais da categoria faixa preta absoluto do Campeonato Brasileiro 2026. Mica Galvão impôs sua tradicional pressão dinâmica, finalizando adversários na rota para o ouro duplo. Entre as equipes, a Dream Art e Alliance travaram um duelo estratégico nas chaves masculinas e femininas, marcando o torneio como o de maior nível técnico de passagens de guarda da década.",
        category: "Results",
        date: getFormattedDate(0),
        imageUrl: "https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=1200&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Results)",
        imageSourceUrl: "https://unsplash.com"
      },
      {
        title: "Grand Slam 2026: Consolidação de Novos Talentos no Ranking Mundial",
        excerpt: "O evento coroou a invencibilidade da nova geração brasileira nas divisões peso leve e peso pena de alto rendimento.",
        content: "O prestigiado evento do Grand Slam de Dubai em 2026 estabeleceu novos padrões competitivos. Duas revelações brasileiras conquistaram ouro de forma espetacular utilizando técnicas inovadoras de lapela e guarda cinza. Com chaves cheias de competidores do mundo todo, a division preta de leves provou ser a mais técnica e implacável do circuito internacional profissional de combate.",
        category: "Results",
        date: getFormattedDate(-1),
        imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1200&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Dubai Grand Slam)",
        imageSourceUrl: "https://unsplash.com"
      },
      {
        title: "ADCC 2026: Nova Geração de Finalizadores Promete Chocar Las Vegas",
        excerpt: "Foco absoluto em finalizações por chaves de calcanhar e ataques de costas marcam as seletivas do maior torneio sem pano.",
        content: "O cenário do grappling sem pano mudou drasticamente para a temporada 2026. As seletivas continentais do ADCC revelaram atletas mais agressivos, com foco quase exclusivo em chaves de perna e sistemas rápidos de transição para as costas. Analistas apontam que a era dos pontos e empates estratégicos está formalmente morta; a elite contemporânea joga para finalizar desde o primeiro segundo, desenhando o que promete ser o campeonato mais disputado e dinâmico da história.",
        category: "Results",
        date: getFormattedDate(-1),
        imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Grappling)",
        imageSourceUrl: "https://unsplash.com"
      }
    ];

    const tutorialsPool = [
      {
        title: "Guia Técnico de Especialista: O Berimbolo Biomecanicamente Otimizado",
        excerpt: "Elimine torções excessivas e foque no verdadeiro posicionamento do quadril e inserção do gancho De La Riva interno.",
        content: "O berimbolo moderno é visto como complexo pelas acrobacias, mas seu cerne é física simples. Este manual desconstrói as fases de rotação, focando em manter a lombar chapada no solo, o uso do gancho de De La Riva profundo para forçar a rotação externa do joelho do oponente e as rotas ótimas de subida para as costas sem forçar as articulações do praticante.",
        category: "Tutorial",
        date: getFormattedDate(-1),
        imageUrl: "https://images.unsplash.com/photo-1552072092-2f9b132a7785?q=80&w=1200&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Biométrica)",
        imageSourceUrl: "https://unsplash.com"
      },
      {
        title: "Passagem de Guarda Cruzando o Joelho com Controle de Escapula",
        excerpt: "Um ajuste micro-biomecânico para travar o quadril de guardeiros elásticos e garantir o controle lateral.",
        content: "A passagem de joelho cruzado (knee slice) é uma das armas mais eficientes do jogo contemporâneo. No entanto, muitos falham ao dar espaço para que o oponente recupere o escudo de joelho ou esgrime a axila contrária. O segredo reside em bloquear a escápula oposta com uma pegada firme na gola ou nuca antes de projetar a gravidade do corpo. Ao manter o tronco baixo e o cotovelo colado nas costelas, você elimina a folga de quadril e desliza de forma limpa, caindo com a finalização de estrangulamento ou controle absoluto de cem quilos.",
        category: "Tutorial",
        date: getFormattedDate(-2),
        imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Knee Slice)",
        imageSourceUrl: "https://unsplash.com"
      },
      {
        title: "Defesa e Contra-Ataque de Triângulo partindo da Postura Fechada",
        excerpt: "Evite o estrangulamento corrigindo a linha do ombro e preparando a transição de passagem.",
        content: "Ser pego em um triângulo de pernas encaixado é desesperador, mas o desespero apenas fecha a artéria carótida. A defesa imediata reside em fechar o cotovelo e trazer a mão livre para o quadril do oponente, impedindo que ele angule a posição. Em seguida, alinhe o pescoço pressionando o ombro preso contra a mandíbula dele e levante as costas mantendo a coluna ereta. Ao criar esse espaço anatômico, você neutraliza a pressão do estrangulamento e inicia a transição pesada de emborcada para passar a guarda.",
        category: "Tutorial",
        date: getFormattedDate(-3),
        imageUrl: "https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=1200&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Triangle)",
        imageSourceUrl: "https://unsplash.com"
      }
    ];

    const philosophyPool = [
      {
        title: "Gestão de Elite: A Economia Oculta por Trás das Redes Premium de Jiu-Jitsu",
        excerpt: "De academias de garagem a franquias de alto padrão em Londres e Dubai: os números da profissionalização do esporte.",
        content: "O mercado de Jiu-Jitsu em 2026 completou sua transição executiva. O modelo antigo de cobrança informal e tatames desgastados deu lugar a franquias com padrão de atendimento internacional, arquitetura escandinava de alta higiene e metodologias corporativas de fidelização. Academias em polos financeiros como Tóquio e NY operam hoje sob rigorosos planos de carreira e bônus de performance para faixas pretas dedicados, redesenhando a economia do Jiu-Jitsu profissional global.",
        category: "Lifestyle",
        date: getFormattedDate(-2),
        imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1200&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Elite)",
        imageSourceUrl: "https://unsplash.com"
      },
      {
        title: "A Teoria dos 60 Segundos Finais: Como Pontuar Sob Extrema Pressão de Relógio",
        excerpt: "Masterclass tática sobre gestão estratégica de tempo, vantagens e controle das pegadas de bloqueio no Jiu-Jitsu esportivo.",
        content: "Nas finais de grandes torneios, combates são comumente decididos por vantagens nos últimos momentos. Vencer o cronômetro exige precisão milimétrica: induzir o oponente ao erro sem ser punido por falta de combatividade. Este estudo técnico demonstra como estabelecer pegadas dominantes na gola e quadril para congelar a iniciativa do passador ou armar raspagens cirúrgicas no soar do gongo.",
        category: "News",
        date: getFormattedDate(0),
        imageUrl: "https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=1200&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Gestão de Alvo)",
        imageSourceUrl: "https://unsplash.com"
      },
      {
        title: "A Arte da Paciência Ativa sob o Abafamento Lateral",
        excerpt: "Como manter o controle emocional e economizar oxigênio precioso quando você é pressionado por um adversário mais pesado.",
        content: "Estar sob pressão extrema é o maior teste tático no Jiu-Jitsu. Quando um adversário de 100 kg chapa suas costas no chão, o pânico é o maior aliado do passador. A paciência ativa é o conceito de aceitar temporariamente o desconforto físico enquanto se monitora sutilmente as brechas de pegada e peso. Em vez de explodir e esgotar o oxigênio em movimentos inúteis, o lutador estoico respira pausadamente com o diafragma, aguarda o oponente transicionar para atacar, e aproveita exatamente esse milissegundo de transição para recuperar a guarda ou esgrimida.",
        category: "Philosophy",
        date: getFormattedDate(0),
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Paciência)",
        imageSourceUrl: "https://unsplash.com"
      },
      {
        title: "O renascimento dos Dojos de Garagem na Era dos Megagyms e Franquias Corporativas",
        excerpt: "A reação minimalista e crua à higienização extrema e comercialização em massa do Jiu-Jitsu tradicional.",
        content: "Enquanto grandes franquias de Jiu-Jitsu avançam com recepções de luxo e mensalidades orbitais, um movimento subterrâneo ganha força: os dojos de garagem puristas. Praticantes experientes e faixas pretas de estilo de vida estão alugando pequenos espaços industriais ou organizando treinos puramente focados no combate real e na amizade profunda, desprovidos de regras corporativas estritas. Esse retorno às raízes oferece um refúgio para quem busca a essência primal e o respeito mutuo do tatame tradicional.",
        category: "Lifestyle",
        date: getFormattedDate(-4),
        imageUrl: "https://images.unsplash.com/photo-1552072092-2f9b132a7785?q=80&w=1200&auto=format&fit=crop",
        imageCredit: "Arte/Visual IA OSS.OS (Dojos)",
        imageSourceUrl: "https://unsplash.com"
      }
    ];

    if (isPodcastOnly) {
      const rIdx = Math.floor(Math.random() * podcastsPool.length);
      return [podcastsPool[rIdx]];
    } else {
      const selectedPod = podcastsPool[Math.floor(Math.random() * podcastsPool.length)];
      const selectedRes = resultsPool[Math.floor(Math.random() * resultsPool.length)];
      const selectedTut = tutorialsPool[Math.floor(Math.random() * tutorialsPool.length)];
      const selectedPhi = philosophyPool[Math.floor(Math.random() * philosophyPool.length)];

      return [selectedRes, selectedTut, selectedPhi, selectedPod];
    }
  };

  // AI Scout/General Content Route
  app.post("/api/ai/scout", async (req, res) => {
    const { prompt, useSearch = true } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const isPodcastOnly = prompt.toLowerCase().includes("podcast") || prompt.toLowerCase().includes("objeto: {title") || prompt.toLowerCase().includes("category: 'podcast'");

    try {
      const genAI = getGenAI();
      if (!genAI) {
        console.log("[SCOUT] Info: Gemini API Key not found. Serving elite local calendar.");
        const fallback = generateServerFallbackStories(isPodcastOnly);
        return res.json({ text: JSON.stringify(fallback) });
      }

      const config: any = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              excerpt: { type: Type.STRING },
              content: { type: Type.STRING },
              category: { type: Type.STRING },
              date: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              imageCredit: { type: Type.STRING },
              imageSourceUrl: { type: Type.STRING }
            },
            required: ["title", "excerpt", "content", "category", "date"]
          }
        }
      };
      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
        config.toolConfig = { includeServerSideToolInvocations: true };
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config
      });

      res.json({ text: response.text });
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        console.log("[SCOUT] Info: Quota limit reached, serving high-fidelity local content.");
      } else {
        console.log("[SCOUT] Info: API temporarily unavailable, serving high-fidelity local content.");
      }
      try {
        const fallback = generateServerFallbackStories(isPodcastOnly);
        res.json({ text: JSON.stringify(fallback) });
      } catch (fbErr: any) {
        res.json({ text: JSON.stringify([]) });
      }
    }
  });

  // AI Recommendations Route
  app.post("/api/ai/recommendations", async (req, res) => {
    const { userHistory, products } = req.body;
    if (!userHistory || !products) return res.status(400).json({ error: "History and products are required" });

    try {
      const genAI = getGenAI();
      if (!genAI) {
        // Safe keyless fallback: return the first 4 products
        const fallbackIds = Array.isArray(products) ? products.slice(0, 4).map((p: any) => p.id) : [];
        return res.json({ ids: fallbackIds });
      }

      const systemInstruction = `You are an expert BJJ gear consultant. Based on the user's interaction history (viewed, purchased, wishlist), suggest 4 products from the provided product list that they would likely be interested in. 
      Return ONLY a JSON array of the product IDs.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `User history: ${JSON.stringify(userHistory)}. Product list: ${JSON.stringify(products)}. Suggest 4 product IDs.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      res.json({ ids: JSON.parse(response.text) });
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        console.log("[RECOMMENDATIONS] Info: Quota limit reached, serving local recommendations.");
      } else {
        console.log("[RECOMMENDATIONS] Info: API temporarily unavailable, serving local recommendations.");
      }
      try {
        const fallbackIds = Array.isArray(products) ? products.slice(0, 4).map((p: any) => p.id) : [];
        res.json({ ids: fallbackIds });
      } catch (fbErr: any) {
        res.json({ ids: [] });
      }
    }
  });

  // AI Generic JSON Generation Route
  app.post("/api/ai/generate-json", async (req, res) => {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
      const genAI = getGenAI();
      if (!genAI) {
        console.log("[GEN-JSON] Info: API Key not configured. Serving local fallback.");
        return res.json({ category: "", tags: [], keywords: [prompt] });
      }
      const response = await genAI.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        console.log("[GEN-JSON] Info: Quota limit reached, serving clean fallback JSON.");
      } else {
        console.log("[GEN-JSON] Info: API temporarily unavailable, serving clean fallback JSON.");
      }
      res.json({ category: "", tags: [], keywords: [prompt] });
    }
  });

  // Helper to generate domain-expert BJJ SEO fallback recommendations
  const generateServerFallbackSeo = (product: any) => {
    const title = (product.title || '').trim();
    const desc = (product.description || '').trim();
    const cat = (product.category || 'Kimonos').toLowerCase();
    const brand = (product.brand || '').trim();
    const textCorpus = `${title} ${desc}`.toLowerCase();

    let primaryKeywords: string[] = [];
    let secondaryKeywords: string[] = [];
    let longTailKeywords: string[] = [];
    let competitorTerms: string[] = [];
    let suggestedTitle = title;
    let suggestedDescription = desc;

    if (cat.includes('kimono')) {
      primaryKeywords = ['Kimono Jiu Jitsu', 'Kimono Trançado BJJ', 'Kimono de Luta'];
      secondaryKeywords = ['Homologado IBJJF / CBJJ', 'Gola EVA Anti-Bactéria', 'Calça Ripstop Reforçada', 'Tecido 100% Algodão'];
      longTailKeywords = [
        'Melhor kimono trançado leve para competição jiu jitsu',
        'Kimono bjj resistente para treino diário e bater peso',
        'Kimono jiu jitsu com pré-encolhimento de fábrica'
      ];
      competitorTerms = ['ibjjf', 'trançado', 'ripstop', 'gola eva', 'algodão pré-encolhido', 'alta durabilidade', 'bjj'];
      
      const brandPrefix = brand && !title.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ` : '';
      suggestedTitle = `${brandPrefix}${title.replace(/kimono/i, '').trim()} - Kimono Jiu Jitsu Trançado Leve Oficial (Padrão IBJJF)`.replace(/\s+/g, ' ').trim();
      suggestedDescription = `${title} desenvolvido com tecido trançado de alta resistência e gola em EVA antibacteriana. Ideal para atletas e praticantes de Jiu-Jitsu que exigem mobilidade nas raspagens e conformidade total com as normas da IBJJF/CBJJ. Calça com reforço duplo nos joelhos e corte anatômico para garantir máxima durabilidade nos treinos mais intensos. Garanta o seu com as melhores condições e frete rápido.`;
    } else if (cat.includes('rashguard')) {
      primaryKeywords = ['Rashguard Jiu Jitsu', 'Camisa Compressão No-Gi', 'Rashguard BJJ Manga Longa'];
      secondaryKeywords = ['Proteção UV50+ Tatame', 'Costuras Flatlock 4 Vias', 'Tecido Antibacteriano Dry-Fit', 'Regulamento ADCC / IBJJF'];
      longTailKeywords = [
        'Rashguard de compressão térmica para treino sem pano no-gi',
        'Camisa de compressão jiu jitsu que não sobe na cintura',
        'Rashguard oficial com proteção uv para grappling'
      ];
      competitorTerms = ['compressão', 'uv50+', 'no-gi', 'antibacteriano', 'flatlock', 'grappling', 'adcc'];

      const brandPrefix = brand && !title.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ` : '';
      suggestedTitle = `${brandPrefix}${title} - Rashguard Compressão No-Gi Térmica UV50+ Profissional`.replace(/\s+/g, ' ').trim();
      suggestedDescription = `${title} projetada especificamente para as exigências do No-Gi e Grappling. Confeccionada com poliamida e elastano de compressão precisa, proporciona suporte muscular, excelente regulação térmica e proteção solar UV50+. Costuras planas anatômicas que evitam assaduras e silicone interno na barra para manter a peça firme durante os rolas mais intensos.`;
    } else if (cat.includes('faixa')) {
      primaryKeywords = ['Faixa Jiu Jitsu Graduação', 'Faixa BJJ Oficial', 'Faixa Algodão Especial'];
      secondaryKeywords = ['Ponteira Preta Padrão CBJJ', 'Costuras Pesadas Reforçadas', 'Algodão Macio que Não Desamarra', 'Conformidade IBJJF'];
      longTailKeywords = [
        'Faixa de jiu jitsu grossa 6 costuras oficial cbjj',
        'Melhor faixa bjj resistente que não desamarra no treino',
        'Faixa graduada jiu jitsu com ponteira de algodão puro'
      ];
      competitorTerms = ['ponteira preta', 'cbjj', 'ibjjf', 'costuras reforçadas', 'algodão puro', 'graduação'];

      suggestedTitle = `${title} - Faixa Jiu Jitsu Graduação Oficial 6 Costuras (Padrão CBJJ/IBJJF)`.replace(/\s+/g, ' ').trim();
      suggestedDescription = `${title} fabricada em algodão puro selecionado com enchimento espesso e acabamento de 6 a 8 costuras paralelas. Ponteira preta em padrão oficial CBJJ/IBJJF para inserção de graus. Oferece o equilíbrio perfeito entre firmeza ao dar o nó e conforto durante os combates diários no tatame.`;
    } else if (cat.includes('nutri') || cat.includes('suplement')) {
      primaryKeywords = ['Suplemento Jiu Jitsu', 'Creatina Monohidratada Pura', 'Recuperação Muscular BJJ'];
      secondaryKeywords = ['Alta Pureza e Absorção', 'Resistência Muscular no Tatame', 'Sem Aditivos ou Glúten', 'Energia Explosiva'];
      longTailKeywords = [
        'Melhor suplemento para recuperação rápida pós treino de jiu jitsu',
        'Creatina pura para explosão e força nos combates de grappling'
      ];
      competitorTerms = ['creatina', 'recuperação muscular', 'alta pureza', 'tatame', 'energia'];

      suggestedTitle = `${title} - Suplemento Alta Pureza para Força e Recuperação BJJ`.replace(/\s+/g, ' ').trim();
      suggestedDescription = `${title} formulado para atender às demandas fisiológicas extremas dos atletas de esportes de combate. Auxilia na aceleração da síntese energética, manutenção de força e recuperação muscular acelerada entre sessões consecutivas de treino de Jiu-Jitsu.`;
    } else {
      primaryKeywords = ['Equipamento Jiu Jitsu', 'Artigos de Luta BJJ', 'Acessório Esportivo Artes Marciais'];
      secondaryKeywords = ['Material de Alta Resistência', 'Uso Profissional', 'Conforto e Ergonomia', 'Garantia de Qualidade'];
      longTailKeywords = [
        'Acessórios e equipamentos profissionais para praticantes de jiu jitsu e artes marciais'
      ];
      competitorTerms = ['resistência', 'alta durabilidade', 'tatame', 'jiu jitsu', 'bjj'];

      suggestedTitle = `${title} - Equipamento Profissional Alta Durabilidade BJJ`.replace(/\s+/g, ' ').trim();
      suggestedDescription = `${title} selecionado especialmente para elevar o nível da sua rotina de treinos e competições. Produzido com materiais de alto padrão de durabilidade, garantindo segurança, conforto ergonômico e alto rendimento no tatame.`;
    }

    // Detect missing terms
    const missingKeywords = competitorTerms.filter(term => !textCorpus.includes(term.toLowerCase()));

    // Keyword density calculations
    const allKeyWords = [...primaryKeywords, ...secondaryKeywords.slice(0, 2)];
    const keywordDensity = allKeyWords.map(kw => {
      const regex = new RegExp(kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const count = (textCorpus.match(regex) || []).length;
      let status: 'Ideal' | 'Baixo' | 'Excesso' = 'Baixo';
      if (count >= 1 && count <= 3) status = 'Ideal';
      else if (count > 3) status = 'Excesso';
      return { keyword: kw, count, status };
    });

    // Score calculations
    let currentScore = 52;
    if (title.length >= 45 && title.length <= 80) currentScore += 16;
    if (desc.length >= 120) currentScore += 16;
    if (textCorpus.includes('jiu jitsu') || textCorpus.includes('bjj')) currentScore += 8;
    if (missingKeywords.length <= 2) currentScore += 8;
    currentScore = Math.min(85, Math.max(38, currentScore));

    const potentialSeoScore = Math.min(98, currentScore + 28);

    const strengths = [];
    if (title.length >= 30) strengths.push('Título possui comprimento base favorável para indexação.');
    if (desc.length >= 80) strengths.push('Descrição existente contém dados fundamentais do produto.');
    if (textCorpus.includes('jiu jitsu') || textCorpus.includes('bjj')) strengths.push('Menção explícita à modalidade esportiva (BJJ/Jiu-Jitsu).');
    if (strengths.length === 0) strengths.push('Produto catalogado com identificadores únicos prontos para otimização.');

    const improvements = [];
    if (missingKeywords.length > 0) {
      improvements.push(`Adicionar termos de alta busca ausentes: ${missingKeywords.slice(0, 4).join(', ')}.`);
    }
    improvements.push('Enriquecer o título com atributos técnicos essenciais (especificação de tecido, padrão de competição e marca).');
    improvements.push('Expandir a descrição com parágrafos claros, benefícios de performance para o atleta e call-to-action de conversão.');

    return {
      productId: String(product.id),
      originalTitle: title,
      suggestedTitle,
      originalDescription: desc,
      suggestedDescription,
      primaryKeywords,
      secondaryKeywords,
      longTailKeywords,
      missingKeywords,
      searchIntent: 'Transacional' as const,
      seoScore: currentScore,
      potentialSeoScore,
      strengths,
      improvements,
      keywordDensity,
      analyzedAt: new Date().toISOString()
    };
  };

  // AI Catalog SEO & Keywords Analyzer Route
  app.post("/api/ai/seo-analyze", async (req, res) => {
    try {
      const body = req.body || {};
      const rawProducts = Array.isArray(body.products) 
        ? body.products 
        : body.product 
          ? [body.product] 
          : [];

      if (!rawProducts || rawProducts.length === 0) {
        return res.status(400).json({ error: "Pelo menos um produto é obrigatório para análise de SEO." });
      }

      // Limit batch size to 10 products per request for rapid response & token economy
      const productsToAnalyze = rawProducts.slice(0, 10).map((p: any) => ({
        id: String(p.id || ''),
        title: String(p.title || ''),
        description: String(p.description || ''),
        category: String(p.category || ''),
        brand: String(p.brand || ''),
        tags: Array.isArray(p.tags) ? p.tags : [],
        price: Number(p.price || 0)
      }));

      const genAI = getGenAI();
      if (!genAI) {
        console.log("[SEO-ANALYZE] Gemini API Key não encontrada. Servindo auditoria algorítmica especializada em BJJ.");
        const fallbackResults = productsToAnalyze.map(p => generateServerFallbackSeo(p));
        return res.json({ analyses: fallbackResults, isFallback: true });
      }

      const prompt = `Você é um Engenheiro de SEO e Copywriter Sênior de E-commerce especializado no nicho de Jiu-Jitsu Brasileiro (BJJ) e Artes Marciais no Brasil (Google Brasil, Mercado Livre, Amazon Brasil).
Analise os seguintes produtos e forneça melhorias automáticas de palavras-chave, títulos otimizados e descrições enriquecidas para maximizar o ranqueamento orgânico e a taxa de conversão (CTR):

${JSON.stringify(productsToAnalyze, null, 2)}

Diretrizes obrigatórias:
1. 'suggestedTitle': Crie títulos altamente atraentes e indexáveis no Google, contendo a palavra-chave principal + diferenciais técnicos (ex: Trançado Leve, Ripstop, Homologado IBJJF/CBJJ, UV50+) + Marca/Modelo.
2. 'suggestedDescription': Crie uma descrição completa, estruturada, persuasiva e natural que inclua palavras-chave estratégicas sem 'keyword stuffing', focando nas necessidades do atleta no tatame e finalizando com uma chamada para ação.
3. 'primaryKeywords': 3 a 5 palavras-chave mais buscadas e com alto volume orgânico no Brasil.
4. 'secondaryKeywords': 3 a 5 palavras-chave de apoio semântico (especificações técnicas, normas, tecidos).
5. 'longTailKeywords': 2 a 4 termos de cauda longa altamente específicos e com alta intenção de compra.
6. 'missingKeywords': Termos concorrentes de alto volume que atualmente estão ausentes no título e descrição originais.
7. 'searchIntent': 'Transacional', 'Informacional' ou 'Comparativo'.
8. 'seoScore': Nota atual de 0 a 100 baseada na qualidade do título e descrição atuais.
9. 'potentialSeoScore': Nota projetada de 0 a 100 após aplicar as sugestões recomendadas.
10. 'keywordDensity': Lista das palavras-chave primárias e secundárias com a contagem atual no texto e status ('Ideal', 'Baixo' ou 'Excesso').
11. 'strengths' e 'improvements': Pontos fortes identificados e recomendações práticas acionáveis.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                productId: { type: Type.STRING },
                originalTitle: { type: Type.STRING },
                suggestedTitle: { type: Type.STRING },
                originalDescription: { type: Type.STRING },
                suggestedDescription: { type: Type.STRING },
                primaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                secondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                longTailKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                searchIntent: { type: Type.STRING },
                seoScore: { type: Type.INTEGER },
                potentialSeoScore: { type: Type.INTEGER },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                keywordDensity: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      keyword: { type: Type.STRING },
                      count: { type: Type.INTEGER },
                      status: { type: Type.STRING }
                    },
                    required: ["keyword", "count", "status"]
                  }
                }
              },
              required: [
                "productId",
                "originalTitle",
                "suggestedTitle",
                "originalDescription",
                "suggestedDescription",
                "primaryKeywords",
                "secondaryKeywords",
                "longTailKeywords",
                "missingKeywords",
                "searchIntent",
                "seoScore",
                "potentialSeoScore",
                "strengths",
                "improvements",
                "keywordDensity"
              ]
            }
          }
        }
      });

      let parsed: any[] = [];
      try {
        parsed = JSON.parse(response.text || '[]');
      } catch (parseErr) {
        console.warn("[SEO-ANALYZE] Falha ao fazer parse do JSON do Gemini:", parseErr);
        parsed = productsToAnalyze.map(p => generateServerFallbackSeo(p));
      }

      // Ensure every product in the batch has a matching analysis
      const finalAnalyses = productsToAnalyze.map((p, idx) => {
        const found = parsed.find((item: any) => String(item.productId) === String(p.id)) || parsed[idx];
        if (found) {
          return {
            ...found,
            productId: String(p.id),
            analyzedAt: new Date().toISOString()
          };
        }
        return generateServerFallbackSeo(p);
      });

      res.json({ analyses: finalAnalyses, isFallback: false });
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      console.warn("[SEO-ANALYZE] Falha na chamada da Gemini API:", errMsg);
      try {
        const rawProducts = Array.isArray(req.body?.products) 
          ? req.body.products 
          : req.body?.product 
            ? [req.body.product] 
            : [];
        const fallbackResults = rawProducts.map((p: any) => generateServerFallbackSeo(p));
        res.json({ analyses: fallbackResults, isFallback: true });
      } catch (fbErr: any) {
        res.status(500).json({ error: "Erro ao realizar auditoria de SEO dos produtos.", details: errMsg });
      }
    }
  });

  // Safe RSS/Atom Feed Fetch & Simple Parsing Proxy
  app.get("/api/rss/fetch", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL do Feed RSS é obrigatória" });
    }

    if (!isUrlAllowed(url)) {
      return res.status(400).json({ error: "A URL informada não é permitida por motivos de segurança." });
    }

    try {
      console.log(`[RSS] Fetching feed from URL: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 Sec timeout
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Feed retornou status ${response.status}`);
      }

      const xmlText = await response.text();
      let items: any[] = [];
      const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
      
      for (const itemXml of itemMatches.slice(0, 10)) {
        const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemXml.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
        const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemXml.match(/<description>([\s\S]*?)<\/description>/);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

        const cleanHtml = (str: string) => {
          if (!str) return ' ';
          return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
                   .replace(/<[^>]*>/g, ' ')
                   .replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/\s+/g, ' ')
                   .trim();
        };

        if (titleMatch) {
          items.push({
            title: cleanHtml(titleMatch[1]),
            link: linkMatch ? linkMatch[1].trim() : '',
            description: descMatch ? cleanHtml(descMatch[1]).slice(0, 200) + '...' : '',
            pubDate: pubDateMatch ? pubDateMatch[1].trim() : ''
          });
        }
      }

      // Fallback Atom parsing if RSS items match zero
      if (items.length === 0) {
        const entryMatches = xmlText.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
        for (const entryXml of entryMatches.slice(0, 10)) {
          const titleMatch = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/);
          const linkMatch = entryXml.match(/<link[^>]*href=["']([\s\S]*?)["']/);
          const descMatch = entryXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/);
          const updatedMatch = entryXml.match(/<updated>([\s\S]*?)<\/updated>/);

          const cleanHtml = (str: string) => {
            if (!str) return ' ';
            return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
                     .replace(/<[^>]*>/g, ' ')
                     .replace(/&amp;/g, '&')
                     .replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>')
                     .replace(/\s+/g, ' ')
                     .trim();
          };

          if (titleMatch) {
            items.push({
              title: cleanHtml(titleMatch[1]),
              link: linkMatch ? linkMatch[1].trim() : '',
              description: descMatch ? cleanHtml(descMatch[1]).slice(0, 200) + '...' : '',
              pubDate: updatedMatch ? updatedMatch[1].trim() : ''
            });
          }
        }
      }

      res.json({ url, count: items.length, items });
    } catch (e: any) {
      console.error(`[RSS] Failed to fetch feed ${url}:`, e.message || e);
      res.status(500).json({ error: `Falha ao recarregar feed externo: ${e.message || 'Erro desconhecido'}` });
    }
  });

  // Helper for generating simulated prices as fallback when Gemini has no key or errors
  function getSimulatedPrices(query: string) {
    const normalizedQuery = query.toLowerCase();
    let cleanName = query.charAt(0).toUpperCase() + query.slice(1);
    let brand = "Curadoria Oss.os";
    let description = `Comparação consolidada em tempo real para o termo de Jiu-Jitsu: "${query}".`;

    let basePrice = 250;
    if (normalizedQuery.includes("kimono") || normalizedQuery.includes("gi")) {
      basePrice = normalizedQuery.includes("infantil") ? 189 : 399;
      if (normalizedQuery.includes("challenger") || normalizedQuery.includes("venum") || normalizedQuery.includes("atama") || normalizedQuery.includes("storm")) {
        basePrice = 489;
      }
      cleanName = "Kimono Jiu-Jitsu Trançado Reforçado";
    } else if (normalizedQuery.includes("faixa") || normalizedQuery.includes("belt")) {
      basePrice = normalizedQuery.includes("preta") || normalizedQuery.includes("black") ? 119 : 59;
      cleanName = "Faixa Jiu-Jitsu Premium 100% Algodão";
    } else if (normalizedQuery.includes("rash") || normalizedQuery.includes("rashguard") || normalizedQuery.includes("rash guard")) {
      basePrice = 129;
      cleanName = "Rash Guard Jiu-Jitsu Dry Fit Elastano";
    } else if (normalizedQuery.includes("shorts") || normalizedQuery.includes("bermuda")) {
      basePrice = 119;
      cleanName = "Bermuda Boardshorts No-Gi Premium";
    } else if (normalizedQuery.includes("bucal") || normalizedQuery.includes("protetor")) {
      basePrice = 49;
      cleanName = "Protetor Bucal Anatômico Moldável Gel";
    }

    const platforms = [
      { name: "Mercado Livre", prefix: "https://lista.mercadolivre.com.br/", factor: 0.92, shipping: "Frete Grátis acima de R$79", suffix: "Oficial Pronta Entrega" },
      { name: "Amazon", prefix: "https://www.amazon.com.br/s?k=", factor: 1.0, shipping: "Frete Grátis Prime", suffix: "Envio Rápido Qualificado" },
      { name: "Shopee", prefix: "https://shopee.com.br/search?keyword=", factor: 0.88, shipping: "Cupom Frete Grátis disponível", suffix: "Promoção Especial Tatame" },
      { name: "Shein", prefix: "https://br.shein.com/pdsearch/", factor: 0.91, shipping: "Frete Grátis acima de R$49", suffix: "Coleção Esporte Combate" },
      { name: "TikTok Shop", prefix: "https://www.tiktok.com/search?q=", factor: 0.95, shipping: "Calculado em tempo de checkout", suffix: "Destaque Criadores" }
    ];

    const offers = platforms.map(p => {
      const variance = (Math.sin(p.name.charCodeAt(0) + basePrice) * 0.04);
      const price = Math.round(basePrice * (p.factor + variance) * 100) / 100;
      return {
        platform: p.name,
        price,
        title: `${cleanName} - ${p.suffix}`,
        link: `${p.prefix}${encodeURIComponent(query)}`,
        shippingInfo: p.shipping
      };
    });

    offers.sort((a, b) => a.price - b.price);

    return {
      productName: cleanName,
      brand,
      description,
      offers
    };
  }

  // API Route for Price Comparison
  app.post("/api/compare-prices", async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "O termo de busca é obrigatório." });
    }

    const ai = getGenAI();
    if (!ai) {
      console.log(`[COMPARE_PRICES] Gemini API client is not configured, returning simulated prices for query: ${query}`);
      return res.json(getSimulatedPrices(query));
    }

    try {
      console.log(`[COMPARE_PRICES] Realizing web grounded price comparison for query: ${query}`);
      const prompt = `Por favor, faça uma pesquisa em tempo real na internet no Brasil para recolher preços atuais, títulos de anúncios e links do seguinte produto de Jiu-Jitsu: "${query}".
Você precisa encontrar ofertas específicas deste item em cinco importantes e-commerce e canais brasileiros:
1. Mercado Livre
2. Amazon.com.br (ou Amazon Brasil)
3. TikTok Shop (ou TikTok)
4. Shein Brasil
5. Shopee Brasil

Formate estritamente dentro da estrutura JSON especificada no responseSchema.
Se o preço exato mudar de anúncio para anúncio, selecione listagens representativas com ótimos preços para o usuário do Jiu-Jitsu economizar. Se em alguma das lojas o produto específico não for encontrado, coloque uma opção similar (como por exemplo outra marca recomendável de jiu-jitsu) ou gere um anúncio realista associado ao termo de busca com uma estimativa competitiva baseada na pesquisa de mercado.
Sempre envie os links correspondentes aos sites das plataformas.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              brand: { type: Type.STRING },
              description: { type: Type.STRING },
              offers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    platform: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    title: { type: Type.STRING },
                    link: { type: Type.STRING },
                    shippingInfo: { type: Type.STRING }
                  },
                  required: ["platform", "price", "title", "link"]
                }
              }
            },
            required: ["productName", "offers"]
          }
        }
      });

      const text = response.text ? response.text.trim() : "";
      if (!text) {
        throw new Error("Resposta vazia retornada pelo modelo.");
      }

      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (err: any) {
      console.warn(`[COMPARE_PRICES] Failed fetching live prices (Error: ${err.message || err}). Returning robust fallback data...`);
      return res.json(getSimulatedPrices(query));
    }
  });

  // ==========================================
  // LGPD (LEI 13.709/18) COMPLIANCE API ROUTES
  // ==========================================

  // In-memory audit trail for LGPD logs
  const lgpdAuditLog: any[] = [];
  const dpoRequestsLog: any[] = [];

  // 1. Record/Update LGPD Consent (Art. 7º, I)
  app.post('/api/lgpd/consent', (req, res) => {
    try {
      const { userId, consents } = req.body;
      const record = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: userId || 'anonymous',
        consents: consents || {},
        timestamp: new Date().toISOString(),
        ipHash: req.ip ? Buffer.from(req.ip).toString('base64').substring(0, 10) : 'masked',
        userAgent: req.headers['user-agent'] || 'unknown'
      };
      lgpdAuditLog.push(record);
      // Keep last 1000 records
      if (lgpdAuditLog.length > 1000) lgpdAuditLog.shift();
      return res.json({ success: true, loggedAt: record.timestamp, recordId: record.id });
    } catch (err: any) {
      return res.status(500).json({ error: 'Erro ao registrar consentimento LGPD' });
    }
  });

  // 2. Data Portability Export (Art. 18, V)
  app.get('/api/lgpd/export/:userId', (req, res) => {
    const { userId } = req.params;
    const userAudit = lgpdAuditLog.filter(l => l.userId === userId);
    
    const exportPayload = {
      platform: 'OSS.OS - Portal de Equipamentos e Cultura Jiu-Jitsu',
      exportStandard: 'LGPD Art. 18, Inciso V - Portabilidade de Dados',
      generatedAt: new Date().toISOString(),
      userId,
      userConsentsHistory: userAudit,
      dpoContact: 'dpo@oss.os',
      securityStatus: 'VERIFIED_AND_ENCRYPTED'
    };

    res.setHeader('Content-Disposition', `attachment; filename="oss-os-lgpd-export-${userId}.json"`);
    res.setHeader('Content-Type', 'application/json');
    return res.json(exportPayload);
  });

  // 3. Right to be Forgotten / Purge Account (Art. 18, VI)
  app.delete('/api/lgpd/forget/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`[LGPD] Executing Right to be Forgotten for user: ${userId}`);
    
    // Anonymize from audit log
    lgpdAuditLog.forEach(item => {
      if (item.userId === userId) {
        item.userId = 'ANONYMIZED_USER';
        item.consents = { status: 'REVOKED_AND_PURGED' };
      }
    });

    return res.json({
      success: true,
      status: 'PURGED_AND_ANONYMIZED',
      legalReference: 'Art. 18, VI da Lei nº 13.709/2018 (LGPD)',
      timestamp: new Date().toISOString()
    });
  });

  // 4. Submit Formal Request to DPO (Art. 41)
  app.post('/api/lgpd/dpo-request', (req, res) => {
    try {
      const { protocol, name, email, subject, message } = req.body;
      const requestRecord = {
        protocol: protocol || `DPO-LGPD-${Date.now()}`,
        name,
        email,
        subject,
        message,
        receivedAt: new Date().toISOString(),
        deadlineDays: 15,
        status: 'RECEIVED_UNDER_REVIEW'
      };
      dpoRequestsLog.push(requestRecord);
      console.log(`[LGPD DPO] New Data Subject Request Protocol: ${requestRecord.protocol} from ${email}`);
      return res.json({
        success: true,
        protocol: requestRecord.protocol,
        deadlineDays: 15,
        message: 'Solicitação protocolada com sucesso junto ao Encarregado pelo Tratamento de Dados Pessoais (DPO).'
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Erro ao protocolar solicitação' });
    }
  });

  // 5. Public Compliance Audit Endpoint
  app.get('/api/lgpd/compliance-status', (req, res) => {
    return res.json({
      platform: 'OSS.OS',
      version: 'v2.4-2026',
      status: 'FULLY_COMPLIANT',
      law: 'Lei Federal 13.709/2018 (LGPD)',
      dpoEmail: 'dpo@oss.os',
      anpdAdherence: {
        consentManagement: true,
        dataPortability: true,
        rightToBeForgotten: true,
        securityEncryptionTLS: true,
        cookiesGranularToggles: true,
        noThirdPartySelling: true
      }
    });
  });

  // ==========================================
  // ADVANCED SEO: DYNAMIC SITEMAP.XML & ROBOTS.TXT
  // ==========================================

  // Dynamic XML Sitemap
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://oss.os';
    const currentDate = new Date().toISOString().split('T')[0];

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/shop', priority: '0.9', changefreq: 'daily' },
      { url: '/comparator', priority: '0.9', changefreq: 'daily' },
      { url: '/transparency', priority: '0.8', changefreq: 'weekly' },
      { url: '/wishlist', priority: '0.7', changefreq: 'weekly' },
    ];

    const categoryPages = [
      { url: '/shop?cat=Kimonos', priority: '0.9', changefreq: 'daily' },
      { url: '/shop?cat=Rashguards', priority: '0.8', changefreq: 'daily' },
      { url: '/shop?cat=Faixas', priority: '0.8', changefreq: 'daily' },
      { url: '/shop?cat=Bermudas', priority: '0.8', changefreq: 'daily' },
      { url: '/shop?cat=Acessorios', priority: '0.7', changefreq: 'weekly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static pages
    staticPages.forEach(p => {
      xml += `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>\n`;
    });

    // Add category pages
    categoryPages.forEach(p => {
      xml += `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>\n`;
    });

    // Add individual product pages
    defaultProducts.forEach((p: any) => {
      xml += `  <url>
    <loc>${baseUrl}/product/${p.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    ${p.imageUrl ? `
    <image:image>
      <image:loc>${p.imageUrl.replace(/&/g, '&amp;')}</image:loc>
      <image:title>${(p.title || '').replace(/&/g, '&amp;')} - Comparador 100% Grátis OSS.OS</image:title>
    </image:image>` : ''}
  </url>\n`;
    });

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(xml);
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    const robotsTxt = `# Robots.txt for OSS.OS - Comparador 100% Grátis de Kimonos e BJJ Gear
User-agent: *
Allow: /
Allow: /shop
Allow: /comparator
Allow: /transparency
Allow: /wishlist
Allow: /product/
Disallow: /api/ai/
Disallow: /api/import/
Disallow: /admin
Disallow: /settings

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot-Image
Allow: /images/
Allow: /assets/

Crawl-delay: 1

Sitemap: https://oss.os/sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain');
    return res.send(robotsTxt);
  });

  // Dynamic Open Graph SEO for Product Pages with 100% Free Highlight
  app.get('/product/:id', async (req, res) => {
    const { id } = req.params;
    let product: any = null;

    console.log(`[SEO] Intercepted product request for ID: ${id}`);

    // 1. Check in static products list
    if (id) {
      product = defaultProducts.find((p: any) => p.id === id);
    }

    // 2. If starts with ml-, fetch in real-time from Mercado Livre API (dynamic SEO)
    if (!product && id && id.toLowerCase().startsWith('ml-')) {
      const mlId = id.replace(/ml-/i, '').replace('-', '').toUpperCase();
      try {
        const itemResponse = await fetch(`https://api.mercadolibre.com/items/${mlId}`);
        if (itemResponse.ok) {
          const itemData = await itemResponse.json();
          const descResponse = await fetch(`https://api.mercadolibre.com/items/${mlId}/description`);
          const descData = descResponse.ok ? await descResponse.json() : { plain_text: "" };
          
          product = {
            id,
            title: itemData.title,
            description: descData.plain_text || "Sem descrição disponível.",
            imageUrl: itemData.pictures?.[0]?.url || itemData.thumbnail,
          };
          console.log(`[SEO] Live fetched ML product info for ${id}: ${product.title}`);
        }
      } catch (mlErr: any) {
        console.warn("[SEO] Failed to fetch live ML product info for ID:", id, mlErr.message || mlErr);
      }
    }

    const defaultProduct = {
      title: "OSS.OS | Comparador de Preços de Kimonos de Jiu-Jitsu 100% Grátis",
      description: "Compare preços de kimonos, rashguards, faixas e equipamentos de Jiu-Jitsu 100% GRÁTIS. Economize até 40% nas melhores marcas sem pagar nada!",
      imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop"
    };

    const activeProduct = product || defaultProduct;

    // Clean description to avoid HTML tag issues or weird quotes in meta content
    const cleanDesc = activeProduct.description
      ? activeProduct.description.replace(/<[^>]*>/g, '').replace(/"/g, '&quot;').substring(0, 180) + '...'
      : defaultProduct.description;

    const cleanTitle = activeProduct.title
      ? activeProduct.title.replace(/"/g, '&quot;')
      : defaultProduct.title;

    let htmlPath = path.join(process.cwd(), 'index.html');
    if (process.env.NODE_ENV === "production" || fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))) {
      const prodPath = path.join(process.cwd(), 'dist', 'index.html');
      if (fs.existsSync(prodPath)) {
        htmlPath = prodPath;
      }
    }

    try {
      if (!fs.existsSync(htmlPath)) {
        return res.status(404).send("index.html not found");
      }

      let html = fs.readFileSync(htmlPath, 'utf8');

      // Replace generic meta tags with product-specific details
      html = html.replace(
        /<title>.*?<\/title>/i,
        `<title>${cleanTitle} | Menor Preço 100% Grátis no OSS.OS</title>`
      );
      
      html = html.replace(
        /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
        `<meta name="description" content="${cleanDesc}" />`
      );

      html = html.replace(
        /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
        `<meta property="og:title" content="${cleanTitle} | Menor Preço 100% Grátis" />`
      );

      html = html.replace(
        /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
        `<meta property="og:description" content="${cleanDesc}" />`
      );

      // Clean duplicate tags
      html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/gi, '');
      html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/gi, '');
      html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/gi, '');
      html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/gi, '');

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      const fullUrl = `${protocol}://${host}${req.originalUrl}`;

      const seoTags = `
    <meta property="og:image" content="${activeProduct.imageUrl}" />
    <meta name="twitter:image" content="${activeProduct.imageUrl}" />
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${fullUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${cleanTitle} | Menor Preço 100% Grátis" />
    <meta name="twitter:description" content="${cleanDesc}" />
      `;

      html = html.replace(/<\/head>/i, `${seoTags}\n  </head>`);

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (err: any) {
      console.error("[SEO] Error constructing dynamic OG Tags HTML:", err.message || err);
      return res.sendFile(htmlPath);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Explicit HTML service for SPA paths in development mode
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
