/**
 * Enhanced Toast notification system with better UX
 */

import { useToast } from '@/hooks/use-toast'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface EnhancedToastOptions {
  title: string
  description?: string
  type?: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onOpenChange?: (open: boolean) => void
}

/**
 * Custom hook for enhanced toast notifications
 */
export function useEnhancedToast() {
  const { toast } = useToast()

  const showToast = (options: EnhancedToastOptions) => {
    const { title, description, type = 'info', duration = 3000, action } = options

    const variantMap: Record<ToastType, 'default' | 'destructive'> = {
      success: 'default',
      error: 'destructive',
      info: 'default',
      warning: 'default',
    }

    const iconMap: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠',
    }

    toast({
      title: `${iconMap[type]} ${title}`,
      description,
      variant: variantMap[type],
      duration,
      action: undefined,
      onOpenChange: options.onOpenChange,
    })
  }

  const success = (title: string, description?: string) => {
    showToast({
      title,
      description,
      type: 'success',
      duration: 3000,
    })
  }

  const error = (title: string, description?: string) => {
    showToast({
      title,
      description,
      type: 'error',
      duration: 5000,
    })
  }

  const info = (title: string, description?: string) => {
    showToast({
      title,
      description,
      type: 'info',
      duration: 3000,
    })
  }

  const warning = (title: string, description?: string) => {
    showToast({
      title,
      description,
      type: 'warning',
      duration: 4000,
    })
  }

  const loading = (title: string) => {
    showToast({
      title,
      type: 'info',
      duration: Number.POSITIVE_INFINITY,
    })
  }

  return { showToast, success, error, info, warning, loading }
}

/**
 * Toast message templates
 */
export const toastMessages = {
  auth: {
    signInSuccess: 'Welcome back! Signed in successfully',
    signUpSuccess: 'Account created! Check your email to verify',
    signOutSuccess: 'Signed out successfully',
    signInError: 'Failed to sign in. Please check your credentials',
    signUpError: 'Failed to create account. Please try again',
  },
  network: {
    offline: 'You are offline. Check your connection.',
    error: 'Network error. Please try again.',
    timeout: 'Request timed out. Please try again.',
  },
  validation: {
    fillRequired: 'Please fill in all required fields',
    invalidEmail: 'Please enter a valid email address',
    invalidPassword: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
  },
  crud: {
    createSuccess: 'Created successfully',
    updateSuccess: 'Updated successfully',
    deleteSuccess: 'Deleted successfully',
    createError: 'Failed to create. Please try again.',
    updateError: 'Failed to update. Please try again.',
    deleteError: 'Failed to delete. Please try again.',
  },
  upload: {
    uploadSuccess: 'Uploaded successfully',
    uploadError: 'Upload failed. Please try again.',
    fileTooLarge: 'File is too large. Maximum size: 10MB',
    invalidFormat: 'Invalid file format',
  },
}

/**
 * Notification queue for batch messages
 */
export class NotificationQueue {
  private queue: EnhancedToastOptions[] = []
  private isProcessing = false

  add(options: EnhancedToastOptions) {
    this.queue.push(options)
    this.process()
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const notification = this.queue.shift()
      if (notification) {
        // In a real app, would use the toast here
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    this.isProcessing = false
  }

  clear() {
    this.queue = []
  }
}
