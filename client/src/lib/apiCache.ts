/**
 * Advanced API caching system with TTL and stale-while-revalidate
 */

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  etag?: string
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  staleWhileRevalidate?: boolean // Return stale data while fetching new
  key?: string // Custom cache key
}

export class APICache {
  private cache = new Map<string, CacheEntry<any>>()
  private pending = new Map<string, Promise<any>>()

  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Generate cache key from URL and params
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    let key = endpoint
    if (params) {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        query.append(k, String(v))
      })
      key = `${endpoint}?${query.toString()}`
    }
    return key
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl
  }

  /**
   * Get cached data
   */
  get<T>(endpoint: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(endpoint, params)
    const entry = this.cache.get(key)

    if (entry && this.isValid(entry)) {
      return entry.data as T
    }

    return null
  }

  /**
   * Set cache with TTL
   */
  set<T>(endpoint: string, data: T, options: CacheOptions = {}): void {
    const key = options.key || this.generateKey(endpoint)
    const ttl = options.ttl ?? this.defaultTTL

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Fetch with caching and stale-while-revalidate
   */
  async fetch<T>(
    endpoint: string,
    params?: Record<string, any>,
    options: CacheOptions & { url?: string; fetch?: typeof fetch } = {}
  ): Promise<T> {
    const key = this.generateKey(endpoint, params)

    // Return pending request if already in flight
    if (this.pending.has(key)) {
      return this.pending.get(key)!
    }

    // Check cache first
    const cached = this.get<T>(endpoint, params)
    if (cached && !options.staleWhileRevalidate) {
      return cached
    }

    // Create fetch promise
    const fetchPromise = this.executeRequest<T>(endpoint, params, options)
      .then((data) => {
        this.set(endpoint, data, options)
        this.pending.delete(key)
        return data
      })
      .catch((error) => {
        this.pending.delete(key)
        throw error
      })

    this.pending.set(key, fetchPromise)

    // Return stale data immediately if available
    if (options.staleWhileRevalidate && cached) {
      // Continue fetching in background
      fetchPromise.catch(() => {
        // Silently fail background fetch
      })
      return cached
    }

    return fetchPromise
  }

  /**
   * Execute the actual request
   */
  private async executeRequest<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: CacheOptions & { url?: string; fetch?: typeof fetch }
  ): Promise<T> {
    const url = new URL(options?.url || endpoint, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        url.searchParams.append(k, String(v))
      })
    }

    const response = await (options?.fetch || fetch)(url.toString())

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Invalidate specific cache entries
   */
  invalidate(endpoint?: string, params?: Record<string, any>): void {
    if (!endpoint) {
      this.cache.clear()
      return
    }

    const key = this.generateKey(endpoint, params)
    this.cache.delete(key)
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pending.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        isValid: this.isValid(entry),
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
      })),
    }
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const apiCache = new APICache()

/**
 * React hook for cached API requests
 */
import { useCallback, useEffect, useState } from 'react'

interface UseCachedFetchOptions extends CacheOptions {
  enabled?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

export function useCachedFetch<T>(
  endpoint: string,
  params?: Record<string, any>,
  options: UseCachedFetchOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { enabled = true, onError, onSuccess } = options

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await apiCache.fetch<T>(endpoint, params, options)
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [endpoint, params, enabled, options, onError, onSuccess])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    apiCache.invalidate(endpoint, params)
    fetchData()
  }, [endpoint, params, fetchData])

  return { data, loading, error, refetch }
}
