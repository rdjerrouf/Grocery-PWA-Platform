'use client'

// Performance monitoring and optimization utilities

export class PerformanceMonitor {
  private static isClient = typeof window !== 'undefined'
  private static observer: IntersectionObserver | null = null
  private static resizeObserver: ResizeObserver | null = null

  // Web Vitals monitoring
  static initWebVitals() {
    if (!this.isClient) return

    // Largest Contentful Paint (LCP)
    this.observeLCP()

    // First Input Delay (FID)
    this.observeFID()

    // Cumulative Layout Shift (CLS)
    this.observeCLS()

    // Time to First Byte (TTFB)
    this.observeTTFB()
  }

  private static observeLCP() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]

        console.log('LCP:', lastEntry.startTime)

        // Send to analytics if needed
        this.reportMetric('LCP', lastEntry.startTime)
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP observation failed:', error)
    }
  }

  private static observeFID() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()

        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime)

          // Send to analytics if needed
          this.reportMetric('FID', entry.processingStart - entry.startTime)
        })
      })

      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID observation failed:', error)
    }
  }

  private static observeCLS() {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsValue = 0

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()

        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })

        console.log('CLS:', clsValue)

        // Send to analytics if needed
        this.reportMetric('CLS', clsValue)
      })

      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS observation failed:', error)
    }
  }

  private static observeTTFB() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()

        entries.forEach((entry) => {
          console.log('TTFB:', entry.responseStart - entry.requestStart)

          // Send to analytics if needed
          this.reportMetric('TTFB', entry.responseStart - entry.requestStart)
        })
      })

      observer.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      console.warn('TTFB observation failed:', error)
    }
  }

  private static reportMetric(name: string, value: number) {
    // In production, you would send this to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}:`, value)
    }

    // Example: Send to Google Analytics, Mixpanel, etc.
    // gtag('event', name, { value: Math.round(value) })
  }

  // Lazy loading with Intersection Observer
  static observeImages() {
    if (!this.isClient || !('IntersectionObserver' in window)) return

    if (this.observer) return // Already initialized

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement

            // Load the image
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
            }

            // Load srcset if available
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset
              img.removeAttribute('data-srcset')
            }

            // Remove loading class
            img.classList.remove('lazy-loading')
            img.classList.add('lazy-loaded')

            // Stop observing this image
            this.observer?.unobserve(img)
          }
        })
      },
      {
        rootMargin: '50px 0px', // Load images 50px before they enter viewport
        threshold: 0.01,
      }
    )

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach((img) => {
      this.observer?.observe(img)
    })
  }

  // Optimize animations based on user preferences
  static respectMotionPreferences() {
    if (!this.isClient) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (prefersReducedMotion.matches) {
      // Disable animations for users who prefer reduced motion
      document.documentElement.style.setProperty('--animation-duration', '0s')
      document.documentElement.style.setProperty('--transition-duration', '0s')
    }

    // Listen for changes
    prefersReducedMotion.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0s')
        document.documentElement.style.setProperty('--transition-duration', '0s')
      } else {
        document.documentElement.style.removeProperty('--animation-duration')
        document.documentElement.style.removeProperty('--transition-duration')
      }
    })
  }

  // Memory usage monitoring
  static monitorMemory() {
    if (!this.isClient || !('memory' in performance)) return

    const logMemory = () => {
      const memory = (performance as any).memory
      console.log('Memory usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
      })
    }

    // Log memory usage every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(logMemory, 30000)
    }
  }

  // Connection monitoring
  static monitorConnection() {
    if (!this.isClient || !('connection' in navigator)) return

    const connection = (navigator as any).connection

    const logConnection = () => {
      console.log('Connection:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      })

      // Adapt behavior based on connection
      if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Enable data saver mode
        this.enableDataSaverMode()
      }
    }

    logConnection()

    connection.addEventListener('change', logConnection)
  }

  private static enableDataSaverMode() {
    // Reduce image quality, disable auto-play videos, etc.
    document.documentElement.classList.add('data-saver-mode')
    console.log('Data saver mode enabled')
  }

  // Preload critical resources
  static preloadCriticalResources() {
    if (!this.isClient) return

    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      // Add other critical fonts
    ]

    criticalFonts.forEach((font) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      link.href = font
      document.head.appendChild(link)
    })

    // Preload critical images
    const criticalImages = [
      '/images/hero-banner.jpg',
      '/images/logo.png',
      // Add other critical images
    ]

    criticalImages.forEach((image) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = image
      document.head.appendChild(link)
    })
  }

  // Bundle analysis in development
  static analyzeBundles() {
    if (process.env.NODE_ENV !== 'development' || !this.isClient) return

    // Log all loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'))
    console.log('Loaded scripts:', scripts.map(s => s.getAttribute('src')))

    // Log performance entries
    const entries = performance.getEntriesByType('navigation')
    console.log('Navigation timing:', entries[0])
  }

  // Initialize all performance monitoring
  static init() {
    if (!this.isClient) return

    this.initWebVitals()
    this.observeImages()
    this.respectMotionPreferences()
    this.monitorMemory()
    this.monitorConnection()
    this.preloadCriticalResources()
    this.analyzeBundles()

    console.log('🚀 Performance monitoring initialized')
  }
}

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PerformanceMonitor.init()
    })
  } else {
    PerformanceMonitor.init()
  }
}

// Export for manual initialization
export default PerformanceMonitor