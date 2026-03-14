import { supabase } from './storage'

export async function getEmailFromUsername(username: string): Promise<string | null> {
  if (!supabase) {
    console.error('Supabase client is not available in api.ts')
    return null
  }

  // First, get the user ID from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username.toLowerCase())
    .single()

  if (profileError || !profile) {
    console.error('Error fetching profile by username:', profileError)
    return null
  }

  const userId = profile.id

  // Then, use the admin client to get the user's email from the auth schema
  const { data: user, error: authError } = await supabase.auth.admin.getUserById(userId)

  if (authError || !user) {
    console.error('Error fetching user from auth:', authError)
    return null
  }

  return user.user.email ?? null
}
