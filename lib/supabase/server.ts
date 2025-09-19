import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

export const createServerClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export const createServerActionClient = () => createServerClient()