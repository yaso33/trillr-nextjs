'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@lib/server/supabase'

/**
 * Server Action: Create a community.
 */
export async function createCommunity(
  ownerId: string,
  name: string,
  description = '',
  visibility: 'public' | 'private' | 'hidden' = 'public'
): Promise<{ data: any; error: string | null }> {
  if (!ownerId || !name?.trim()) return { data: null, error: 'Missing required fields' }

  try {
    const supabase = getAdminClient()

    const { data: existing } = await supabase
      .from('communities')
      .select('id')
      .ilike('name', name.trim())
      .limit(1)

    if (existing && existing.length > 0) {
      return { data: null, error: 'Community name already taken' }
    }

    const { data, error } = await supabase
      .from('communities')
      .insert([{ owner_id: ownerId, name: name.trim(), description, visibility }])
      .select()
      .single()

    if (error) throw error

    await supabase
      .from('community_members')
      .insert([{ community_id: data.id, user_id: ownerId, role: 'owner' }])

    revalidatePath('/communities')
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to create community' }
  }
}

/**
 * Server Action: Join a community.
 */
export async function joinCommunity(
  communityId: string,
  userId: string
): Promise<{ error: string | null }> {
  if (!communityId || !userId) return { error: 'Missing required fields' }

  try {
    const supabase = getAdminClient()

    const { data: existing } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .limit(1)

    if (existing && existing.length > 0) return { error: null }

    const { error } = await supabase
      .from('community_members')
      .insert([{ community_id: communityId, user_id: userId, role: 'member' }])

    if (error) throw error

    revalidatePath('/communities')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to join community' }
  }
}

/**
 * Server Action: Leave a community.
 */
export async function leaveCommunity(
  communityId: string,
  userId: string
): Promise<{ error: string | null }> {
  if (!communityId || !userId) return { error: 'Missing required fields' }

  try {
    const supabase = getAdminClient()

    const { data: community } = await supabase
      .from('communities')
      .select('owner_id')
      .eq('id', communityId)
      .single()

    if (community?.owner_id === userId) {
      return { error: 'Owner cannot leave the community' }
    }

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId)

    if (error) throw error

    revalidatePath('/communities')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to leave community' }
  }
}
