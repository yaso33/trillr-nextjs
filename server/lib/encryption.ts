import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32

function getEncryptionKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_SECRET ||
    process.env.SUPABASE_SERVICE_KEY ||
    'default-encryption-key-change-me'
  return crypto.scryptSync(secret, 'salt', 32)
}

export function encrypt(text: string): string {
  if (!text) return text

  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = getEncryptionKey()
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    return text
  }
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText

  if (!encryptedText.includes(':')) {
    return encryptedText
  }

  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      return encryptedText
    }

    const [ivHex, authTagHex, encrypted] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const key = getEncryptionKey()

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    return encryptedText
  }
}

export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

export function isEncrypted(text: string): boolean {
  if (!text) return false
  const parts = text.split(':')
  if (parts.length !== 3) return false

  const [ivHex, authTagHex, encrypted] = parts
  return (
    ivHex.length === IV_LENGTH * 2 &&
    authTagHex.length === AUTH_TAG_LENGTH * 2 &&
    encrypted.length > 0
  )
}
