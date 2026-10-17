import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, X, Check, Copy, MessageCircle, Send, 
  ExternalLink, Sparkles, QrCode, Mail, Smartphone,
  Flame, ShoppingBag, ShieldCheck, Twitter, Facebook
} from 'lucide-react';
import { Product, ProductOffer } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  selectedOffer?: ProductOffer | null;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedOffer
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [customTag, setCustomTag] = useState<string>('tatame');

  // Compute best price and shareable URL
  const shareDetails = useMemo(() => {
    if (!product) return null;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oss-os.app';
    const cleanUrl = `${origin}/?product=${product.id}`;
    const bestPrice = selectedOffer ? selectedOffer.price : product.price;
    const storeName = selectedOffer ? selectedOffer.storeName : (product.platform || 'Melhor Oferta');
    const formattedPrice = `R$ ${bestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    const discountTag = product.originalPrice && product.originalPrice > bestPrice
      ? ` (Economia de R$ ${(product.originalPrice - bestPrice).toFixed(2)})`
      : '';

    const shareText = `🥋 *Oferta BJJ no OSS.OS*: ${product.title} por apenas *${formattedPrice}* na ${storeName}${discountTag}! Confira no comparador inteligente:`;
    
    return {
      url: cleanUrl,
      price: formattedPrice,
      store: storeName,
      text: shareText,
      encodedText: encodeURIComponent(`${shareText} ${cleanUrl}`),
      encodedUrl: encodeURIComponent(cleanUrl),
      rawTextOnly: shareText
    };
  }, [product, selectedOffer]);

  if (!isOpen || !product || !shareDetails) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareDetails.url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleCopyFullMessage = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${shareDetails.text}\n${shareDetails.url}`).then(() => {
        setCopiedMessage(true);
        setTimeout(() => setCopiedMessage(false), 2500);
      });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Oferta: ${product.title} - OSS.OS`,
          text: shareDetails.text,
          url: shareDetails.url
        });
      } catch (err) {
        // User cancelled or share not supported
      }
    } else {
      handleCopyLink();
    }
  };

  // Social Links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareDetails.encodedText}`;
  const telegramUrl = `https://t.me/share/url?url=${shareDetails.encodedUrl}&text=${encodeURIComponent(shareDetails.text)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareDetails.text)}&url=${shareDetails.encodedUrl}&hashtags=BJJ,JiuJitsu,Kimonos,OSS`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareDetails.encodedUrl}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(`🥋 Oferta de Equipamento BJJ: ${product.title}`)}&body=${shareDetails.encodedText}`;

  // QR Code generator URL (using reliable public image provider for QR generation)
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareDetails.url)}&color=0-0-0&bgcolor=255-255-255`;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
        id="social-share-backdrop"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.08)] p-6 text-black dark:text-white my-8 overflow-hidden rounded-none"
          onClick={(e) => e.stopPropagation()}
          id="social-share-modal"
        >
          {/* Header Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-600 via-emerald-400 to-green-600" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            id="btn-close-share-modal"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>

          {/* Title & Badge */}
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
              <Share2 size={14} />
            </span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-green-600 dark:text-green-400">
              // DIVULGAR OFERTA
            </span>
          </div>

          <h3 className="font-sans font-black text-lg uppercase tracking-tight text-black dark:text-white mb-4">
            Compartilhar nas Redes Sociais
          </h3>

          {/* Product Preview Card */}
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 mb-5">
            <div className="w-16 h-16 shrink-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
              <img 
                src={product.imageUrl} 
                alt={product.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 bg-black text-white text-[7px] font-mono font-black px-1">
                OSS
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest block truncate">
                {shareDetails.store} • {product.category}
              </span>
              <p className="font-bold text-xs line-clamp-1 text-black dark:text-white">
                {product.title}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-black font-mono text-green-600 dark:text-green-400">
                  {shareDetails.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[9px] font-mono text-zinc-400 line-through">
                    R$ {product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-[7.5px] font-mono font-black uppercase bg-green-500/10 text-green-600 px-1 py-0.5 ml-auto">
                  Melhor Preço
                </span>
              </div>
            </div>
          </div>

          {/* Social Network Action Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 transition-all duration-200 group text-center cursor-pointer"
              id="share-whatsapp-btn"
            >
              <MessageCircle size={20} className="mb-1.5 transition-transform group-hover:scale-110" />
              <span className="text-[9px] font-mono font-black uppercase tracking-wider">
                WhatsApp
              </span>
              <span className="text-[7px] opacity-70 group-hover:opacity-100 font-mono">
                Grupos BJJ
              </span>
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border border-[#229ED9]/30 transition-all duration-200 group text-center cursor-pointer"
              id="share-telegram-btn"
            >
              <Send size={20} className="mb-1.5 transition-transform group-hover:scale-110" />
              <span className="text-[9px] font-mono font-black uppercase tracking-wider">
                Telegram
              </span>
              <span className="text-[7px] opacity-70 group-hover:opacity-100 font-mono">
                Canais
              </span>
            </a>

            {/* X / Twitter */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-black dark:hover:bg-white text-zinc-700 dark:text-zinc-300 hover:text-white dark:hover:text-black border border-zinc-300 dark:border-zinc-800 transition-all duration-200 group text-center cursor-pointer"
              id="share-twitter-btn"
            >
              <Twitter size={20} className="mb-1.5 transition-transform group-hover:scale-110" />
              <span className="text-[9px] font-mono font-black uppercase tracking-wider">
                X / Twitter
              </span>
              <span className="text-[7px] opacity-70 group-hover:opacity-100 font-mono">
                Postar
              </span>
            </a>

            {/* Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 transition-all duration-200 group text-center cursor-pointer"
              id="share-facebook-btn"
            >
              <Facebook size={20} className="mb-1.5 transition-transform group-hover:scale-110" />
              <span className="text-[9px] font-mono font-black uppercase tracking-wider">
                Facebook
              </span>
              <span className="text-[7px] opacity-70 group-hover:opacity-100 font-mono">
                Timeline
              </span>
            </a>
          </div>

          {/* Quick Actions Bar */}
          <div className="space-y-3">
            {/* Copy Link Direct Input */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <input
                type="text"
                readOnly
                value={shareDetails.url}
                className="flex-1 bg-transparent px-2.5 py-1 text-[9px] font-mono text-zinc-600 dark:text-zinc-300 outline-none select-all truncate"
              />
              <Button
                onClick={handleCopyLink}
                size="sm"
                className={`rounded-none font-mono font-black text-[9px] uppercase tracking-wider px-3 transition-colors ${
                  copied 
                    ? 'bg-green-600 hover:bg-green-600 text-white' 
                    : 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200'
                }`}
                id="btn-copy-share-url"
              >
                {copied ? (
                  <>
                    <Check size={11} className="mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={11} className="mr-1" />
                    Copiar Link
                  </>
                )}
              </Button>
            </div>

            {/* Extra Secondary Action Buttons: Native Share + QR Code + Copy Message */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleNativeShare}
                className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[8px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Abrir menu de compartilhamento do aparelho"
                id="btn-native-share"
              >
                <Smartphone size={12} />
                <span>Nativo</span>
              </button>

              <button
                onClick={handleCopyFullMessage}
                className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[8px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Copiar mensagem completa formatada com emojis"
                id="btn-copy-full-text"
              >
                {copiedMessage ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                <span>{copiedMessage ? 'Copiada!' : 'Mensagem'}</span>
              </button>

              <button
                onClick={() => setShowQrCode(!showQrCode)}
                className={`p-2 border text-[8px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  showQrCode 
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                }`}
                title="Mostrar QR Code para escanear no tatame"
                id="btn-toggle-qrcode"
              >
                <QrCode size={12} />
                <span>QR Code</span>
              </button>
            </div>

            {/* QR Code Reveal Panel */}
            <AnimatePresence>
              {showQrCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800 text-center"
                >
                  <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                    Aponte a câmera do celular para abrir a oferta
                  </p>
                  <div className="inline-block p-2 bg-white border border-zinc-300 shadow-md">
                    <img 
                      src={qrCodeImageUrl} 
                      alt="QR Code da Oferta"
                      className="w-36 h-36 mx-auto block"
                    />
                  </div>
                  <p className="text-[7.5px] font-mono text-zinc-500 mt-2">
                    Ideal para compartilhar em academias e tatames parceiros.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Transparency Badge */}
          <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[7.5px] font-mono text-zinc-400 uppercase">
            <span className="flex items-center gap-1">
              <ShieldCheck size={11} className="text-green-500" />
              Link verificado com melhor preço
            </span>
            <span>OSS.OS Gear Monitor</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
