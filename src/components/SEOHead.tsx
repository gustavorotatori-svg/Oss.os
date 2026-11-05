import React, { useEffect } from 'react';
import { Product } from '../types';
import { 
  generateProductSchema, 
  generateCatalogItemListSchema, 
  injectProductJsonLd, 
  removeProductJsonLd 
} from '../lib/schemaOrg';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  currentView?: string;
  selectedProduct?: Product | null;
  selectedCategory?: string;
  searchQuery?: string;
  products?: Product[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  currentView = 'LANDING',
  selectedProduct,
  selectedCategory,
  searchQuery,
  products
}) => {
  useEffect(() => {
    // 1. Determine dynamic title, description, keywords, image, and canonical URL
    let dynamicTitle = 'OSS.OS | Comparador de Preços de Kimonos de Jiu-Jitsu 100% Grátis';
    let dynamicDesc = 'Compare preços de kimonos, rashguards, faixas e equipamentos de Jiu-Jitsu 100% GRÁTIS. Economize até 40% nas melhores marcas: Atama, Koral, KVRA, Venum, StormStrong, Kingz sem pagar nada!';
    let dynamicKeywords = 'comparador de kimonos jiu jitsu gratis, preco kimono bjj, kimono jiu jitsu barato, comprar kimono jiu jitsu menor preco, rashguard bjj gratis, tabela de medidas kimono jiu jitsu, portal do atleta bjj, dojos jiu jitsu brasil';
    let dynamicUrl = typeof window !== 'undefined' ? window.location.href : 'https://oss.os';
    let dynamicImage = ogImage || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop';
    let effectiveOgType = ogType;

    // View-specific and product-specific overrides
    if (selectedProduct) {
      effectiveOgType = 'product';
      const formattedPrice = selectedProduct.price ? `R$ ${selectedProduct.price.toFixed(2)}` : 'Preço Especial';
      const brandStr = selectedProduct.brand ? ` (${selectedProduct.brand})` : '';
      const productTitle = selectedProduct.seoOptimizedTitle || selectedProduct.title;
      
      dynamicTitle = `${productTitle}${brandStr} | Menor Preço 100% Grátis no OSS.OS`;
      dynamicDesc = selectedProduct.seoOptimizedDescription || `Compare o menor preço para ${selectedProduct.title}. Ofertas a partir de ${formattedPrice} em lojas oficiais e marketplaces. Comparação 100% gratuita, ficha técnica completa e histórico de preços no OSS.OS.`;
      
      let kwStr = '';
      if (Array.isArray(selectedProduct.seoKeywords) && selectedProduct.seoKeywords.length > 0) {
        kwStr = selectedProduct.seoKeywords.join(', ');
      } else if (typeof selectedProduct.seoKeywords === 'string') {
        kwStr = selectedProduct.seoKeywords;
      }
      dynamicKeywords = kwStr || `${selectedProduct.title}, kimono ${selectedProduct.brand || 'bjj'}, preco ${selectedProduct.title}, comprar ${selectedProduct.title}, ficha tecnica kimono, comparador kimono jiu jitsu`;
      
      if (selectedProduct.imageUrl) {
        dynamicImage = selectedProduct.imageUrl;
      }
    } else if (currentView === 'SHOP') {
      if (searchQuery && searchQuery.trim().length > 0) {
        dynamicTitle = `Resultados para "${searchQuery}" em Kimonos e BJJ Gear | OSS.OS`;
        dynamicDesc = `Compare preços e encontre ofertas para "${searchQuery}" em equipamentos de Jiu-Jitsu no OSS.OS 100% gratuito.`;
        dynamicKeywords = `busca ${searchQuery}, comprar ${searchQuery}, precos ${searchQuery}, kimono jiu jitsu`;
      } else if (selectedCategory && selectedCategory.toLowerCase() !== 'all' && selectedCategory !== 'Todos') {
        dynamicTitle = `Preços de ${selectedCategory} de Jiu-Jitsu 100% Grátis | OSS.OS`;
        dynamicDesc = `Encontre as melhores ofertas e compare preços de ${selectedCategory} para Jiu-Jitsu 100% Grátis. Economize até 40% nas marcas líderes do tatame.`;
        dynamicKeywords = `${selectedCategory} jiu jitsu, precos ${selectedCategory} bjj, comprar ${selectedCategory} menor preco, promocoes ${selectedCategory}`;
      } else {
        dynamicTitle = 'Catálogo & Comparador de Kimonos e Equipamentos BJJ 100% Grátis | OSS.OS';
        dynamicDesc = 'Explore o maior catálogo gratuito de kimonos, rashguards, faixas, bermudas no-gi e suplementos para Jiu-Jitsu do Brasil. Comparação de preços em tempo real!';
        dynamicKeywords = 'catalogo kimonos jiu jitsu, rashguard bjj, faixas graduacao jiu jitsu, fight shorts, comparador precos tatame';
      }
    } else if (currentView === 'COMPARATOR') {
      dynamicTitle = 'Comparador Técnico de Kimonos e Faixas de Jiu-Jitsu 100% Grátis | OSS.OS';
      dynamicDesc = 'Compare lado a lado gramatura (GSM), tecido trançado, tipo de lapela, calça ripstop e preços de múltiplos kimonos de Jiu-Jitsu sem pagar nada.';
      dynamicKeywords = 'comparador tecnico kimono, gramatura gsm kimono, comparativo kimonos bjj, kimono trancado leve vs pesado';
    } else if (currentView === 'TRANSPARENCY') {
      dynamicTitle = 'Transparência 100% & Impacto Social no Jiu-Jitsu | OSS.OS';
      dynamicDesc = 'Conheça o compromisso de transparência do OSS.OS: plataforma 100% gratuita onde 10% dos resultados são reinvestidos em doação de kimonos para projetos sociais de BJJ.';
      dynamicKeywords = 'impacto social jiu jitsu, doacao de kimonos projetos sociais, transparencia bjj, portal gratuito jiu jitsu';
    } else if (currentView === 'DOJOS') {
      dynamicTitle = 'Guia de Dojos & Academias de Jiu-Jitsu no Brasil | OSS.OS';
      dynamicDesc = 'Encontre dojos, horários de treino e academias de Jiu-Jitsu verificadas em todo o Brasil. Cadastre sua academia gratuitamente no mapa da arte suave.';
      dynamicKeywords = 'academias jiu jitsu brasil, dojos bjj, onde treinar jiu jitsu, horarios treino jiu jitsu, mapa de academias bjj';
    } else if (currentView === 'ACERVO') {
      dynamicTitle = 'Acervo Histórico & Curadoria de Kimonos Raros BJJ | OSS.OS';
      dynamicDesc = 'Explore o acervo histórico com kimonos icônicos, edições limitadas e modelos clássicos que marcaram gerações do Jiu-Jitsu mundial.';
      dynamicKeywords = 'acervo kimonos bjj, kimonos classicos historicos, edicoes limitadas kimono, historia do kimono jiu jitsu';
    } else if (currentView === 'BLOG') {
      dynamicTitle = 'Blog do Atleta BJJ: Dicas Técnicas, Reviews & Filosofia | OSS.OS';
      dynamicDesc = 'Artigos sobre técnicas de Jiu-Jitsu, resenhas de equipamentos, preparação física, nutrição esportiva e reflexões estoicas para atletas.';
      dynamicKeywords = 'blog jiu jitsu, dicas treino bjj, resenha kimono jiu jitsu, estoicismo tatame, preparacao fisica bjj';
      effectiveOgType = 'article';
    } else if (currentView === 'COMMUNITY') {
      dynamicTitle = 'Comunidade & Fórum de Atletas de Jiu-Jitsu | OSS.OS';
      dynamicDesc = 'Conecte-se com praticantes e professores de Jiu-Jitsu de todo o país para trocar experiências sobre equipamentos, treinos e campeonatos.';
      dynamicKeywords = 'comunidade jiu jitsu, forum bjj brasil, discussao kimonos, duvidas treino bjj';
    } else if (currentView === 'WISHLIST') {
      dynamicTitle = 'Minha Lista de Desejos & Alertas de Preço BJJ | OSS.OS';
      dynamicDesc = 'Monitore seus kimonos e equipamentos favoritos com alertas automáticos de queda de preço e cupons no OSS.OS.';
      dynamicKeywords = 'lista desejos kimono, alerta preco kimono jiu jitsu, radar promocoes bjj';
    } else if (currentView === 'ANALYTICS') {
      dynamicTitle = 'Radar de Preços & Tendências de Mercado BJJ | OSS.OS';
      dynamicDesc = 'Acompanhe a variação histórica de preços de kimonos, marcas em alta e índices de valorização no mercado nacional de Jiu-Jitsu.';
      dynamicKeywords = 'historico precos kimono, variacao precos bjj, radar mercado jiu jitsu';
    } else if (currentView === 'PROFILE') {
      dynamicTitle = 'Perfil do Atleta & Histórico de Graduação | OSS.OS';
      dynamicDesc = 'Gerencie seus treinos, graduação na faixa, histórico de check-ins e pontos no OSS.OS.';
    } else if (currentView === 'DEALS') {
      dynamicTitle = 'Melhores Ofertas & Promoções de Kimonos de Jiu-Jitsu | OSS.OS';
      dynamicDesc = 'Descubra os maiores descontos, liquidações e cupons promocionais para economizar na compra do seu kimono e equipamentos de Jiu-Jitsu.';
      dynamicKeywords = 'ofertas kimono jiu jitsu, desconto kimono bjj, promocoes rashguard, cupons de desconto bjj';
    }

    // Direct prop overrides
    if (title) dynamicTitle = title;
    if (description) dynamicDesc = description;
    if (keywords) dynamicKeywords = keywords;

    // 2. Update document title
    document.title = dynamicTitle;

    // Helper to safely set or update a meta tag
    const setMetaTag = (selector: string, attributeName: string, attributeValue: string, contentValue: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Standard meta tags
    setMetaTag('meta[name="description"]', 'name', 'description', dynamicDesc);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', dynamicKeywords);
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('meta[name="author"]', 'name', 'author', 'OSS.OS Jiu-Jitsu Community');
    setMetaTag('meta[name="theme-color"]', 'name', 'theme-color', '#000000');

    // Open Graph meta tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', dynamicTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', dynamicDesc);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', dynamicUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', effectiveOgType);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', dynamicImage);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'OSS.OS Jiu-Jitsu');
    setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'pt_BR');

    // Product specific Open Graph tags if viewing a product
    if (selectedProduct) {
      setMetaTag('meta[property="product:price:amount"]', 'property', 'product:price:amount', String(selectedProduct.price || 0));
      setMetaTag('meta[property="product:price:currency"]', 'property', 'product:price:currency', 'BRL');
      if (selectedProduct.brand) {
        setMetaTag('meta[property="product:brand"]', 'property', 'product:brand', selectedProduct.brand);
      }
      if (selectedProduct.category) {
        setMetaTag('meta[property="product:category"]', 'property', 'product:category', selectedProduct.category);
      }
      setMetaTag('meta[property="product:availability"]', 'property', 'product:availability', 'in stock');
    }

    // Twitter Card meta tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', dynamicTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', dynamicDesc);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', dynamicImage);
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', '@ossos_bjj');

    // Update Canonical URL link tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl || dynamicUrl);

    // 3. Inject Rich JSON-LD Structured Data
    const injectJSONLD = () => {
      const scriptId = 'oss-dynamic-jsonld';
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }

      const structuredData: any = {
        '@context': 'https://schema.org',
        '@graph': [
          // WebSite Schema with SearchAction
          {
            '@type': 'WebSite',
            '@id': 'https://oss.os/#website',
            'url': 'https://oss.os/',
            'name': 'OSS.OS | Comparador de Preços de Kimonos de Jiu-Jitsu 100% Grátis',
            'description': 'Portal e comparador de preços de kimonos, rashguards, faixas e equipamentos de Jiu-Jitsu 100% gratuito.',
            'potentialAction': {
              '@type': 'SearchAction',
              'target': 'https://oss.os/?search={search_term_string}',
              'query-input': 'required name=search_term_string'
            },
            'inLanguage': 'pt-BR'
          },
          // Organization Schema
          {
            '@type': 'Organization',
            '@id': 'https://oss.os/#organization',
            'name': 'OSS.OS Jiu-Jitsu',
            'url': 'https://oss.os/',
            'logo': {
              '@type': 'ImageObject',
              'url': 'https://oss.os/apple-touch-icon.png'
            },
            'description': 'Plataforma de curadoria, comparação transparente e impacto social para praticantes de Jiu-Jitsu.',
            'contactPoint': {
              '@type': 'ContactPoint',
              'contactType': 'Data Protection Officer & Support',
              'email': 'contato@oss.os',
              'availableLanguage': ['Portuguese', 'English']
            }
          },
          // WebApplication Schema
          {
            '@type': 'WebApplication',
            '@id': 'https://oss.os/#app',
            'name': 'OSS.OS Comparador de Kimonos',
            'applicationCategory': 'SportsApplication',
            'operatingSystem': 'All',
            'isAccessibleForFree': true,
            'offers': {
              '@type': 'Offer',
              'price': '0.00',
              'priceCurrency': 'BRL',
              'availability': 'https://schema.org/InStock',
              'description': 'Acesso 100% gratuito e ilimitado para atletas e praticantes de Jiu-Jitsu.'
            }
          },
          // FAQPage Schema
          {
            '@type': 'FAQPage',
            '@id': 'https://oss.os/#faq',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'O comparador de preços do OSS.OS é 100% gratuito?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Sim! O OSS.OS é totalmente gratuito para atletas, praticantes e professores de Jiu-Jitsu. Você pode buscar, comparar preços de kimonos, conferir medidas e receber alertas sem pagar nenhuma taxa.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Como funciona a comparação de preços de kimonos de Jiu-Jitsu?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'O OSS.OS monitora os preços dos principais marketplaces (Mercado Livre, Shopee, Amazon) e lojas oficiais especializadas (Atama, KVRA, Koral, Venum, StormStrong, Kingz), indicando onde o kimono está com o menor preço.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Como o OSS.OS contribui com projetos sociais de Jiu-Jitsu?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'O OSS.OS destina 10% de seus resultados para doação de kimonos, faixas e custeio de inscrições em campeonatos para crianças e jovens em projetos sociais de BJJ.'
                }
              }
            ]
          }
        ]
      };

      // 1. Dynamic Product Schema for each item in the catalog & ItemList Schema
      const safeProducts = products || [];
      if (safeProducts.length > 0) {
        // Append ItemList schema representing the full catalog for Google Rich Snippets / Carousel
        const itemListSchema = generateCatalogItemListSchema(safeProducts, {
          baseUrl: 'https://oss.os',
          includeContext: false
        });
        if (itemListSchema) {
          structuredData['@graph'].push(itemListSchema);
        }

        // Append dynamic Product schema for every item in the catalog
        safeProducts.forEach((prod) => {
          const productSchema = generateProductSchema(prod, {
            baseUrl: 'https://oss.os',
            includeContext: false
          });
          if (productSchema) {
            structuredData['@graph'].push(productSchema);
          }
        });
      }

      // 2. If viewing a specific product, append/highlight selected Product schema and Breadcrumbs
      if (selectedProduct) {
        const selectedProductSchema = generateProductSchema(selectedProduct, {
          baseUrl: 'https://oss.os',
          includeContext: false
        });

        if (selectedProductSchema) {
          const existingIdx = structuredData['@graph'].findIndex(
            (item: any) => item['@type'] === 'Product' && item['@id'] === selectedProductSchema['@id']
          );
          if (existingIdx >= 0) {
            structuredData['@graph'][existingIdx] = selectedProductSchema;
          } else {
            structuredData['@graph'].push(selectedProductSchema);
          }
        }

        // BreadcrumbList for Product
        structuredData['@graph'].push({
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Início',
              'item': 'https://oss.os/'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Loja & Equipamentos',
              'item': 'https://oss.os/#shop'
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': selectedProduct.category || 'Kimonos',
              'item': `https://oss.os/#category-${encodeURIComponent(selectedProduct.category || 'kimonos')}`
            },
            {
              '@type': 'ListItem',
              'position': 4,
              'name': selectedProduct.title,
              'item': `https://oss.os/?product=${encodeURIComponent(selectedProduct.id)}`
            }
          ]
        });
      }

      script.textContent = JSON.stringify(structuredData);
    };

    injectJSONLD();

    // Dynamically inject/clean the dedicated Product JSON-LD script for Google Rich Results
    if (selectedProduct) {
      injectProductJsonLd(selectedProduct);
    } else {
      removeProductJsonLd();
    }

    return () => {
      if (!selectedProduct) {
        removeProductJsonLd();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, currentView, selectedProduct, selectedCategory, searchQuery, products]);

  return null;
};

export default SEOHead;
