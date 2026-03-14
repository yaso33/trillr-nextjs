/**
 * Database Query Optimization Utilities
 * استخدام هذه الدوال لتحسين الـ queries
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// ============================================
// 1. Pagination helper
// ============================================
export function createPaginationQuery(page = 1, limit = 20) {
  const offset = (page - 1) * limit
  return { offset, limit }
}

// ============================================
// 2. Query optimized getters
// ============================================

/**
 * Get posts with optimized query
 * استخدم الـ index على created_at
 */
export async function getOptimizedPosts(supabase: SupabaseClient, page = 1, limit = 20) {
  const { offset, limit: pageLimit } = createPaginationQuery(page, limit)

  const { data, error, count } = await supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      content,
      image_url,
      created_at,
      updated_at,
      profiles:user_id(id, username, avatar_url, full_name),
      post_reactions(count),
      comments(count)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + pageLimit - 1)

  if (error) throw error

  return {
    data,
    total: count || 0,
    page,
    limit: pageLimit,
  }
}

/**
 * Get user posts efficiently
 */
export async function getUserPosts(supabase: SupabaseClient, userId: string, page = 1, limit = 20) {
  const { offset, limit: pageLimit } = createPaginationQuery(page, limit)

  const { data, error, count } = await supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      content,
      image_url,
      created_at,
      post_reactions(count),
      comments(count)
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId) // استخدم الـ index
    .order('created_at', { ascending: false })
    .range(offset, offset + pageLimit - 1)

  if (error) throw error

  return {
    data,
    total: count || 0,
    page,
    limit: pageLimit,
  }
}

/**
 * Get messages for conversation
 * استخدم الـ composite index
 */
export async function getConversationMessages(
  supabase: SupabaseClient,
  conversationId: string,
  page = 1,
  limit = 50
) {
  const { offset, limit: pageLimit } = createPaginationQuery(page, limit)

  const { data, error } = await supabase
    .from('messages')
    .select(
      `
      id,
      conversation_id,
      user_id,
      content,
      created_at,
      profiles:user_id(id, username, avatar_url)
    `
    )
    .eq('conversation_id', conversationId) // يستخدم الـ composite index
    .order('created_at', { ascending: true })
    .range(offset, offset + pageLimit - 1)

  if (error) throw error

  return {
    data,
    page,
    limit: pageLimit,
  }
}

/**
 * Get trending posts from materialized view
 * سريع جداً (pre-computed)
 */
export async function getTrendingPosts(supabase: SupabaseClient, limit = 20) {
  const { data, error } = await supabase
    .from('trending_posts')
    .select(
      `
      id,
      user_id,
      content,
      created_at,
      reaction_count,
      comment_count,
      engagement_score,
      profiles:user_id(id, username, avatar_url, full_name)
    `
    )
    .limit(limit)

  if (error) throw error

  return data
}

/**
 * Search posts بـ full-text search
 * استخدم GIN index
 */
export async function searchPosts(supabase: SupabaseClient, query: string, page = 1, limit = 20) {
  const { offset, limit: pageLimit } = createPaginationQuery(page, limit)

  // ملاحظة: Supabase لا يدعم full-text search مباشرة عبر REST
  // بدلاً من ذلك، نستخدم LIKE query (يحتاج تحسين):
  const { data, error, count } = await supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      content,
      created_at,
      profiles:user_id(id, username, avatar_url)
    `,
      { count: 'exact' }
    )
    .ilike('content', `%${query}%`) // Case-insensitive search
    .order('created_at', { ascending: false })
    .range(offset, offset + pageLimit - 1)

  if (error) throw error

  return {
    data,
    total: count || 0,
    page,
    limit: pageLimit,
  }
}

/**
 * Get user statistics
 * استخدم materialized view (سريع جداً)
 */
export async function getUserStats(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('user_statistics')
    .select(
      `
      id,
      post_count,
      following_count,
      follower_count,
      total_reactions_received,
      created_at,
      last_post_date
    `
    )
    .eq('id', userId)
    .single()

  if (error) throw error

  return data
}

/**
 * Check if user is following another user
 * استخدم الـ composite index
 */
export async function isUserFollowing(
  supabase: SupabaseClient,
  followerId: string,
  followingId: string
) {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return !!data
}

/**
 * Get community members efficiently
 */
export async function getCommunityMembers(
  supabase: SupabaseClient,
  communityId: string,
  page = 1,
  limit = 50
) {
  const { offset, limit: pageLimit } = createPaginationQuery(page, limit)

  const { data, error, count } = await supabase
    .from('community_members')
    .select(
      `
      user_id,
      role,
      joined_at,
      profiles:user_id(id, username, avatar_url, full_name)
    `,
      { count: 'exact' }
    )
    .eq('community_id', communityId)
    .order('joined_at', { ascending: false })
    .range(offset, offset + pageLimit - 1)

  if (error) throw error

  return {
    data,
    total: count || 0,
    page,
    limit: pageLimit,
  }
}

// ============================================
// 3. Batch operations (تقليل عدد الـ queries)
// ============================================

/**
 * Get multiple posts with reactions
 * بدل queryوة واحدة لكل post، اجعل واحدة لـ الكل
 */
export async function getPostsWithReactions(supabase: SupabaseClient, postIds: string[]) {
  if (postIds.length === 0) return []

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      content,
      created_at,
      post_reactions(id, emoji, user_id),
      comments(count)
    `
    )
    .in('id', postIds)

  if (error) throw error

  return data
}

// ============================================
// 4. Caching strategy
// ============================================

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry<any>>()

export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return null
  }

  return entry.data
}

export function setCache<T>(key: string, data: T, ttl = 300000) {
  // Default 5 minutes
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  })
}

export function invalidateCache(pattern: string) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

/**
 * Get data with cache
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300000
): Promise<T> {
  const cached = getFromCache<T>(key)
  if (cached) return cached

  const data = await fetcher()
  setCache(key, data, ttl)
  return data
}

// ============================================
// 5. Connection pooling tips
// ============================================

/**
 * استخدم statement pooling في Supabase settings:
 * - في Project Settings
 * - تحت Connection pooling
 * - اختر "Transaction" mode للـ serverless functions
 */

// ============================================
