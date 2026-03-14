import { ErrorLogger } from '@/lib/errorHandler'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export function DebugCommunities() {
  const [status, setStatus] = useState<string>('Loading...')
  const [communities, setCommunities] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const debug = async () => {
      try {
        if (!supabase) {
          setStatus('Supabase is not configured')
          setError('Supabase is not configured. Check your environment variables.')
          return
        }

        // 1. Check auth
        const {
          data: { user },
        } = await supabase.auth.getUser()
        console.log('Current user:', user)
        setStatus(`Auth: ${user ? `Logged in as ${user.email}` : 'Not logged in'}`)

        // 2. Try to fetch communities
        console.log('Fetching communities...')
        const { data, error: fetchError } = await supabase
          .from('communities')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) {
          ErrorLogger.log(fetchError, 'DebugCommunitiesFetch')
          setError(fetchError.message)
          setStatus(`Error: ${fetchError.message}`)
          return
        }

        console.log('Data:', data)
        setCommunities(data || [])
        setStatus(`Success! Found ${data?.length || 0} communities`)
      } catch (err: any) {
        ErrorLogger.log(err, 'DebugCommunities')
        setError(err.message)
        setStatus(`Exception: ${err.message}`)
      }
    }

    debug()
  }, [])

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold mb-2">🐛 Debug Communities</h3>
      <p className="text-sm mb-2">Status: {status}</p>
      {error && <p className="text-red-600 text-sm mb-2">Error: {error}</p>}
      <div className="text-sm bg-white p-2 rounded border max-h-64 overflow-auto">
        <p>Communities count: {communities.length}</p>
        {communities.length > 0 && (
          <ul>
            {communities.map((c: any) => (
              <li key={c.id} className="py-1 border-b text-xs">
                {c.name} (ID: {c.id}) - Owner: {c.owner_id}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
