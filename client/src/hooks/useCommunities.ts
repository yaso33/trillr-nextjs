import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

// Define interfaces to match DB schema
export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface CommunityMember {
  user_id: string;
  community_id: string;
  role: 'admin' | 'moderator' | 'member';
  user: {
    username: string;
    name: string | null;
    avatar_url: string | null;
  }
}

// Hook to get communities a user has joined
export function useCommunities() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['communities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('community_members')
        .select('community:communities!inner(*)')
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error fetching user communities:', error);
        throw error;
      }
      // The result is an array of { community: Community }, so we map it
      return data.map(item => item.community) || [];
    },
    enabled: !!user,
  });
}

// Hook to discover public communities (example, can be expanded)
export function useDiscoverCommunities(q = '') {
  return useQuery<Community[]>_({ // Type assertion
    queryKey: ['discover-communities', q],
    queryFn: async () => {
      let query = supabase.from('communities').select('*');
      if (q) {
        query = query.ilike('name', `%${q}%`);
      }
      const { data, error } = await query.limit(50);

      if (error) {
        logger.error('Error discovering communities:', error);
        throw error;
      }
      return data || [];
    },
  });
}

// Hook to get a single community's details
export function useCommunity(communityId?: string) {
  return useQuery<Community | null>({
    queryKey: ['community', communityId],
    queryFn: async () => {
      if (!communityId) return null;
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();
      if (error) {
        logger.error(`Error fetching community ${communityId}:`, error);
        throw error;
      }
      return data;
    },
    enabled: !!communityId,
  });
}

// Hook to get a community's members
export function useCommunityMembers(communityId?: string) {
  return useQuery<CommunityMember[]>_({ // Type assertion
    queryKey: ['community-members', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      const { data, error } = await supabase
        .from('community_members')
        .select('*, user:users(username, name, avatar_url)')
        .eq('community_id', communityId);

      if (error) {
        logger.error(`Error fetching members for community ${communityId}:`, error);
        throw error;
      }
      return (data as any[]) || [];
    },
    enabled: !!communityId,
  });
}

// Mutation to create a new community
export function useCreateCommunity() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!user) throw new Error('User must be logged in.');
      
      // Use an RPC to create community and add user as admin in one transaction
      const { data, error } = await supabase.rpc('create_community_and_add_admin', { 
        p_user_id: user.id,
        p_name: name,
        p_description: description
      });

      if (error) {
        logger.error('Error creating community:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Community Created', description: 'Your new community is ready.' });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

// Mutation to join a community
export function useJoinCommunity() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ communityId }: { communityId: string }) => {
      if (!user) throw new Error('User must be logged in.');
      const { error } = await supabase.from('community_members').insert({
        community_id: communityId,
        user_id: user.id,
        role: 'member', // Default role
      });
      if (error) {
        logger.error(`Error joining community ${communityId}:`, error);
        // Handle case where user is already a member
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('You are already a member of this community.');
        }
        throw new Error('Failed to join community.');
      }
    },
    onSuccess: (_, { communityId }) => {
      toast({ title: 'Community Joined', description: 'Welcome!' });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community-members', communityId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

// Mutation to leave a community
export function useLeaveCommunity() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ communityId }: { communityId: string }) => {
            if (!user) throw new Error('User must be logged in.');
            const { error } = await supabase.from('community_members').delete()
                .eq('community_id', communityId)
                .eq('user_id', user.id);
            if (error) {
                logger.error(`Error leaving community ${communityId}:`, error);
                throw new Error('Failed to leave community.');
            }
        },
        onSuccess: (_, { communityId }) => {
            toast({ title: 'Community Left', description: 'You have left the community.' });
            queryClient.invalidateQueries({ queryKey: ['communities'] });
            queryClient.invalidateQueries({ queryKey: ['community-members', communityId] });
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });
}

// NOTE: Channel hooks are simplified. Assuming direct Supabase calls are preferred.
// You may need to create tables/RPCs for channels, channel_members etc.
