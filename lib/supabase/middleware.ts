import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from './types'

export async function createMiddlewareSupabaseClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient<Database>({ req, res })
}

export async function getSession(req: NextRequest, res: NextResponse) {
  const supabase = await createMiddlewareSupabaseClient(req, res)
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUserProfile(req: NextRequest, res: NextResponse) {
  const supabase = await createMiddlewareSupabaseClient(req, res)
  const session = await getSession(req, res)

  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return profile
}