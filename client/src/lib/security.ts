export function sanitizeHtml(html: string): string {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)

    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return '#'
    }

    return url
  } catch {
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url
    }
    return '#'
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }
  if (username.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }
  if (/^[0-9]/.test(username)) {
    return { valid: false, error: 'Username cannot start with a number' }
  }
  return { valid: true }
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return { valid: errors.length === 0, errors }
}

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100)
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type
  })
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  return file.size <= maxSizeInMB * 1024 * 1024
}

export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function obfuscateEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!domain) return email

  const obfuscatedName =
    name.length > 2 ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] : `${name[0]}*`

  return `${obfuscatedName}@${domain}`
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .trim()
}

export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
  ]

  return xssPatterns.some((pattern) => pattern.test(input))
}

let csrfToken: string | null = null

export function getCSRFToken(): string {
  if (!csrfToken) {
    csrfToken = generateNonce()
  }
  return csrfToken
}

export function setCSRFToken(token: string) {
  csrfToken = token
}

export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (!data || data.length <= visibleChars) return data
  const visible = data.slice(-visibleChars)
  const masked = '*'.repeat(Math.min(data.length - visibleChars, 10))
  return masked + visible
}

export function generateSecureToken(length = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
