import { type SupabaseClient, createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

let supabase: SupabaseClient | null = null
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

interface UserInteraction {
  user_id: string
  post_id?: string
  video_id?: string
  interaction_type: 'like' | 'view' | 'comment' | 'share' | 'save'
  weight: number
}

interface ContentFeatures {
  id: string
  tags?: string[]
  category?: string
  created_at: string
  likes_count: number
  comments_count: number
  views_count: number
}

interface RecommendationScore {
  content_id: string
  score: number
  reason: string
}

const INTERACTION_WEIGHTS = {
  like: 3,
  comment: 4,
  share: 5,
  save: 4,
  view: 1,
}

const FRESHNESS_BOOST = 0.3
const COLLABORATIVE_WEIGHT = 0.4
const CONTENT_BASED_WEIGHT = 0.4
const POPULARITY_WEIGHT = 0.2

export class RecommendationEngine {
  private checkSupabase(): SupabaseClient {
    if (!supabase) {
      throw new Error('Supabase not configured for recommendations')
    }
    return supabase
  }

  async getRecommendedPosts(userId: string, limit = 20): Promise<string[]> {
    try {
      const [collaborativeScores, contentScores, popularScores] = await Promise.all([
        this.getCollaborativeFilteringScores(userId),
        this.getContentBasedScores(userId),
        this.getPopularityScores(),
      ])

      const combinedScores = this.combineScores(collaborativeScores, contentScores, popularScores)

      const rankedWithBias = this.applyPositionBias(combinedScores)

      return rankedWithBias
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.content_id)
    } catch (error) {
      console.error('Error getting recommendations:', error)
      return []
    }
  }

  async getRecommendedVideos(userId: string, limit = 20): Promise<string[]> {
    try {
      const client = this.checkSupabase()

      const { data: userLikes } = await client
        .from('video_likes')
        .select('video_id')
        .eq('user_id', userId)

      const likedVideoIds = (userLikes || []).map((l) => l.video_id)

      const { data: similarUsers } = await client
        .from('video_likes')
        .select('user_id, video_id')
        .in('video_id', likedVideoIds)
        .neq('user_id', userId)
        .limit(100)

      const similarUserIds = Array.from(new Set((similarUsers || []).map((u) => u.user_id)))

      const { data: recommendedVideos } = await client
        .from('video_likes')
        .select('video_id')
        .in('user_id', similarUserIds)
        .not('video_id', 'in', `(${likedVideoIds.join(',') || 'null'})`)
        .limit(limit * 2)

      const videoScores = new Map<string, number>()
      ;(recommendedVideos || []).forEach((v) => {
        const current = videoScores.get(v.video_id) || 0
        videoScores.set(v.video_id, current + 1)
      })

      const { data: trendingVideos } = await client
        .from('short_videos')
        .select('id, likes_count, views_count, created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      ;(trendingVideos || []).forEach((video) => {
        const freshnessScore = this.calculateFreshnessScore(video.created_at)
        const popularityScore = (video.likes_count || 0) * 2 + (video.views_count || 0) * 0.1
        const totalScore = popularityScore * 0.7 + freshnessScore * 100 * 0.3

        const current = videoScores.get(video.id) || 0
        videoScores.set(video.id, current + totalScore)
      })

      return Array.from(videoScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id)
    } catch (error) {
      console.error('Error getting video recommendations:', error)
      return []
    }
  }

  async getRecommendedUsers(userId: string, limit = 10): Promise<string[]> {
    try {
      const client = this.checkSupabase()

      const { data: following } = await client
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)

      const followingIds = (following || []).map((f) => f.following_id)

      const { data: friendsOfFriends } = await client
        .from('follows')
        .select('following_id')
        .in('follower_id', followingIds)
        .not('following_id', 'in', `(${[...followingIds, userId].join(',')})`)
        .limit(limit * 3)

      const userScores = new Map<string, number>()
      ;(friendsOfFriends || []).forEach((f) => {
        const current = userScores.get(f.following_id) || 0
        userScores.set(f.following_id, current + 1)
      })

      const { data: interactedUsers } = await client
        .from('post_likes')
        .select('posts(user_id)')
        .eq('user_id', userId)
        .limit(50)

      const likedAuthors = (interactedUsers || []).map((i: any) => i.posts?.user_id).filter(Boolean)

      likedAuthors.forEach((authorId: string) => {
        if (!followingIds.includes(authorId) && authorId !== userId) {
          const current = userScores.get(authorId) || 0
          userScores.set(authorId, current + 2)
        }
      })

      return Array.from(userScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id)
    } catch (error) {
      console.error('Error getting user recommendations:', error)
      return []
    }
  }

  private async getCollaborativeFilteringScores(userId: string): Promise<RecommendationScore[]> {
    try {
      const client = this.checkSupabase()

      const { data: userLikes } = await client
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId)

      const likedPostIds = (userLikes || []).map((l) => l.post_id)

      if (likedPostIds.length === 0) return []

      const { data: similarUsers } = await client
        .from('post_likes')
        .select('user_id')
        .in('post_id', likedPostIds)
        .neq('user_id', userId)
        .limit(50)

      const similarUserIds = Array.from(new Set((similarUsers || []).map((u) => u.user_id)))

      if (similarUserIds.length === 0) return []

      const { data: recommendedPosts } = await client
        .from('post_likes')
        .select('post_id')
        .in('user_id', similarUserIds)
        .not('post_id', 'in', `(${likedPostIds.join(',')})`)
        .limit(100)

      const postScores = new Map<string, number>()
      ;(recommendedPosts || []).forEach((p) => {
        const current = postScores.get(p.post_id) || 0
        postScores.set(p.post_id, current + 1)
      })

      return Array.from(postScores.entries()).map(([id, score]) => ({
        content_id: id,
        score: score / similarUserIds.length,
        reason: 'collaborative',
      }))
    } catch (error) {
      console.error('Collaborative filtering error:', error)
      return []
    }
  }

  private async getContentBasedScores(userId: string): Promise<RecommendationScore[]> {
    try {
      const client = this.checkSupabase()

      const { data: likedPosts } = await client
        .from('post_likes')
        .select('posts(id, content)')
        .eq('user_id', userId)
        .limit(20)

      if (!likedPosts || likedPosts.length === 0) return []

      const userKeywords = new Set<string>()
      likedPosts.forEach((item: any) => {
        if (item.posts?.content) {
          const words = item.posts.content.toLowerCase().split(/\s+/)
          words.forEach((word: string) => {
            if (word.length > 3) userKeywords.add(word)
          })
        }
      })

      const { data: recentPosts } = await client
        .from('posts')
        .select('id, content, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      const likedIds = likedPosts.map((p: any) => p.posts?.id).filter(Boolean)

      const scores: RecommendationScore[] = []
      ;(recentPosts || []).forEach((post) => {
        if (likedIds.includes(post.id)) return

        let matchScore = 0
        const postWords = post.content?.toLowerCase().split(/\s+/) || []

        postWords.forEach((word: string) => {
          if (userKeywords.has(word)) matchScore += 1
        })

        if (matchScore > 0) {
          scores.push({
            content_id: post.id,
            score: matchScore / userKeywords.size,
            reason: 'content_based',
          })
        }
      })

      return scores
    } catch (error) {
      console.error('Content-based filtering error:', error)
      return []
    }
  }

  private async getPopularityScores(): Promise<RecommendationScore[]> {
    try {
      const client = this.checkSupabase()

      const { data: popularPosts } = await client
        .from('posts')
        .select('id, likes_count, comments_count, created_at')
        .order('likes_count', { ascending: false })
        .limit(50)

      return (popularPosts || []).map((post) => {
        const engagementScore = (post.likes_count || 0) + (post.comments_count || 0) * 2
        const freshnessScore = this.calculateFreshnessScore(post.created_at)

        return {
          content_id: post.id,
          score: engagementScore * 0.7 + freshnessScore * 0.3,
          reason: 'popularity',
        }
      })
    } catch (error) {
      console.error('Popularity scoring error:', error)
      return []
    }
  }

  private combineScores(
    collaborative: RecommendationScore[],
    contentBased: RecommendationScore[],
    popularity: RecommendationScore[]
  ): RecommendationScore[] {
    const scoreMap = new Map<string, number>()

    collaborative.forEach((item) => {
      const current = scoreMap.get(item.content_id) || 0
      scoreMap.set(item.content_id, current + item.score * COLLABORATIVE_WEIGHT)
    })

    contentBased.forEach((item) => {
      const current = scoreMap.get(item.content_id) || 0
      scoreMap.set(item.content_id, current + item.score * CONTENT_BASED_WEIGHT)
    })

    popularity.forEach((item) => {
      const current = scoreMap.get(item.content_id) || 0
      scoreMap.set(item.content_id, current + item.score * POPULARITY_WEIGHT)
    })

    return Array.from(scoreMap.entries()).map(([id, score]) => ({
      content_id: id,
      score,
      reason: 'hybrid',
    }))
  }

  private applyPositionBias(scores: RecommendationScore[]): RecommendationScore[] {
    const maxScore = Math.max(...scores.map((s) => s.score), 1)

    return scores.map((item, index) => {
      const normalizedScore = item.score / maxScore
      const randomBoost = Math.random() * FRESHNESS_BOOST

      return {
        ...item,
        score: normalizedScore + randomBoost,
      }
    })
  }

  private calculateFreshnessScore(createdAt: string): number {
    const now = new Date()
    const created = new Date(createdAt)
    const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60)

    if (hoursAgo < 1) return 1.0
    if (hoursAgo < 6) return 0.9
    if (hoursAgo < 24) return 0.7
    if (hoursAgo < 72) return 0.5
    if (hoursAgo < 168) return 0.3
    return 0.1
  }
}

export const recommendationEngine = new RecommendationEngine()
