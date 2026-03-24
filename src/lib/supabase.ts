import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string

export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseKey) &&
  supabaseUrl !== 'https://your-project.supabase.co'

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null
