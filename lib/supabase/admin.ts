import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const createAdminClient = () =>
  createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

// Admin functions that bypass RLS
export async function getAdminTenants() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createTenant(tenantData: {
  subdomain: string
  name_ar: string
  name_fr: string
  logo_url?: string
  settings?: any
}) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tenants')
    .insert(tenantData)
    .select()
    .single()

  if (error) throw error
  return data
}