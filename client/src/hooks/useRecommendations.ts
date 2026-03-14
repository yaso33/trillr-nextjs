import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

interface RecommendedPost {
  id: string
  content: string
  image_url: string | null
  created_at: string
  likes_count: number
  comments_count: number
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface RecommendedUser {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  followers_count: number
}

interface RecommendedVideo {
  id: string
  video_url: string
  caption: string | null
  thumbnail_url: string | null
  likes_count: number
  views_count: number
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

const INTERACTION_WEIGHTS = {
  like: 3,
  comment: 4,
  share: 5,
  save: 4,
  view: 1,
}

export function useRecommendedPosts(limit = 20) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['recommended-posts', user?.id, limit],
    queryFn: async () => {
      if (!user) return []

      const { data: userLikes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)

      const likedPostIds = (userLikes || []).map((l) => l.post_id)

      const { data: similarUsers } = await supabase
        .from('post_likes')
        .select('user_id')
        .in('post_id', likedPostIds.slice(0, 20))
        .neq('user_id', user.id)
        .limit(30)

      const similarUserIds = Array.from(new Set((similarUsers || []).map((u) => u.user_id)))

      let recommendedPostIds: string[] = []

      if (similarUserIds.length > 0) {
        const { data: recommendedFromSimilar } = await supabase
          .from('post_likes')
          .select('post_id')
          .in('user_id', similarUserIds)
          .limit(limit * 2)

        const postScores = new Map<string, number>()
        ;(recommendedFromSimilar || []).forEach((p) => {
          if (!likedPostIds.includes(p.post_id)) {
            const current = postScores.get(p.post_id) || 0
            postScores.set(p.post_id, current + 1)
          }
        })

        recommendedPostIds = Array.from(postScores.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([id]) => id)
      }

      if (recommendedPostIds.length < limit) {
        const { data: trendingPosts } = await supabase
          .from('posts')
          .select('id')
          .not('id', 'in', `(${[...likedPostIds, ...recommendedPostIds].join(',') || 'null'})`)
          .order('likes_count', { ascending: false })
          .limit(limit - recommendedPostIds.length)

        recommendedPostIds.push(...(trendingPosts || []).map((p) => p.id))
      }

      if (recommendedPostIds.length === 0) return []

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          created_at,
          likes_count,
          comments_count,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .in('id', recommendedPostIds)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (posts || []).map((p: any) => ({
        ...p,
        profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
      })) as RecommendedPost[]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRecommendedUsers(limit = 10) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['recommended-users', user?.id, limit],
    queryFn: async () => {
      if (!user) return []

      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = (following || []).map((f) => f.following_id)

      const { data: friendsOfFriends } = await supabase
        .from('follows')
        .select('following_id')
        .in('follower_id', followingIds)
        .limit(50)

      const userScores = new Map<string, number>()
      ;(friendsOfFriends || []).forEach((f) => {
        if (!followingIds.includes(f.following_id) && f.following_id !== user.id) {
          const current = userScores.get(f.following_id) || 0
          userScores.set(f.following_id, current + 1)
        }
      })

      const recommendedUserIds = Array.from(userScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id)

      if (recommendedUserIds.length === 0) {
        const { data: popularUsers, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, bio, followers_count')
          .neq('id', user.id)
          .not('id', 'in', `(${followingIds.join(',') || 'null'})`)
          .order('followers_count', { ascending: false })
          .limit(limit)

        if (error) throw error
        return (popularUsers || []) as RecommendedUser[]
      }

      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, followers_count')
        .in('id', recommendedUserIds)

      if (error) throw error
      return (users || []) as RecommendedUser[]
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  })
}

export function useRecommendedVideos(limit = 20) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['recommended-videos', user?.id, limit],
    queryFn: async () => {
      if (!user) return []

      const { data: userLikes } = await supabase
        .from('video_likes')
        .select('video_id')
        .eq('user_id', user.id)

      const likedVideoIds = (userLikes || []).map((l) => l.video_id)

      const { data: similarUsers } = await supabase
        .from('video_likes')
        .select('user_id')
        .in('video_id', likedVideoIds.slice(0, 20))
        .neq('user_id', user.id)
        .limit(30)

      const similarUserIds = Array.from(new Set((similarUsers || []).map((u) => u.user_id)))

      let recommendedVideoIds: string[] = []

      if (similarUserIds.length > 0) {
        const { data: recommendedFromSimilar } = await supabase
          .from('video_likes')
          .select('video_id')
          .in('user_id', similarUserIds)
          .limit(limit * 2)

        const videoScores = new Map<string, number>()
        ;(recommendedFromSimilar || []).forEach((v) => {
          if (!likedVideoIds.includes(v.video_id)) {
            const current = videoScores.get(v.video_id) || 0
            videoScores.set(v.video_id, current + 1)
          }
        })

        recommendedVideoIds = Array.from(videoScores.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([id]) => id)
      }

      if (recommendedVideoIds.length < limit) {
        const { data: trendingVideos } = await supabase
          .from('short_videos')
          .select('id')
          .not('id', 'in', `(${[...likedVideoIds, ...recommendedVideoIds].join(',') || 'null'})`)
          .order('likes_count', { ascending: false })
          .limit(limit - recommendedVideoIds.length)

        recommendedVideoIds.push(...(trendingVideos || []).map((v) => v.id))
      }

      if (recommendedVideoIds.length === 0) {
        const { data: allVideos, error } = await supabase
          .from('short_videos')
          .select(`
            id,
            video_url,
            caption,
            thumbnail_url,
            likes_count,
            views_count,
            profiles:user_id (username, full_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        return (allVideos || []).map((v: any) => ({
          ...v,
          profiles: Array.isArray(v.profiles) ? v.profiles[0] : v.profiles,
        })) as RecommendedVideo[]
      }

      const { data: videos, error } = await supabase
        .from('short_videos')
        .select(`
          id,
          video_url,
          caption,
          thumbnail_url,
          likes_count,
          views_count,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .in('id', recommendedVideoIds)

      if (error) throw error
      return (videos || []).map((v: any) => ({
        ...v,
        profiles: Array.isArray(v.profiles) ? v.profiles[0] : v.profiles,
      })) as RecommendedVideo[]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}

export function useForYouFeed(limit = 30) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['for-you-feed', user?.id, limit],
    queryFn: async () => {
      if (!user) {
        const { data: trendingPosts, error } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            image_url,
            created_at,
            likes_count,
            comments_count,
            user_id,
            profiles:user_id (username, full_name, avatar_url)
          `)
          .order('likes_count', { ascending: false })
          .limit(limit)

        if (error) throw error
        return trendingPosts || []
      }

      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = (following || []).map((f) => f.following_id)

      const { data: followingPosts } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          created_at,
          likes_count,
          comments_count,
          user_id,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(Math.floor(limit * 0.6))

      const { data: trendingPosts } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          created_at,
          likes_count,
          comments_count,
          user_id,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .not('user_id', 'in', `(${[...followingIds, user.id].join(',')})`)
        .order('likes_count', { ascending: false })
        .limit(Math.floor(limit * 0.4))

      const combinedPosts = [...(followingPosts || []), ...(trendingPosts || [])]

      for (let i = combinedPosts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[combinedPosts[i], combinedPosts[j]] = [combinedPosts[j], combinedPosts[i]]
      }

      return combinedPosts.slice(0, limit)
    },
    staleTime: 2 * 60 * 1000,
  })
}
