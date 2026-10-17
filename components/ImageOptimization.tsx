import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageOptimizationProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  containerClassName?: string;
  fallback?: string;
  aspectRatio?: string;
  quality?: number;
  priority?: boolean;
  /** Force a specific width instead of generating a responsive srcSet */
  widthForce?: number;
}

/**
 * Utility to parse and append/replace 'w' and 'q' parameters in Unsplash URLs
 */
export const getOptimizedUnsplashUrl = (url: string, width: number, quality: number = 80): string => {
  if (!url) return '';
  if (!url.includes('unsplash.com')) return url;

  try {
    const urlObj = new URL(url);
    
    // Set or update width parameter
    urlObj.searchParams.set('w', width.toString());
    
    // Set or update quality parameter
    urlObj.searchParams.set('q', quality.toString());
    
    // Ensure optimal format and crop fitting for performance
    if (!urlObj.searchParams.has('auto')) {
      urlObj.searchParams.set('auto', 'format');
    }
    if (!urlObj.searchParams.has('fit')) {
      urlObj.searchParams.set('fit', 'crop');
    }
    
    return urlObj.toString();
  } catch (e) {
    // Fallback simple string replacement if URL parsing fails
    let optimized = url;
    if (optimized.includes('w=')) {
      optimized = optimized.replace(/w=\d+/, `w=${width}`);
    } else {
      optimized += `&w=${width}`;
    }
    if (optimized.includes('q=')) {
      optimized = optimized.replace(/q=\d+/, `q=${quality}`);
    } else {
      optimized += `&q=${quality}`;
    }
    return optimized;
  }
};

/**
 * Generates a standard srcSet string for Unsplash URLs, offering pre-compiled widths
 * to allow the browser's native engine to load the perfect match for the display.
 */
export const generateUnsplashSrcSet = (url: string, quality: number = 80): string => {
  if (!url || !url.includes('unsplash.com')) return '';
  
  const widths = [320, 480, 640, 768, 1024, 1280, 1600, 1920];
  return widths
    .map((w) => `${getOptimizedUnsplashUrl(url, w, quality)} ${w}w`)
    .join(', ');
};

export const ImageOptimization: React.FC<ImageOptimizationProps> = ({
  src,
  alt,
  containerClassName = "",
  className = "",
  fallback = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
  aspectRatio = "",
  quality = 80,
  priority = false,
  widthForce,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Check if image is an food-related "banned" image according to existing tatami design rules
  const isBannable = (url: string) => {
    const lower = url.toLowerCase();
    return lower.includes('hotdog') || lower.includes('food') || lower.includes('burger') || lower.includes('pizza') || lower.includes('sandwich');
  };

  const finalSrc = useMemo(() => {
    const rawSrc = hasError || !src || isBannable(src) ? fallback : src;
    if (widthForce) {
      return getOptimizedUnsplashUrl(rawSrc, widthForce, quality);
    }
    // If no explicit widthForce but is an Unsplash image, use a reasonable default width (e.g. 800px) as base src
    if (rawSrc.includes('unsplash.com')) {
      return getOptimizedUnsplashUrl(rawSrc, 800, quality);
    }
    return rawSrc;
  }, [src, fallback, widthForce, quality, hasError]);

  // Generate a highly compressed placeholder (tiny dimensions, high compression, CSS blur)
  const placeholderSrc = useMemo(() => {
    const base = !src || isBannable(src) ? fallback : src;
    if (base.includes('unsplash.com')) {
      return getOptimizedUnsplashUrl(base, 20, 10) + '&blur=10';
    }
    // Sophisticated SVG placeholder for local/non-unsplash files: Competition mat look
    return "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%2318181b'/%3E%3Ccircle cx='20' cy='20' r='10' fill='none' stroke='%2322c55e' stroke-width='1' opacity='0.3'/%3E%3Cpath d='M0 0l40 40M40 0L0 40' stroke='%2327272a' stroke-width='0.5' opacity='0.5'/%3E%3C/svg%3E";
  }, [src, fallback]);

  // Generate responsive srcSet for native optimization
  const srcSet = useMemo(() => {
    if (widthForce || !src || hasError || !src.includes('unsplash.com') || isBannable(src)) {
      return undefined;
    }
    return generateUnsplashSrcSet(src, quality);
  }, [src, widthForce, quality, hasError]);

  useEffect(() => {
    // Reset loading state on source change
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "100px" }}
      className={`relative overflow-hidden bg-zinc-100 dark:bg-zinc-950 ${aspectRatio} ${containerClassName}`}
    >
      {/* Blur-up placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.img
            key="placeholder"
            src={placeholderSrc}
            alt=""
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none scale-105"
            style={{ filter: 'blur(8px)' }}
          />
        )}
      </AnimatePresence>

      {/* Main optimized image */}
      <motion.img
        src={finalSrc}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? "eager" : "lazy"}
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
        className={`w-full h-full object-cover transition-all duration-500 ${className}`}
        {...props}
      />

      {/* Subtle overlay effect */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-tr from-black/5 via-transparent to-white/5 opacity-50" />
    </motion.div>
  );
};

export default ImageOptimization;
