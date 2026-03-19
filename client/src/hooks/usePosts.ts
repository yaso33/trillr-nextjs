import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'
import { useAuthenticatedMutation } from './useAuthenticatedMutation'

// Server Actions are assumed to be correct and are not modified here.
import {
  createPost as createPostAction,
  toggleLike as toggleLikeAction,
  toggleSave as toggleSaveAction,
  deletePost as deletePostAction,
} from '@actions/posts'

const POSTS_PER_PAGE = 10

// NOTE: The interface needs a matching 'author' property for the query to work.
export interface Post {
    id: string;
    author_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    author: {
        username: string;
        name: string | null;
        avatar_url: string | null;
    };
    is_liked?: boolean;
    is_saved?: boolean;
}

export function usePosts() {
  const { user } = useAuth()

  return useInfiniteQuery<Post[]>({ // Type assertion
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      // CORRECTED: Query 'users' via 'author_id' and select 'name'
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:author_id (username, name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        logger.error("Error fetching posts:", error);
        throw error
      }

      if (!user || posts.length === 0) {
        return (posts as any[]) || []
      }

      const postIds = posts.map((p) => p.id)

      // These tables ('post_likes', 'post_saves') might not exist yet.
      // Added try/catch to prevent fatal errors.
      let likedPostIds = new Set<string>();
      let savedPostIds = new Set<string>();

      try {
          const { data: likes } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds);
          likedPostIds = new Set(likes?.map((l) => l.post_id) || []);
      } catch (e) { logger.warn('Could not fetch post likes.') }

      try {
          const { data: saves } = await supabase.from('post_saves').select('post_id').eq('user_id', user.id).in('post_id', postIds);
          savedPostIds = new Set(saves?.map((s) => s.post_id) || []);
      } catch(e) { logger.warn('Could not fetch post saves.') }

      return posts.map((post) => ({
        ...post,
        is_liked: likedPostIds.has(post.id),
        is_saved: savedPostIds.has(post.id),
      })) as Post[]
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < POSTS_PER_PAGE) return undefined
      return allPages.length
    },
  })
}

export function useCreatePost() {
  const { toast } = useToast()
  const queryClient = useQueryClient();

  return useAuthenticatedMutation(
    async ({ content, image_url }, user) => {
      const { data, error } = await createPostAction(user.id, content, image_url)
      if (error) throw new Error(error)
      return data
    },
    {
      onSuccess: () => {
        toast({ title: 'Post created!', description: 'Your post has been published.' });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
    }
  )
}

export function useLikePost() {
    const queryClient = useQueryClient();
    return useAuthenticatedMutation(async ({ postId, isLiked }, user) => {
        const { error } = await toggleLikeAction(postId, user.id, isLiked)
        if (error) throw new Error(error)
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    })
}

export function useSavePost() {
    const queryClient = useQueryClient();
    return useAuthenticatedMutation(async ({ postId, isSaved }, user) => {
        const { error } = await toggleSaveAction(postId, user.id, isSaved)
        if (error) throw new Error(error)
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
        }
    })
}

export function useDeletePost() {
  const { toast } = useToast()
  const queryClient = useQueryClient();

  return useAuthenticatedMutation(
    async ({ postId, imageUrl }, user) => {
      const { error } = await deletePostAction(postId, user.id)
      if (error) throw new Error(error)

      if (imageUrl?.includes('supabase')) {
        try {
          const { deleteMedia } = await import('@/lib/storage')
          await deleteMedia(imageUrl)
        } catch (storageError) {
          logger.error('Failed to delete media from storage:', storageError)
        }
      }
    },
    {
      onSuccess: () => {
        toast({ title: 'Post deleted', description: 'Your post has been removed.' })
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
    }
  )
}

export function useUpdatePost() {
  const { toast } = useToast()
  const queryClient = useQueryClient();

  return useAuthenticatedMutation(
    async ({ postId, content, image_url }, user) => {
      // CORRECTED: Use author_id, query users, and select name
      const { data, error } = await supabase
        .from('posts')
        .update({ content, image_url })
        .eq('id', postId)
        .eq('author_id', user.id) // Corrected from user_id
        .select('*, author:author_id (username, name, avatar_url)')
        .single()

      if (error) throw new Error(`Failed to update post: ${error.message}`)
      return data
    },
    {
      onSuccess: (data) => {
        toast({ title: 'Post updated', description: 'Your post has been updated.' })
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
    }
  )
}

export function usePostLikes(postId: string) {
  return useQuery({
    queryKey: ['post-likes', postId],
    queryFn: async () => {
      if (!postId) return []

      // CORRECTED: Query 'post_likes' and join with 'users'
      const { data, error } = await supabase
        .from('post_likes')
        .select('user_id, user:user_id (username, name, avatar_url)')
        .eq('post_id', postId)

      if (error) {
        logger.error('Error fetching post likes', error)
        return []
      }
      return data || []
    },
    enabled: !!postId,
  })
}

export function useSavedPosts() {
  const { user } = useAuth()
  return useQuery<Post[]>({ // Type assertion
    queryKey: ['saved-posts', user?.id],
    queryFn: async () => {
      if (!user) return []

      // CORRECTED: Query 'post_saves' and join with 'posts' and then 'users'
      const { data, error } = await supabase
        .from('post_saves')
        .select(`
          post:posts (*, author:author_id(username, name, avatar_url))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error fetching saved posts', error)
        throw error
      }

      return data?.map((item: any) => item.post).filter(Boolean) || []
    },
    enabled: !!user,
  })
}
