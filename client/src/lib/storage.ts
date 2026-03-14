import {
  extractBucketFromUrl,
  extractFilePathFromUrl,
  generateFileName,
  isFileAllowedInBucket,
} from '@shared/bucketsConfig'
import { logger } from './logger'
import { supabase } from './supabase'

export type MediaType = 'image' | 'video' | 'audio'

export interface UploadResult {
  url: string
  path: string
}

export async function uploadMedia(
  file: File,
  type: MediaType,
  userId: string
): Promise<UploadResult> {
  const bucketName = 'posts-media'

  try {
    // Validate file
    isFileAllowedInBucket(bucketName, file)

    // Generate file name
    const fileName = generateFileName(bucketName, userId, file.name)

    logger.info(`Uploading ${type} to ${bucketName}:`, fileName)

    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    // Add cache busting parameter to force fresh image load
    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

    logger.info('Upload successful:', urlWithCacheBust)

    return {
      url: urlWithCacheBust,
      path: fileName,
    }
  } catch (error) {
    logger.error('Error uploading media:', error)
    throw error
  }
}

export async function uploadAvatar(file: File, userId: string): Promise<UploadResult> {
  const bucketName = 'avatars'

  try {
    // Validate file
    isFileAllowedInBucket(bucketName, file)

    // Generate file name
    const fileName = generateFileName(bucketName, userId, file.name)

    logger.info(`Uploading avatar to ${bucketName}:`, fileName)

    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
      cacheControl: '86400',
      upsert: true,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    // Add cache busting parameter to force fresh image load
    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

    logger.info('Avatar upload successful:', urlWithCacheBust)

    return {
      url: urlWithCacheBust,
      path: fileName,
    }
  } catch (error) {
    logger.error('Error uploading avatar:', error)
    throw error
  }
}

export async function uploadChatMedia(file: File, userId: string): Promise<UploadResult> {
  const bucketName = 'chat-media'

  try {
    // Validate file
    isFileAllowedInBucket(bucketName, file)

    // Generate file name
    const fileName = generateFileName(bucketName, userId, file.name)

    logger.info(`Uploading chat media to ${bucketName}:`, fileName)

    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    // Add cache busting parameter to force fresh image load
    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

    logger.info('Chat media upload successful:', urlWithCacheBust)

    return {
      url: urlWithCacheBust,
      path: fileName,
    }
  } catch (error) {
    logger.error('Error uploading chat media:', error)
    throw error
  }
}

export async function uploadVoiceComment(audioBlob: Blob, userId: string): Promise<UploadResult> {
  const bucketName = 'media-audio'
  const mimeType = audioBlob.type || 'audio/webm'
  const extensionMap: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/mpeg': 'mp3',
  }
  const extension = extensionMap[mimeType] || 'webm'
  const file = new File([audioBlob], `voice_comment_${Date.now()}.${extension}`, { type: mimeType })

  try {
    const fileName = `${userId}/${Date.now()}.${extension}`

    logger.info(`Uploading voice comment to ${bucketName}:`, fileName)

    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

    logger.info('Voice comment upload successful:', urlWithCacheBust)

    return {
      url: urlWithCacheBust,
      path: fileName,
    }
  } catch (error) {
    logger.error('Error uploading voice comment:', error)
    throw error
  }
}

export async function uploadShortVideo(file: File, userId: string): Promise<UploadResult> {
  const bucketName = 'short-videos'

  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp4'
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    logger.info(`Uploading short video to ${bucketName}:`, fileName)

    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

    logger.info('Short video upload successful:', urlWithCacheBust)

    return {
      url: urlWithCacheBust,
      path: fileName,
    }
  } catch (error) {
    logger.error('Error uploading short video:', error)
    throw error
  }
}

export async function uploadVoiceMessage(audioBlob: Blob, userId: string): Promise<UploadResult> {
  const bucketName = 'chat-audio'
  const mimeType = audioBlob.type || 'audio/webm'
  const extensionMap: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/mpeg': 'mp3',
  }
  const extension = extensionMap[mimeType] || 'webm'
  const file = new File([audioBlob], `voice_${Date.now()}.${extension}`, { type: mimeType })

  try {
    // Validate file
    isFileAllowedInBucket(bucketName, file)

    // Generate file name
    const fileName = generateFileName(bucketName, userId, file.name)

    logger.info(`Uploading voice message to ${bucketName}:`, fileName)

    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    // Add cache busting parameter to force fresh audio load
    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

    logger.info('Voice message upload successful:', urlWithCacheBust)

    return {
      url: urlWithCacheBust,
      path: fileName,
    }
  } catch (error) {
    logger.error('Error uploading voice message:', error)
    throw error
  }
}

export async function deleteMedia(url: string): Promise<void> {
  if (!url || !url.includes('supabase')) return

  try {
    const bucket = extractBucketFromUrl(url)
    const filePath = extractFilePathFromUrl(url)

    if (!bucket || !filePath) {
      logger.warn('Could not extract bucket or path from URL:', url)
      return
    }

    logger.info(`Deleting ${filePath} from ${bucket}`)
    await supabase.storage.from(bucket).remove([filePath])
    logger.info('Delete successful')
  } catch (error) {
    logger.error('Error deleting media:', error)
  }
}

/**
 * Get public URL for a file in a bucket
 * @param bucketName - Name of the bucket
 * @param filePath - Path to the file
 * @returns Public URL
 */
export function getPublicUrl(bucketName: string, filePath: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(filePath)
  return publicUrl
}

/**
 * List files in a bucket directory
 * @param bucketName - Name of the bucket
 * @param path - Directory path (optional)
 * @returns Array of files
 */
export async function listFiles(bucketName: string, path?: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.storage.from(bucketName).list(path)

    if (error) throw error
    return data || []
  } catch (error) {
    logger.error('Error listing files:', error)
    return []
  }
}

/**
 * Download a file from bucket
 * @param bucketName - Name of the bucket
 * @param filePath - Path to the file
 * @returns File blob
 */
export async function downloadFile(bucketName: string, filePath: string): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage.from(bucketName).download(filePath)

    if (error) throw error
    return data
  } catch (error) {
    logger.error('Error downloading file:', error)
    return null
  }
}
