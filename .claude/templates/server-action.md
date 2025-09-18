# Server Actions Templates (Next.js 14+)

## Basic Server Action Pattern

```tsx
// app/actions/products.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { Database } from '@/lib/database.types'

// Type safety with Zod
const productSchema = z.object({
  name_ar: z.string().min(1, 'Arabic name required'),
  name_fr: z.string().min(1, 'French name required'),
  description_ar: z.string().optional(),
  description_fr: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category_id: z.string().uuid('Invalid category'),
})

type ProductInput = z.infer<typeof productSchema>

// Create product action
export async function createProduct(input: ProductInput) {
  try {
    // Validate input
    const validated = productSchema.parse(input)

    // Get Supabase client
    const supabase = createServerActionClient<Database>({ cookies })

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    // Insert product
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...validated,
        sku: `PRD-${Date.now()}`,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: 'Failed to create product' }
    }

    // Revalidate cache
    revalidatePath('/products')
    revalidatePath('/admin/products')
    revalidateTag('products')

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

// Update product action
export async function updateProduct(
  productId: string,
  updates: Partial<ProductInput>
) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Validate updates
  const partialSchema = productSchema.partial()
  const validated = partialSchema.parse(updates)

  const { data, error } = await supabase
    .from('products')
    .update(validated)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate specific paths
  revalidatePath(`/products/${productId}`)
  revalidatePath('/admin/products')

  return { success: true, data }
}

// Delete product action
export async function deleteProduct(productId: string) {
  const supabase = createServerActionClient<Database>({ cookies })

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
}
```

## Form Integration with Server Actions

```tsx
// components/forms/ProductForm.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createProduct } from '@/app/actions/products'
import { useTranslations } from 'next-intl'

const initialState = {
  success: false,
  error: null,
  data: null,
}

export function ProductForm() {
  const t = useTranslations('products')
  const [state, formAction] = useFormState(createProduct, initialState)

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="bg-green-50 text-green-600 p-3 rounded">
          Product created successfully!
        </div>
      )}

      <div>
        <label htmlFor="name_ar" className="block text-sm font-medium">
          {t('nameArabic')}
        </label>
        <input
          id="name_ar"
          name="name_ar"
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label htmlFor="name_fr" className="block text-sm font-medium">
          {t('nameFrench')}
        </label>
        <input
          id="name_fr"
          name="name_fr"
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          {t('price')}
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          required
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {pending ? 'Creating...' : 'Create Product'}
    </button>
  )
}
```

## Complex Server Actions

### Order Processing with Transaction
```tsx
// app/actions/orders.ts
'use server'

export async function processOrder(
  customerInfo: CustomerInfo,
  cartItems: CartItem[],
  paymentMethod: 'edahabia' | 'cib'
) {
  const supabase = createServerActionClient({ cookies })

  try {
    // Start transaction using RPC
    const { data: orderId, error } = await supabase
      .rpc('create_order_transaction', {
        customer_info: customerInfo,
        items: cartItems,
        payment_method: paymentMethod,
      })

    if (error) throw error

    // Initialize payment
    const paymentResult = await initializePayment(
      orderId,
      calculateTotal(cartItems),
      paymentMethod
    )

    if (!paymentResult.success) {
      // Rollback order
      await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      throw new Error('Payment initialization failed')
    }

    // Clear cart
    if (customerInfo.userId) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', customerInfo.userId)
    }

    revalidatePath('/orders')
    revalidatePath('/cart')

    return {
      success: true,
      orderId,
      paymentUrl: paymentResult.checkoutUrl,
    }

  } catch (error) {
    console.error('Order processing error:', error)
    return {
      success: false,
      error: error.message || 'Order processing failed',
    }
  }
}
```

### Bulk Operations
```tsx
// app/actions/bulk.ts
'use server'

export async function bulkUpdatePrices(
  updates: Array<{ id: string; price: number }>
) {
  const supabase = createServerActionClient({ cookies })

  // Process in batches to avoid timeout
  const batchSize = 50
  const results = []

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)

    const promises = batch.map(({ id, price }) =>
      supabase
        .from('products')
        .update({ price, updated_at: new Date().toISOString() })
        .eq('id', id)
    )

    const batchResults = await Promise.allSettled(promises)
    results.push(...batchResults)
  }

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  revalidatePath('/products')

  return {
    success: failed === 0,
    succeeded,
    failed,
    total: updates.length,
  }
}
```

### File Upload Action
```tsx
// app/actions/upload.ts
'use server'

export async function uploadProductImages(
  productId: string,
  formData: FormData
) {
  const supabase = createServerActionClient({ cookies })
  const files = formData.getAll('images') as File[]

  if (files.length === 0) {
    return { success: false, error: 'No files provided' }
  }

  const uploadedUrls: string[] = []

  for (const file of files) {
    // Validate file
    if (!file.type.startsWith('image/')) {
      continue
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      continue
    }

    // Upload to Supabase Storage
    const filename = `${productId}/${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filename, file)

    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filename)

      uploadedUrls.push(publicUrl)

      // Save to database
      await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          url: publicUrl,
          order: uploadedUrls.length - 1,
        })
    }
  }

  revalidatePath(`/products/${productId}`)

  return {
    success: true,
    uploaded: uploadedUrls.length,
    urls: uploadedUrls,
  }
}
```

## Error Handling Pattern
```tsx
// lib/action-wrapper.ts
export async function withErrorHandling<T>(
  action: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await action()
    return { success: true, data }
  } catch (error) {
    console.error('Action error:', error)

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Usage
export async function deleteProduct(id: string) {
  return withErrorHandling(async () => {
    const supabase = createServerActionClient({ cookies })

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/products')
    return { deleted: true }
  })
}
```