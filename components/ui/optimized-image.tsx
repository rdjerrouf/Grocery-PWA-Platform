'use client'

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { ImageCache, PerformanceCache } from '@/lib/cache'

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'placeholder'> {
  src: string
  alt: string
  fallback?: string
  showPlaceholder?: boolean
  priority?: boolean
  quality?: number
  sizes?: string
  className?: string
  containerClassName?: string
  onLoadStart?: () => void
  onLoadComplete?: () => void
  onError?: () => void
}

// Generate a shimmer placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f3f4f6" offset="20%" />
      <stop stop-color="#e5e7eb" offset="50%" />
      <stop stop-color="#f3f4f6" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f3f4f6" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fallback = '/images/placeholder.jpg',
  showPlaceholder = true,
  priority = false,
  quality = 80,
  sizes,
  className,
  containerClassName,
  onLoadStart,
  onLoadComplete,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Generate blur data URL for placeholder
  const blurDataURL = showPlaceholder
    ? `data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`
    : undefined

  // Performance tracking
  useEffect(() => {
    if (priority && src) {
      PerformanceCache.startMeasure(`image-load-${src}`)
      ImageCache.preload(src, 'high')
    }
  }, [src, priority])

  const handleLoadStart = () => {
    setIsLoading(true)
    onLoadStart?.()
  }

  const handleLoadComplete = () => {
    setIsLoading(false)
    if (priority && src) {
      PerformanceCache.endMeasure(`image-load-${src}`)
    }
    onLoadComplete?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    setImageSrc(fallback)
    onError?.()
  }

  // Responsive sizes based on common breakpoints
  const responsiveSizes = sizes || `
    (max-width: 640px) 100vw,
    (max-width: 768px) 50vw,
    (max-width: 1024px) 33vw,
    25vw
  `

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        sizes={responsiveSizes}
        placeholder={showPlaceholder ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoadStart={handleLoadStart}
        onLoad={handleLoadComplete}
        onError={handleError}
        className={cn(
          'transition-all duration-300',
          isLoading && showPlaceholder ? 'scale-110 blur-sm' : 'scale-100 blur-0',
          hasError ? 'opacity-75' : 'opacity-100',
          className
        )}
        {...props}
      />

      {/* Loading overlay */}
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 text-gray-400">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Product image component with specific optimizations
interface ProductImageProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  product?: {
    id: string
    name: string
    image_url?: string
  }
}

const SIZE_CONFIG = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 },
  xlarge: { width: 800, height: 800 },
}

export function ProductImage({
  size = 'medium',
  product,
  src,
  alt,
  className,
  ...props
}: ProductImageProps) {
  const { width, height } = SIZE_CONFIG[size]
  const imageSrc = src || product?.image_url || '/images/product-placeholder.jpg'
  const imageAlt = alt || product?.name || 'Product image'

  // Generate optimized sizes string
  const sizes = {
    small: '(max-width: 640px) 150px, 150px',
    medium: '(max-width: 640px) 300px, (max-width: 768px) 250px, 300px',
    large: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 600px',
    xlarge: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px',
  }

  return (
    <OptimizedImage
      src={imageSrc}
      alt={imageAlt}
      width={width}
      height={height}
      sizes={sizes[size]}
      className={cn(
        'object-cover',
        size === 'small' && 'rounded-md',
        size === 'medium' && 'rounded-lg',
        size === 'large' && 'rounded-lg',
        size === 'xlarge' && 'rounded-xl',
        className
      )}
      {...props}
    />
  )
}

// Avatar component with optimizations
interface AvatarImageProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  user?: {
    name?: string
    avatar_url?: string
  }
}

const AVATAR_SIZES = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
}

export function AvatarImage({
  size = 'md',
  user,
  src,
  alt,
  className,
  ...props
}: AvatarImageProps) {
  const dimension = AVATAR_SIZES[size]
  const imageSrc = src || user?.avatar_url || '/images/avatar-placeholder.jpg'
  const imageAlt = alt || user?.name || 'User avatar'

  return (
    <OptimizedImage
      src={imageSrc}
      alt={imageAlt}
      width={dimension}
      height={dimension}
      sizes={`${dimension}px`}
      className={cn(
        'rounded-full object-cover',
        className
      )}
      {...props}
    />
  )
}

// Hero image component with specific optimizations
interface HeroImageProps extends Omit<OptimizedImageProps, 'priority'> {
  variant?: 'banner' | 'card' | 'background'
}

export function HeroImage({
  variant = 'banner',
  className,
  ...props
}: HeroImageProps) {
  const variantConfig = {
    banner: {
      priority: true,
      sizes: '100vw',
      quality: 90,
    },
    card: {
      priority: false,
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
      quality: 85,
    },
    background: {
      priority: true,
      sizes: '100vw',
      quality: 75,
    },
  }

  const config = variantConfig[variant]

  return (
    <OptimizedImage
      {...config}
      className={cn(
        'object-cover',
        variant === 'banner' && 'w-full h-64 md:h-96',
        variant === 'card' && 'rounded-lg',
        variant === 'background' && 'absolute inset-0 w-full h-full',
        className
      )}
      {...props}
    />
  )
}