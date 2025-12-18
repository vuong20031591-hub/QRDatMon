'use client';

/**
 * OptimizedImage Component
 * Responsive image component with WebP/AVIF support and lazy loading
 * Requirements: 4.3, 4.4
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageMetadata {
  id: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  lqip: string;
  basePath: string;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const SIZE_WIDTHS = {
  thumbnail: 150,
  small: 320,
  medium: 640,
  large: 1024,
};

/**
 * Generate srcset for responsive images
 */
const generateSrcSet = (basePath: string, format: string): string => {
  return Object.entries(SIZE_WIDTHS)
    .map(([size, width]) => `${basePath}/${size}-85.${format} ${width}w`)
    .join(', ');
};

export function OptimizedImage({
  src,
  alt,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  fill = false,
  width,
  height,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);

  // Check if src is an optimized image ID or regular URL
  const isOptimizedImage = src.startsWith('/api/images/') || src.match(/^[a-f0-9]{24}$/);

  useEffect(() => {
    if (isOptimizedImage) {
      const imageId = src.replace('/api/images/', '').split('/')[0];
      fetch(`/api/images/${imageId}/metadata`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMetadata(data.data);
          }
        })
        .catch(() => {
          // Fallback to regular image
        });
    }
  }, [src, isOptimizedImage]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // For optimized images with metadata
  if (metadata) {
    const basePath = metadata.basePath;
    
    return (
      <div
        className={cn('relative overflow-hidden', className)}
        style={{
          aspectRatio: fill ? undefined : metadata.dimensions.aspectRatio,
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
        }}
      >
        {/* LQIP Placeholder */}
        {!isLoaded && metadata.lqip && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={metadata.lqip}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
          />
        )}

        {/* Picture element with modern formats */}
        <picture>
          {/* AVIF source */}
          <source
            type="image/avif"
            srcSet={generateSrcSet(basePath, 'avif')}
            sizes={sizes}
          />
          {/* WebP source */}
          <source
            type="image/webp"
            srcSet={generateSrcSet(basePath, 'webp')}
            sizes={sizes}
          />
          {/* JPEG fallback */}
          <img
            src={`${basePath}/medium-85.jpeg`}
            srcSet={generateSrcSet(basePath, 'jpeg')}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        </picture>
      </div>
    );
  }

  // Fallback for regular images or while loading metadata
  return (
    <div
      className={cn('relative overflow-hidden bg-gray-100', className)}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
      }}
    >
      {hasError ? (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}

export default OptimizedImage;
