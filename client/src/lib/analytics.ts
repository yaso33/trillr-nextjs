/**
 * Simple analytics tracking system
 */

export interface PageViewEvent {
  path: string
  title?: string
  referrer?: string
  timestamp: number
}

export interface UserEvent {
  name: string
  properties?: Record<string, any>
  timestamp: number
  userId?: string
}

export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
}

export class Analytics {
  private isDev = typeof import.meta !== 'undefined' && !!(import.meta as any).env?.DEV
  private endpoint =
    typeof import.meta !== 'undefined'
      ? (import.meta as any).env?.VITE_ANALYTICS_ENDPOINT
      : undefined
  private sessionId = this.generateSessionId()
  private userId: string | null = null
  private events: (PageViewEvent | UserEvent | PerformanceMetric)[] = []

  constructor() {
    this.trackPageView()
    this.setupPerformanceObserver()
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string | null) {
    this.userId = userId
  }

  /**
   * Track page view
   */
  trackPageView(title?: string) {
    const event: PageViewEvent = {
      path: window.location.pathname,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    }

    this.recordEvent(event)
  }

  /**
   * Track custom event
   */
  trackEvent(name: string, properties?: Record<string, any>) {
    const event: UserEvent = {
      name,
      properties,
      timestamp: Date.now(),
      userId: this.userId || undefined,
    }

    this.recordEvent(event)
  }

  /**
   * Track performance metrics
   */
  trackMetric(name: string, duration: number) {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
    }

    this.recordEvent(metric)
  }

  /**
   * Record event (locally or send remotely)
   */
  private recordEvent(event: PageViewEvent | UserEvent | PerformanceMetric) {
    this.events.push(event)

    if (this.isDev) {
      console.log('[Analytics]', event)
    }

    // Send to remote endpoint if configured
    if (this.endpoint) {
      this.sendEvent(event).catch(() => {
        // Silently fail
      })
    }
  }

  /**
   * Send event to remote analytics server
   */
  private async sendEvent(event: PageViewEvent | UserEvent | PerformanceMetric) {
    if (!this.endpoint) return

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          sessionId: this.sessionId,
          userAgent: (navigator as any).userAgentData
            ? JSON.stringify((navigator as any).userAgentData.toJSON())
            : undefined,
        }),
      })
    } catch {
      // Silently fail
    }
  }

  /**
   * Setup Web Vitals tracking
   */
  private setupPerformanceObserver() {
    if (!window.PerformanceObserver) return

    try {
      // Track Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.trackMetric('LCP', lastEntry.renderTime || lastEntry.loadTime)
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.trackMetric('CLS', clsValue)
      }).observe({ entryTypes: ['layout-shift'] })

      // Track First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.trackMetric('FID', (entry as any).processingDuration)
        })
      }).observe({ entryTypes: ['first-input'] })
    } catch {
      // Silently fail
    }
  }

  /**
   * Get local events (for debugging)
   */
  getEvents() {
    return this.events
  }

  /**
   * Clear events
   */
  clearEvents() {
    this.events = []
  }

  /**
   * Export events as JSON
   */
  exportEvents() {
    return JSON.stringify(this.events, null, 2)
  }
}

// Global analytics instance
export const analytics = new Analytics()

/**
 * React hook for tracking page views
 */
import { useEffect } from 'react'
import { useLocation } from 'wouter'

export function useAnalytics(pageName?: string) {
  const [location] = useLocation()

  useEffect(() => {
    analytics.trackPageView(pageName)
  }, [location, pageName])
}

/**
 * React hook for tracking events
 */
export function useEventTracking() {
  return {
    track: (name: string, properties?: Record<string, any>) => {
      analytics.trackEvent(name, properties)
    },
  }
}
