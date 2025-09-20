'use server'

import { createServerActionClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  tenantSlug: z.string().min(1, 'Tenant is required'),
  redirectTo: z.string().optional().nullable(),
})

const signUpSchema = signInSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  tenantSlug: z.string().min(1, 'Tenant is required'),
  redirectTo: z.string().optional().nullable(),
})

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  tenantSlug: z.string().min(1, 'Tenant is required'),
  redirectTo: z.string().optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function signIn(formData: FormData) {
  try {
    const validatedData = signInSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      tenantSlug: formData.get('tenantSlug'),
      redirectTo: formData.get('redirectTo'),
    })

    const supabase = createServerActionClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')

    const destination = validatedData.redirectTo || `/stores/${validatedData.tenantSlug}`
    redirect(destination)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', errors: error.errors }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signUp(formData: FormData) {
  try {
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      name: formData.get('name'),
      tenantSlug: formData.get('tenantSlug'),
      redirectTo: formData.get('redirectTo'),
    }

    const validatedData = signUpSchema.parse(rawData)

    const supabase = createServerActionClient()

    // Get tenant info first
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', validatedData.tenantSlug)
      .single()

    if (!tenant) {
      return { success: false, error: 'Invalid store' }
    }

    const { error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
          tenant_id: tenant.id,
          tenant_slug: validatedData.tenantSlug,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Redirect to email confirmation page
    redirect(`/stores/${validatedData.tenantSlug}/auth/confirm-email`)

  } catch (error) {
    // Handle Next.js redirect - this is normal behavior
    if (error?.message === 'NEXT_REDIRECT') {
      throw error // Re-throw redirect errors to let Next.js handle them
    }

    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', errors: error.errors }
    }

    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function forgotPassword(formData: FormData) {
  try {
    const validatedData = forgotPasswordSchema.parse({
      email: formData.get('email'),
      tenantSlug: formData.get('tenantSlug'),
      redirectTo: formData.get('redirectTo'),
    })

    const supabase = createServerActionClient()

    // Get tenant info first to validate
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', validatedData.tenantSlug)
      .single()

    if (!tenant) {
      return { success: false, error: 'Invalid store' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      validatedData.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/stores/${validatedData.tenantSlug}/auth/reset-password`,
      }
    )

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', errors: error.errors }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function resetPassword(formData: FormData) {
  try {
    const validatedData = resetPasswordSchema.parse({
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      tenantSlug: formData.get('tenantSlug'),
      redirectTo: formData.get('redirectTo'),
    })

    const supabase = createServerActionClient()

    const { error } = await supabase.auth.updateUser({
      password: validatedData.password
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')

    const destination = validatedData.redirectTo || `/stores/${validatedData.tenantSlug}`
    redirect(destination)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', errors: error.errors }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signOut() {
  const supabase = createServerActionClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}