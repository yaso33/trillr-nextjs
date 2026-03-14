import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import { logger } from './logger'

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || (typeof window !== 'undefined' ? (window as any).__ENV__?.SUPABASE_URL : undefined)
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || (typeof window !== 'undefined' ? (window as any).__ENV__?.SUPABASE_ANON_KEY : undefined)

let supabaseClient: SupabaseClient | null = null
let isConfigured = false
let configLoaded = false

async function loadConfigFromServer() {
  if (configLoaded) return
  configLoaded = true

  try {
    const response = await fetch('/api/config')
    if (response.ok) {
      const config = await response.json()
      if (config.supabase?.url && config.supabase?.anonKey) {
        supabaseUrl = config.supabase.url
        supabaseAnonKey = config.supabase.anonKey
        logger.info('✓ Loaded Supabase config from server')
      }
    }
  } catch (error) {
    logger.warn('Failed to load config from server:', error)
  }
}

function initializeSupabase(): SupabaseClient | null {
  const missingVars: string[] = []

  if (!supabaseUrl || supabaseUrl.trim() === '') {
    missingVars.push('VITE_SUPABASE_URL')
  }

  if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
    missingVars.push('VITE_SUPABASE_ANON_KEY')
  }

  if (missingVars.length > 0) {
    logger.warn(
      `Missing Supabase environment variables: ${missingVars.join(', ')}. Please add them to enable full functionality.`
    )
    return null
  }

  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    logger.error('VITE_SUPABASE_URL must be a valid URL starting with http:// or https://')
    return null
  }

  isConfigured = true
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

// Try to initialize with environment variables first
supabaseClient = initializeSupabase()

// If not configured, try to load from server
if (!supabaseClient) {
  loadConfigFromServer().then(() => {
    supabaseClient = initializeSupabase()
    if (isConfigured && supabaseClient) {
      logger.info('✓ Supabase configured from server config')
    }
  })
} else {
  logger.info('✓ Supabase configured and ready')
}

if (!supabaseClient && !isConfigured) {
  logger.warn(
    'Supabase is NOT configured. Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = supabaseClient

export function isSupabaseConfigured(): boolean {
  return isConfigured && supabaseClient !== null
}

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }
  return supabaseClient
}

export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseClient) {
    return false
  }

  try {
    const { error } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      logger.error('Supabase connection check failed:', error)
      return false
    }
    return true
  } catch (error) {
    logger.error('Supabase connection check failed:', error)
    return false
  }
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
    }
  }
}
