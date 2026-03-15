'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@lib/server/supabase'

/**
 * Server Action: Create a new post.
 * Called directly from client components — no fetch() needed.
 */
export async function createPost(
  userId: string,
  content: string,
  imageUrl?: string
): Promise<{ data: any; error: string | null }> {
  if (!userId || !content?.trim()) {
    return { data: null, error: 'userId and content are required' }
  }

  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('posts')
      .insert([{ user_id: userId, content: content.trim(), image_url: imageUrl }])
      .select(`*, profiles:user_id (id, username, full_name, avatar_url)`)
      .single()

    if (error) throw error

    revalidatePath('/')
    return { data, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create post'
    return { data: null, error: message }
  }
}

/**
 * Server Action: Toggle like on a post.
 */
export async function toggleLike(
  postId: string,
  userId: string,
  isLiked: boolean
): Promise<{ error: string | null }> {
  if (!postId || !userId) return { error: 'Missing required fields' }

  try {
    const supabase = getAdminClient()

    if (isLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }])
      if (error) throw error
    }

    revalidatePath('/')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to toggle like' }
  }
}

/**
 * Server Action: Toggle save on a post.
 */
export async function toggleSave(
  postId: string,
  userId: string,
  isSaved: boolean
): Promise<{ error: string | null }> {
  if (!postId || !userId) return { error: 'Missing required fields' }

  try {
    const supabase = getAdminClient()

    if (isSaved) {
      const { error } = await supabase
        .from('saves')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('saves')
        .insert([{ post_id: postId, user_id: userId }])
      if (error) throw error
    }

    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to toggle save' }
  }
}

/**
 * Server Action: Delete a post.
 */
export async function deletePost(
  postId: string,
  userId: string
): Promise<{ error: string | null }> {
  if (!postId || !userId) return { error: 'Missing required fields' }

  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId)

    if (error) throw error

    revalidatePath('/')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to delete post' }
  }
}
