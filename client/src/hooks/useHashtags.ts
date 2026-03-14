import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export interface Hashtag {
  id: string
  name: string
  posts_count: number
  created_at: string
}

export function useTrendingHashtags() {
  return useQuery({
    queryKey: ['hashtags', 'trending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .order('posts_count', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    },
  })
}

export function useSearchHashtags(searchQuery: string) {
  return useQuery({
    queryKey: ['hashtags', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return []

      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .order('posts_count', { ascending: false })
        .limit(20)

      if (error) throw error
      return data || []
    },
    enabled: searchQuery.trim().length > 0,
  })
}
