/**
 * Accessibility utilities and hooks for better UX for all users
 */
import React from 'react'

/**
 * Announce to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    announcement.remove()
  }, 1000)
}

/**
 * Create accessible dialog
 */
export interface AccessibleDialogOptions {
  title: string
  description?: string
  onClose?: () => void
}

/**
 * Keyboard navigation utilities
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`

      if (shortcuts[key]) {
        e.preventDefault()
        shortcuts[key]()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

/**
 * Get accessible button props
 */
export interface AccessibleButtonOptions {
  disabled?: boolean
}

export function getAccessibleButtonProps(
  onClick: () => void,
  options: AccessibleButtonOptions = {}
) {
  return {
    role: 'button' as const,
    tabIndex: options.disabled ? -1 : 0,
    onClick: options.disabled ? undefined : onClick,
  }
}

/**
 * Skip to main content link
 */
export function SkipToMainContent() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement('a', {
      href: '#main',
      className:
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-2 focus:bg-primary focus:text-white focus:rounded',
      children: 'Skip to main content',
    })
  )
}

/**
 * Accessible form field wrapper
 */
export interface AccessibleFormFieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  helperText?: string
  children: React.ReactNode
}

export function AccessibleFormField({
  id,
  label,
  error,
  required,
  helperText,
  children,
}: AccessibleFormFieldProps) {
  const errorId = `${id}-error`
  const helperId = `${id}-helper`

  return React.createElement(
    'div',
    { className: 'space-y-2' },
    React.createElement(
      'label',
      { htmlFor: id, className: 'block text-sm font-medium' },
      label,
      required
        ? React.createElement('span', {
            className: 'text-destructive ml-1',
            'aria-label': 'required',
            children: '*',
          })
        : null
    ),
    React.createElement(
      'div',
      { className: 'relative' },
      React.cloneElement(children as React.ReactElement, {
        id,
        'aria-invalid': !!error,
        'aria-describedby': [error && errorId, helperText && helperId].filter(Boolean).join(' '),
        required,
      })
    ),
    error
      ? React.createElement('p', {
          id: errorId,
          className: 'text-sm text-destructive',
          role: 'alert',
          children: error,
        })
      : null,
    helperText
      ? React.createElement('p', {
          id: helperId,
          className: 'text-xs text-muted-foreground',
          children: helperText,
        })
      : null
  )
}

/**
 * Focus management
 */
export function useFocusManagement() {
  const focusableElements = React.useRef<HTMLElement[]>([])

  const getAllFocusableElements = (container?: HTMLElement) => {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const elements = (container || document).querySelectorAll(selector)
    return Array.from(elements) as HTMLElement[]
  }

  const focusFirst = (container?: HTMLElement) => {
    const elements = getAllFocusableElements(container)
    elements[0]?.focus()
  }

  const focusLast = (container?: HTMLElement) => {
    const elements = getAllFocusableElements(container)
    elements[elements.length - 1]?.focus()
  }

  const trapFocus = (container: HTMLElement) => {
    focusableElements.current = getAllFocusableElements(container)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusedIndex = focusableElements.current.indexOf(document.activeElement as HTMLElement)
      const nextIndex = e.shiftKey ? focusedIndex - 1 : focusedIndex + 1

      if (nextIndex >= focusableElements.current.length) {
        focusableElements.current[0]?.focus()
        e.preventDefault()
      } else if (nextIndex < 0) {
        focusableElements.current[focusableElements.current.length - 1]?.focus()
        e.preventDefault()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }

  return { focusFirst, focusLast, trapFocus, getAllFocusableElements }
}

/**
 * Announce loading state changes
 */
export function useAccessibleLoading(isLoading: boolean, message = 'Loading...') {
  React.useEffect(() => {
    if (isLoading) {
      announceToScreenReader(message, 'polite')
    }
  }, [isLoading, message])
}

/**
 * Aria live region for dynamic content
 */
export function AriaLiveRegion({
  message,
  priority = 'polite',
}: {
  message: string
  priority?: 'polite' | 'assertive'
}) {
  return React.createElement('div', {
    role: 'status',
    'aria-live': priority,
    'aria-atomic': 'true',
    className: 'sr-only',
    children: message,
  })
}

/**
 * Accessibility audit helpers
 */
export function checkAccessibility() {
  const issues: string[] = []

  // Check for missing alt text on images
  document.querySelectorAll('img').forEach((img) => {
    if (!img.alt) {
      issues.push(`Image missing alt text: ${img.src}`)
    }
  })

  // Check for missing form labels
  document.querySelectorAll('input, textarea, select').forEach((input) => {
    const inputElement = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    if (!inputElement.id || !document.querySelector(`label[for="${inputElement.id}"]`)) {
      issues.push(`Form field missing label: ${inputElement.name || inputElement.id}`)
    }
  })

  // Check for proper heading hierarchy
  let lastLevel = 0
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const level = Number.parseInt(heading.tagName[1])
    if (level > lastLevel + 1) {
      issues.push(`Heading hierarchy issue: jumping from h${lastLevel} to h${level}`)
    }
    lastLevel = level
  })

  // Check for color contrast (basic check)
  document.querySelectorAll('*').forEach((element) => {
    const style = window.getComputedStyle(element)
    if (style.color && style.backgroundColor) {
      // This is a simplified check
      const text = element.textContent
      if (text && text.length < 50 && !isLink(element)) {
        // Could add real contrast calculation here
      }
    }
  })

  return issues
}

function isLink(element: Element): boolean {
  return element.tagName === 'A' || element.closest('a') !== null
}

// Run accessibility audit in development
if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const issues = checkAccessibility()
      if (issues.length > 0) {
        console.warn('[Accessibility Issues Found]', issues)
      }
    })
  }
}
