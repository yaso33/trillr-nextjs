/**
 * Input validation utilities for common patterns
 */

import { ValidationError } from './errorHandler'

export interface ValidationRule<T> {
  validate: (value: T) => boolean | string
  message: string
}

/**
 * Email validation
 */
export function validateEmail(email: string): [boolean, string | null] {
  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return [false, 'Email is required']
  }
  if (!email_regex.test(email)) {
    return [false, 'Please enter a valid email address']
  }
  if (email.length > 254) {
    return [false, 'Email is too long']
  }
  return [true, null]
}

/**
 * Password validation with strength checking
 */
export interface PasswordStrength {
  isValid: boolean
  strength: 'weak' | 'fair' | 'good' | 'strong'
  score: number
  feedback: string[]
}

export function validatePassword(password: string, minLength = 8): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  if (!password) {
    return {
      isValid: false,
      strength: 'weak',
      score: 0,
      feedback: ['Password is required'],
    }
  }

  if (password.length < minLength) {
    feedback.push(`Password must be at least ${minLength} characters`)
  } else {
    score += 1
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include lowercase letters')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include uppercase letters')
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Include numbers')
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include special characters for better security')
  }

  const strength = score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong'

  return {
    isValid: score >= 2,
    strength,
    score,
    feedback,
  }
}

/**
 * Username validation
 */
export function validateUsername(username: string): [boolean, string | null] {
  if (!username) {
    return [false, 'Username is required']
  }
  if (username.length < 3) {
    return [false, 'Username must be at least 3 characters']
  }
  if (username.length > 30) {
    return [false, 'Username must be at most 30 characters']
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return [false, 'Username can only contain letters, numbers, underscores, and hyphens']
  }
  return [true, null]
}

/**
 * URL validation
 */
export function validateUrl(url: string): [boolean, string | null] {
  if (!url) {
    return [false, 'URL is required']
  }
  try {
    new URL(url)
    return [true, null]
  } catch {
    return [false, 'Please enter a valid URL']
  }
}

/**
 * Phone number validation (simple international format)
 */
export function validatePhoneNumber(phone: string): [boolean, string | null] {
  if (!phone) {
    return [false, 'Phone number is required']
  }
  // Remove common separators
  const cleaned = phone.replace(/[\s\-().]/g, '')
  if (!/^\+?[1-9]\d{1,14}$/.test(cleaned)) {
    return [false, 'Please enter a valid phone number']
  }
  return [true, null]
}

/**
 * Generic field validation with multiple rules
 */
export function validateField<T>(value: T, rules: ValidationRule<T>[]): [boolean, string | null] {
  for (const rule of rules) {
    const result = rule.validate(value)
    if (result === false) {
      return [false, rule.message]
    }
    if (typeof result === 'string') {
      return [false, result]
    }
  }
  return [true, null]
}

/**
 * Batch validation helper
 */
export interface ValidationSchema {
  [key: string]: (value: any) => [boolean, string | null]
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const [field, validator] of Object.entries(schema)) {
    const [isValid, error] = validator(data[field])
    if (!isValid && error) {
      errors[field] = error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Input sanitization helpers
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  return input.trim().slice(0, maxLength).replace(/[<>]/g, '') // Remove dangerous characters
}

export function sanitizeHtml(input: string): string {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

/**
 * Rate limiting check
 */
export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const attempts = new Map<string, { count: number; resetTime: number }>()

  return {
    check(key: string): [boolean, number] {
      const now = Date.now()
      const attempt = attempts.get(key)

      if (!attempt || now > attempt.resetTime) {
        attempts.set(key, { count: 1, resetTime: now + windowMs })
        return [true, maxAttempts - 1]
      }

      if (attempt.count >= maxAttempts) {
        const waitTime = Math.ceil((attempt.resetTime - now) / 1000)
        return [false, waitTime]
      }

      attempt.count++
      return [true, maxAttempts - attempt.count]
    },

    reset(key: string) {
      attempts.delete(key)
    },
  }
}
