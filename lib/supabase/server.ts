import { createServerComponentClient, createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './types'

export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies })

export const createServerActionClient = () =>
  createServerActionClient<Database>({ cookies })