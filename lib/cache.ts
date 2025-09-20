import { unstable_cache } from 'next/cache'
import { cache } from 'react'

// Cache configuration
export const CACHE_TAGS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  TENANTS: 'tenants',
  ORDERS: 'orders',
  CART: 'cart',
  USER: 'user',
} as const

export const CACHE_TIMES = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

// In-memory cache for React components (per-request)
export const requestCache = cache

// Next.js data cache with tags for revalidation
export function createCachedQuery<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  {
    tags = [],
    revalidate = CACHE_TIMES.MEDIUM,
    keyParts = [],
  }: {
    tags?: string[]
    revalidate?: number
    keyParts?: string[]
  }
) {
  return unstable_cache(
    fn,
    keyParts,
    {
      tags,
      revalidate,
    }
  )
}

// Browser storage utilities
export class BrowserCache {
  private static isClient = typeof window !== 'undefined'

  // Local Storage with expiration
  static set(key: string, value: any, expirationMinutes: number = 60) {
    if (!this.isClient) return

    const item = {
      value,
      expiry: Date.now() + (expirationMinutes * 60 * 1000),
    }

    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  static get<T>(key: string): T | null {
    if (!this.isClient) return null

    try {
      const itemStr = localStorage.getItem(key)
      if (!itemStr) return null

      const item = JSON.parse(itemStr)

      // Check if expired
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key)
        return null
      }

      return item.value
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return null
    }
  }

  static remove(key: string) {
    if (!this.isClient) return
    localStorage.removeItem(key)
  }

  static clear() {
    if (!this.isClient) return
    localStorage.clear()
  }

  // Session Storage utilities
  static setSession(key: string, value: any) {
    if (!this.isClient) return

    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error)
    }
  }

  static getSession<T>(key: string): T | null {
    if (!this.isClient) return null

    try {
      const itemStr = sessionStorage.getItem(key)
      return itemStr ? JSON.parse(itemStr) : null
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error)
      return null
    }
  }

  static removeSession(key: string) {
    if (!this.isClient) return
    sessionStorage.removeItem(key)
  }
}

// Image optimization utilities
export class ImageCache {
  private static cache = new Map<string, string>()

  // Generate optimized image URL with lazy loading
  static getOptimizedUrl(
    src: string,
    {
      width,
      height,
      quality = 80,
      format = 'webp',
    }: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'avif' | 'jpeg' | 'png'
    } = {}
  ): string {
    if (!src) return ''

    // For external URLs, return as-is (Next.js will optimize)
    if (src.startsWith('http')) return src

    // Build optimization parameters
    const params = new URLSearchParams()
    if (width) params.append('w', width.toString())
    if (height) params.append('h', height.toString())
    params.append('q', quality.toString())
    params.append('f', format)

    const optimizedUrl = `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`

    // Cache the URL
    this.cache.set(src, optimizedUrl)

    return optimizedUrl
  }

  // Preload critical images
  static preload(src: string, priority: 'high' | 'low' = 'low') {
    if (!src || typeof window === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    link.fetchPriority = priority

    document.head.appendChild(link)
  }

  // Generate blur placeholder
  static generateBlurDataURL(width: number = 8, height: number = 8): string {
    const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null
    if (!canvas) return ''

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Create gradient blur effect
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(1, '#e5e7eb')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    return canvas.toDataURL()
  }
}

// Performance monitoring utilities
export class PerformanceCache {
  private static metrics = new Map<string, number>()

  static startMeasure(name: string) {
    if (typeof window === 'undefined') return
    performance.mark(`${name}-start`)
  }

  static endMeasure(name: string) {
    if (typeof window === 'undefined') return

    try {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)

      const measure = performance.getEntriesByName(name)[0]
      this.metrics.set(name, measure.duration)

      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && measure.duration > 100) {
        console.warn(`Slow operation detected: ${name} took ${measure.duration.toFixed(2)}ms`)
      }
    } catch (error) {
      console.warn('Performance measurement failed:', error)
    }
  }

  static getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  static clearMetrics() {
    this.metrics.clear()
    if (typeof window !== 'undefined') {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }
}

// Cache warming utilities
export class CacheWarmer {
  private static warmupQueue: Array<() => Promise<void>> = []

  static addToQueue(fn: () => Promise<void>) {
    this.warmupQueue.push(fn)
  }

  static async warmCache() {
    if (typeof window === 'undefined') return

    // Run warmup tasks in parallel with concurrency limit
    const concurrency = 3
    const tasks = [...this.warmupQueue]
    this.warmupQueue = []

    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency)
      await Promise.allSettled(batch.map(task => task()))
    }
  }
}

// Helper function to invalidate cache by tag
export function revalidateCache(tag: string) {
  try {
    // This would be implemented differently in production
    // For now, we'll use the Next.js revalidateTag when available
    if (typeof revalidateTag !== 'undefined') {
      revalidateTag(tag)
    }
  } catch (error) {
    console.warn('Cache revalidation failed:', error)
  }
}