import { useAuth } from '@/hooks/useAuth'
import { ErrorLogger } from '@/lib/errorHandler'
import { useQuery } from '@tanstack/react-query'

export function useCommunityRole(communityId: string | null) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['community-role', communityId, user?.id],
    queryFn: async () => {
      if (!communityId || !user) return null
      const response = await fetch(`/api/communities/${communityId}/role?userId=${user.id}`)
      if (!response.ok) return null
      const data = await response.json()
      return data?.role as string | null
    },
    enabled: !!communityId && !!user?.id,
    retry: false,
    onError: (error) => ErrorLogger.log('Error fetching user role:', error),
  })
}

