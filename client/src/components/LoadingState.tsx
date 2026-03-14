import { AlertCircle, Loader2 } from 'lucide-react'
import type React from 'react'

interface LoadingStateProps {
  isLoading?: boolean
  error?: Error | string | null
  isEmpty?: boolean
  children?: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?:
    | React.ReactNode
    | ((error: Error | string, retry?: () => void) => React.ReactNode)
  emptyComponent?: React.ReactNode
  onRetry?: () => void
}

/**
 * Unified loading state component for better UX
 */
export function LoadingState({
  isLoading,
  error,
  isEmpty,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  onRetry,
}: LoadingStateProps) {
  // Error state
  if (error) {
    if (typeof errorComponent === 'function') {
      return errorComponent(error, onRetry)
    }

    return (
      errorComponent || (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">
              {typeof error === 'string' ? error : error.message}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )
    )
  }

  // Loading state
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      )
    )
  }

  // Empty state
  if (isEmpty) {
    return (
      emptyComponent || (
        <div className="flex items-center justify-center h-full p-4">
          <div className="text-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </div>
      )
    )
  }

  // Success state
  return children
}

/**
 * Skeleton loading placeholder
 */
export function SkeletonLoader({ count = 3, height = 'h-12', className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} bg-muted/40 rounded-lg animate-pulse`} />
      ))}
    </div>
  )
}

/**
 * Animated loading spinner
 */
export function LoadingSpinner({
  size = 'md',
  message,
}: {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}

/**
 * Progress loading bar
 */
export function ProgressBar({
  progress = 0,
  message,
  showPercentage = true,
}: {
  progress?: number
  message?: string
  showPercentage?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">{message || 'Loading...'}</p>
        {showPercentage && <span className="text-primary font-medium">{progress}%</span>}
      </div>
    </div>
  )
}

/**
 * Minimal loading indicator
 */
export function MinimalLoader({ message }: { message?: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  )
}
