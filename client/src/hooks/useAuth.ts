import type { User } from '@shared/schema'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAuth() {
  const { data, error } = useSWR<{ user: User | null }>('/api/auth/me', fetcher)

  return {
    user: data?.user,
    loading: !data && !error,
    error: error,
  }
}
