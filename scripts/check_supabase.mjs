#!/usr/bin/env node
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Supabase environment variables are not set. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key)

;(async () => {
  try {
    console.log('Attempting simple query against Supabase:', url)
    const { data, error } = await supabase.from('communities').select('id').limit(1)
    if (error) {
      console.error('Query error:', error.message || error)
      process.exit(2)
    }
    console.log('Query succeeded. Sample rows returned:', Array.isArray(data) ? data.length : 0)
    process.exit(0)
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(3)
  }
})()
