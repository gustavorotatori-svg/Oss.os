import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface BJJImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  containerClassName?: string;
  fallback?: string;
  aspectRatio?: string;
  imgClassName?: string;
  quality?: number;
  priority?: boolean;
  widthForce?: number;
  srcSet?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Utility to parse and append/replace 'w' and 'q' parameters in image CDN URLs (e.g., Unsplash, Cloudinary, Imgix)
 */
export const getOptimizedImageUrl = (url: string, width: number, quality: number = 80): string => {
  if (!url) return '';
  
  // Unsplash CDN parameter optimization
  if (url.includes('unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      if (!urlObj.searchParams.has('auto')) {
        urlObj.searchParams.set('auto', 'format');
      }
      if (!urlObj.searchParams.has('fit')) {
        urlObj.searchParams.set('fit', 'crop');
      }
      return urlObj.toString();
    } catch {
      let optimized = url;
      if (optimized.includes('w=')) {
        optimized = optimized.replace(/w=\d+/, `w=${width}`);
      } else {
        optimized += (optimized.includes('?') ? '&' : '?') + `w=${width}`;
      }
      if (optimized.includes('q=')) {
        optimized = optimized.replace(/q=\d+/, `q=${quality}`);
      } else {
        optimized += `&q=${quality}`;
      }
      return optimized;
    }
  }

  // Cloudinary / Imgix optimization
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
  }

  return url;
};

/**
 * Generates a standard responsive srcSet string for device-optimized resolutions:
 * (Mobile: 320w, 480w, 640w | Tablet: 768w, 1024w | Desktop: 1280w, 1600w, 1920w)
 */
export const generateSrcSet = (url: string, quality: number = 80): string => {
  if (!url || (!url.includes('unsplash.com') && !url.includes('cloudinary.com'))) {
    return '';
  }
  
  const widths = [320, 480, 640, 768, 1024, 1280, 1600, 1920];
  return widths
    .map((w) => `${getOptimizedImageUrl(url, w, quality)} ${w}w`)
    .join(', ');
};

const OFFLINE_BJJ_PLACEHOLDER = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%2309090b'/%3E%3Ccircle cx='200' cy='180' r='48' fill='%2318181b' stroke='%233f3f46' stroke-width='2'/%3E%3Ctext x='200' y='188' text-anchor='middle' font-family='monospace' font-size='22' font-weight='900' fill='%23ef4444'%3EOSS%3C/text%3E%3Ctext x='200' y='255' text-anchor='middle' font-family='monospace' font-size='12' font-weight='900' fill='%23ffffff' letter-spacing='2'%3ETATAME OFFLINE%3C/text%3E%3Ctext x='200' y='275' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%23a1a1aa'%3EEquipamento BJJ em Cache%3C/text%3E%3C/svg%3E";

export const BJJImage: React.FC<BJJImageProps> = ({ 
  src, 
  alt, 
  containerClassName = "",
  fallback = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
  className = "",
  imgClassName = "",
  aspectRatio = "aspect-square",
  quality = 80,
  priority = false,
  widthForce,
  srcSet,
  loading,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Automatic lazy loading determination: default to 'lazy' unless 'eager' or priority is explicitly requested
  const resolvedLoading: 'lazy' | 'eager' = loading ?? (priority ? 'eager' : 'lazy');

  // Support both containerClassName and className for backwards compatibility
  const finalContainerClass = containerClassName || className || "";
  const finalImgClass = imgClassName || "w-full h-full object-cover transition-all duration-700 grayscale hover:grayscale-0";

  // Check if image is an invalid/banned food image
  const isBannable = (url: string) => {
    const lower = url?.toLowerCase() || '';
    return lower.includes('hotdog') || lower.includes('food') || lower.includes('burger') || lower.includes('pizza') || lower.includes('sandwich');
  };

  // Compute final optimized source
  const finalSrc = useMemo(() => {
    if (hasError && isOffline) {
      return OFFLINE_BJJ_PLACEHOLDER;
    }
    const rawSrc = hasError || !src || isBannable(src) ? fallback : src;
    if (widthForce) {
      return getOptimizedImageUrl(rawSrc, widthForce, quality);
    }
    if (rawSrc.includes('unsplash.com')) {
      return getOptimizedImageUrl(rawSrc, 800, quality);
    }
    return rawSrc;
  }, [src, fallback, widthForce, quality, hasError, isOffline]);

  // Compute responsive srcSet (use passed srcSet or generate automatically for optimized CDN images)
  const computedSrcSet = useMemo(() => {
    if (srcSet) return srcSet;
    if (widthForce || !src || hasError || isBannable(src)) {
      return undefined;
    }
    const generated = generateSrcSet(src, quality);
    return generated.length > 0 ? generated : undefined;
  }, [src, srcSet, widthForce, quality, hasError]);

  // Lightweight progressive blur placeholder
  const placeholderSrc = useMemo(() => {
    const base = !src || isBannable(src) ? fallback : src;
    if (base.includes('unsplash.com')) {
      return getOptimizedImageUrl(base, 24, 15) + '&blur=10';
    }
    return "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%2318181b'/%3E%3Ccircle cx='20' cy='20' r='10' fill='none' stroke='%2322c55e' stroke-width='1' opacity='0.3'/%3E%3C/svg%3E";
  }, [src, fallback]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div className={`group relative overflow-hidden bg-zinc-100 dark:bg-zinc-950 ${aspectRatio} ${finalContainerClass}`}>
      {/* Blur-up low-resolution placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.img
            key="placeholder"
            src={placeholderSrc}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none scale-105"
            style={{ filter: 'blur(8px)' }}
          />
        )}
      </AnimatePresence>

      {/* Main responsive image with automatic lazy loading & srcset */}
      <motion.img
        src={finalSrc}
        srcSet={computedSrcSet}
        sizes={computedSrcSet ? sizes : undefined}
        alt={alt}
        loading={resolvedLoading}
        decoding="async"
        referrerPolicy="no-referrer"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 1.03
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`w-full h-full object-cover ${finalImgClass}`}
        {...props}
      />

      {/* Subtle hover overlay effect */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-tr from-black/20 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      />
    </div>
  );
};

export default BJJImage;
