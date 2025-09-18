'use server'

import { createServerActionClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const productSchema = z.object({
  name_ar: z.string().min(1, 'Arabic name required'),
  name_fr: z.string().min(1, 'French name required'),
  description_ar: z.string().optional(),
  description_fr: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category_id: z.string().uuid('Invalid category'),
  is_featured: z.boolean().default(false),
})

type ProductInput = z.infer<typeof productSchema>

export async function createProduct(input: ProductInput) {
  try {
    const validated = productSchema.parse(input)
    const supabase = createServerActionClient()

    // Check authentication and permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    // Insert product (RLS will ensure tenant isolation)
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...validated,
        sku: `PRD-${Date.now()}`,
        tenant_id: profile.tenant_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: 'Failed to create product' }
    }

    revalidatePath('/products')
    revalidatePath('/admin/products')

    return { success: true, data }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        errors: error.errors
      }
    }

    console.error('Unexpected error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateProduct(
  productId: string,
  updates: Partial<ProductInput>
) {
  try {
    const partialSchema = productSchema.partial()
    const validated = partialSchema.parse(updates)

    const supabase = createServerActionClient()

    // Check permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const { data, error } = await supabase
      .from('products')
      .update(validated)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/products/${productId}`)
    revalidatePath('/admin/products')

    return { success: true, data }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        errors: error.errors
      }
    }

    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = createServerActionClient()

    // Check permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return { success: false, error: 'Insufficient permissions' }
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/products')
    revalidatePath('/admin/products')

    return { success: true }

  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' }
  }
}