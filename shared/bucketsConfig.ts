/**
 * Buckets Configuration
 * 
 * This file contains all bucket configurations and helper functions
 * for managing storage buckets in Supabase
 */

export const BUCKETS_CONFIG = {
  // Posts Media Bucket
  POSTS_MEDIA: {
    name: 'posts-media',
    displayName: 'Posts Media',
    description: 'Storage for post images and videos',
    isPublic: true,
    maxFileSize: 104857600, // 100MB in bytes
    allowedFileTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      videos: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
    },
    pathPattern: '{userId}/{timestamp}.{ext}',
    cacheControl: '3600' // 1 hour
  },

  // Stories Bucket
  STORIES: {
    name: 'stories',
    displayName: 'Stories',
    description: 'Storage for stories (24-hour expiration)',
    isPublic: true,
    maxFileSize: 52428800, // 50MB in bytes
    allowedFileTypes: {
      images: ['image/jpeg', 'image/png', 'image/webp'],
      videos: ['video/mp4', 'video/quicktime']
    },
    pathPattern: '{userId}/{timestamp}.{ext}',
    cacheControl: '3600', // 1 hour
    expirationHours: 24
  },

  // Avatars Bucket
  AVATARS: {
    name: 'avatars',
    displayName: 'Profile Avatars',
    description: 'Storage for user profile pictures',
    isPublic: true,
    maxFileSize: 5242880, // 5MB in bytes
    allowedFileTypes: {
      images: ['image/jpeg', 'image/png', 'image/webp'],
      videos: []
    },
    pathPattern: '{userId}/{timestamp}.{ext}',
    cacheControl: '86400' // 24 hours
  },

  // Chat Media Bucket
  CHAT_MEDIA: {
    name: 'chat-media',
    displayName: 'Chat Media',
    description: 'Storage for images and files sent in chat',
    isPublic: true,
    maxFileSize: 26214400, // 25MB in bytes
    allowedFileTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      videos: ['video/mp4', 'video/quicktime']
    },
    pathPattern: '{userId}/{timestamp}.{ext}',
    cacheControl: '3600' // 1 hour
  },

  // Chat Audio Bucket
  CHAT_AUDIO: {
    name: 'chat-audio',
    displayName: 'Voice Messages',
    description: 'Storage for voice messages in chat',
    isPublic: true,
    maxFileSize: 10485760, // 10MB in bytes
    allowedFileTypes: {
      images: [],
      videos: [],
      audio: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav']
    },
    pathPattern: '{userId}/{timestamp}.{ext}',
    cacheControl: '3600' // 1 hour
  },

  // Media Audio Bucket (Voice Comments)
  MEDIA_AUDIO: {
    name: 'media-audio',
    displayName: 'Voice Comments',
    description: 'Storage for voice comments on posts and videos',
    isPublic: true,
    maxFileSize: 15728640, // 15MB in bytes
    allowedFileTypes: {
      images: [],
      videos: [],
      audio: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/m4a']
    },
    pathPattern: '{userId}/{timestamp}.{ext}',
    cacheControl: '3600' // 1 hour
  },

  // Short Videos Bucket (Reels-style)
  SHORT_VIDEOS: {
    name: 'short-videos',
    displayName: 'Short Videos',
    description: 'Storage for short-form video content (Reels/TikTok style)',
    isPublic: true,
    maxFileSize: 104857600, // 100MB in bytes
    allowedFileTypes: {
      images: [],
      videos: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo']
    },
    pathPattern: '{userId}/{timestamp}.{ext}',
    cacheControl: '3600' // 1 hour
  }
} as const

/**
 * Get bucket configuration by name
 * @param bucketName - Name of the bucket
 * @returns Bucket configuration object
 */
export function getBucketConfig(bucketName: string) {
  const configEntry = Object.entries(BUCKETS_CONFIG).find(
    ([, config]) => config.name === bucketName
  )
  return configEntry ? configEntry[1] : null
}

/**
 * Get all bucket names
 * @returns Array of bucket names
 */
export function getAllBucketNames(): string[] {
  return Object.values(BUCKETS_CONFIG).map(config => config.name)
}

/**
 * Check if file is allowed in bucket
 * @param bucketName - Name of the bucket
 * @param file - File to check
 * @returns true if file is allowed, false otherwise
 */
export function isFileAllowedInBucket(bucketName: string, file: File): boolean {
  const config = getBucketConfig(bucketName)
  if (!config) return false

  // Check file size
  if (file.size > config.maxFileSize) {
    throw new Error(
      `File size exceeds maximum of ${config.maxFileSize / (1024 * 1024)}MB`
    )
  }

  // Check file type
  const allowedMimeTypes = [
    ...config.allowedFileTypes.images,
    ...config.allowedFileTypes.videos,
    ...((config.allowedFileTypes as any).audio || [])
  ] as string[]

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(
      `File type ${file.type} is not allowed in ${bucketName} bucket`
    )
  }

  return true
}

/**
 * Get file extension from file name
 * @param fileName - Name of the file
 * @returns File extension
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts[parts.length - 1].toLowerCase()
}

/**
 * Generate file name based on pattern
 * @param bucketName - Name of the bucket
 * @param userId - User ID
 * @param originalFileName - Original file name
 * @returns Generated file name
 */
export function generateFileName(
  bucketName: string,
  userId: string,
  originalFileName: string
): string {
  const config = getBucketConfig(bucketName)
  if (!config) throw new Error(`Bucket ${bucketName} not found`)

  const ext = getFileExtension(originalFileName)
  const timestamp = Date.now()

  return config.pathPattern
    .replace('{userId}', userId)
    .replace('{timestamp}', timestamp.toString())
    .replace('{ext}', ext)
}

/**
 * Extract bucket name from storage URL
 * @param url - Storage URL
 * @returns Bucket name or null
 */
export function extractBucketFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/storage/v1/object/public/')
    if (urlParts.length < 2) return null

    const [bucket] = urlParts[1].split('/')
    return bucket || null
  } catch {
    return null
  }
}

/**
 * Extract file path from storage URL
 * @param url - Storage URL
 * @returns File path or null
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/storage/v1/object/public/')
    if (urlParts.length < 2) return null

    const [bucket, ...pathParts] = urlParts[1].split('/')
    return pathParts.join('/') || null
  } catch {
    return null
  }
}

/**
 * Get bucket storage stats
 * @param bucketName - Name of the bucket
 * @returns Storage stats
 */
export interface BucketStats {
  name: string
  displayName: string
  description: string
  isPublic: boolean
  maxFileSize: number
  maxFileSizeMB: number
  allowedFormats: string[]
  cacheControl: string
  expirationHours?: number
}

export function getBucketStats(bucketName: string): BucketStats | null {
  const config = getBucketConfig(bucketName)
  if (!config) return null

  const allowedFormats = [
    ...config.allowedFileTypes.images,
    ...config.allowedFileTypes.videos
  ]

  return {
    name: config.name,
    displayName: config.displayName,
    description: config.description,
    isPublic: config.isPublic,
    maxFileSize: config.maxFileSize,
    maxFileSizeMB: config.maxFileSize / (1024 * 1024),
    allowedFormats,
    cacheControl: config.cacheControl,
    expirationHours: (config as any).expirationHours
  }
}

/**
 * Log all bucket configurations
 * @returns void
 */
export function logAllBucketsConfig(): void {
  console.log('📦 Buckets Configuration:')
  console.log('========================\n')

  Object.entries(BUCKETS_CONFIG).forEach(([key, config]) => {
    console.log(`${key}:`)
    console.log(`  Name: ${config.name}`)
    console.log(`  Display Name: ${config.displayName}`)
    console.log(`  Public: ${config.isPublic}`)
    console.log(`  Max Size: ${config.maxFileSize / (1024 * 1024)}MB`)
    console.log(`  Images: ${config.allowedFileTypes.images.join(', ')}`)
    console.log(`  Videos: ${config.allowedFileTypes.videos.join(', ')}`)
    if ((config as any).expirationHours) {
      console.log(`  Expiration: ${(config as any).expirationHours} hours`)
    }
    console.log()
  })
}

// Helper Types
export type BucketName = keyof typeof BUCKETS_CONFIG
export type BucketConfig = typeof BUCKETS_CONFIG[BucketName]
