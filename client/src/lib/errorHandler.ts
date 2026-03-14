/**
 * Centralized error handling and reporting system
 * Provides consistent error handling across the application
 */

export interface ErrorMetadata {
  context?: string
  userId?: string
  timestamp?: number
  [key: string]: any
}

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 500,
    public metadata: ErrorMetadata = {}
  ) {
    super(message)
    this.name = 'AppError'
    this.timestamp = Date.now()
  }

  timestamp: number

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      metadata: this.metadata,
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super('VALIDATION_ERROR', message, 400, metadata)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, metadata: ErrorMetadata = {}) {
    super('NOT_FOUND', `${resource} not found`, 404, metadata)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', metadata: ErrorMetadata = {}) {
    super('UNAUTHORIZED', message, 401, metadata)
    this.name = 'UnauthorizedError'
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error occurred', metadata: ErrorMetadata = {}) {
    super('NETWORK_ERROR', message, 0, metadata)
    this.name = 'NetworkError'
  }
}

/**
 * Error logger with optional remote reporting
 */
export class ErrorLogger {
  // Use Vite's env helpers in the client
  private static isDev = typeof import.meta !== 'undefined' && !!(import.meta as any).env?.DEV
  private static remoteEndpoint =
    typeof import.meta !== 'undefined'
      ? (import.meta as any).env?.VITE_ERROR_LOG_ENDPOINT
      : undefined

  static log(error: unknown, context?: string) {
    const appError = ErrorLogger.normalizeError(error)

    // Always log to console in development
    if (ErrorLogger.isDev) {
      console.error(`[${context || 'Error'}]`, appError)
    }

    // Send to remote server if configured
    if (ErrorLogger.remoteEndpoint && !ErrorLogger.isDev) {
      ErrorLogger.sendRemote(appError, context)
    }

    // Store in local storage for debugging
    ErrorLogger.storeLocal(appError)
  }

  static normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (error instanceof Error) {
      return new AppError('UNKNOWN_ERROR', error.message, 500, {
        originalError: error.name,
        stack: error.stack,
      })
    }

    return new AppError('UNKNOWN_ERROR', String(error), 500, {
      rawError: error,
    })
  }

  private static sendRemote(error: AppError, context?: string) {
    if (!ErrorLogger.remoteEndpoint) return

    try {
      fetch(ErrorLogger.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...error.toJSON(),
          context,
          userAgent: (navigator as any).userAgentData
            ? JSON.stringify((navigator as any).userAgentData.toJSON())
            : navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(() => {
        // Silently fail if remote logging fails
      })
    } catch {
      // Prevent infinite error loops
    }
  }

  private static storeLocal(error: AppError, limit = 10) {
    try {
      const key = 'app_error_log'
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const logs = [error.toJSON(), ...existing].slice(0, limit)
      localStorage.setItem(key, JSON.stringify(logs))
    } catch {
      // Silently fail if localStorage is full
    }
  }

  static getLocalLogs(): AppError[] {
    try {
      const logs = JSON.parse(localStorage.getItem('app_error_log') || '[]')
      return logs
    } catch {
      return []
    }
  }

  static clearLocalLogs() {
    try {
      localStorage.removeItem('app_error_log')
    } catch {
      // Ignore
    }
  }
}

/**
 * User-friendly error messages
 */
export function getUserErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof ValidationError) {
    return error.message
  }

  if (error instanceof UnauthorizedError) {
    return t('error.unauthorized')
  }

  if (error instanceof NotFoundError) {
    return error.message
  }

  if (error instanceof NetworkError) {
    return t('error.network')
  }

  if (error instanceof AppError && error.code !== 'UNKNOWN_ERROR') {
    return error.message
  }

  return t('error.unexpected')
}

/**
 * Safe async wrapper with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<[T | null, AppError | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    const appError = ErrorLogger.normalizeError(error)
    ErrorLogger.log(appError, context)
    return [null, appError]
  }
}
