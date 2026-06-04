import { createClient } from '@supabase/supabase-js'

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://wyghdpkxhpxnqomosivh.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'sb_publishable_8Mgp0j-3NCI-1utNM50F1A_kcx8cqMy'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
