
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

// Interface for a unified search result item
export interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'community';
  title: string;
  subtitle: string | null;
  avatar_url: string | null;
  slug: string;
}

/**
 * A unified search hook that calls the `search_all` RPC function.
 * @param searchTerm The term to search for.
 */
export function useSearch(searchTerm: string) {
  return useQuery<SearchResult[]>({ // Type assertion for the results
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      // Do not run the search if the term is empty or just whitespace
      if (!searchTerm.trim()) {
        return [];
      }

      // Call the RPC function in the database
      const { data, error } = await supabase.rpc('search_all', {
        p_search_term: searchTerm.trim(),
      });

      if (error) {
        logger.error('Error performing search:', error);
        throw new Error('Search failed to execute.');
      }

      return (data as any[]) || [];
    },
    // Only run the query if the searchTerm is not empty
    enabled: !!searchTerm.trim(),
  });
}
