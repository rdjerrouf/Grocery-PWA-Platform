# Supabase Query Templates

## Basic CRUD Operations

### Server Component - Fetch Data
```tsx
// app/products/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; page?: string }
}) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const page = parseInt(searchParams.page || '1')
  const limit = 20

  // Build query
  let query = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('is_active', true)

  // Apply filters
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }

  if (searchParams.search) {
    query = query.or(
      `name_ar.ilike.%${searchParams.search}%,name_fr.ilike.%${searchParams.search}%`
    )
  }

  // Pagination
  const { data: products, count, error } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return <div>Error loading products</div>
  }

  return (
    <div>
      <ProductGrid products={products || []} />
      <Pagination
        currentPage={page}
        totalPages={Math.ceil((count || 0) / limit)}
      />
    </div>
  )
}
```

### Server Action - Create/Update
```tsx
// app/actions/products.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const productSchema = z.object({
  name_ar: z.string().min(1),
  name_fr: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category_id: z.string().uuid(),
})

export async function createProduct(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  // Validate input
  const validatedData = productSchema.parse({
    name_ar: formData.get('name_ar'),
    name_fr: formData.get('name_fr'),
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string),
    category_id: formData.get('category_id'),
  })

  // Check admin permission
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  // Insert product (RLS will add tenant_id automatically)
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...validatedData,
      sku: generateSKU(),
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/admin/products')
  revalidatePath('/products')

  return { success: true, data }
}

export async function updateProduct(
  productId: string,
  updates: Partial<Product>
) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/admin/products')
  revalidatePath(`/products/${productId}`)

  return { success: true, data }
}

function generateSKU() {
  return `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
```

### Client Component - Realtime
```tsx
// components/LiveInventory.tsx
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Database } from '@/lib/database.types'

type Product = Database['public']['Tables']['products']['Row']

export function LiveInventory({ productId }: { productId: string }) {
  const supabase = createClientComponentClient<Database>()
  const [stock, setStock] = useState<number>(0)

  useEffect(() => {
    // Initial fetch
    const fetchStock = async () => {
      const { data } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single()

      if (data) setStock(data.stock)
    }

    fetchStock()

    // Subscribe to changes
    const channel = supabase
      .channel('inventory')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => setStock(payload.new.stock)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId, supabase])

  return (
    <div className="flex items-center gap-2">
      <span className={stock > 0 ? 'text-green-600' : 'text-red-600'}>
        {stock} in stock
      </span>
      {stock < 10 && stock > 0 && (
        <span className="text-amber-600 text-sm">Low stock</span>
      )}
    </div>
  )
}
```

## Advanced Patterns

### Complex Queries with Joins
```tsx
// Fetch products with categories and images
const { data: products } = await supabase
  .from('products')
  .select(`
    *,
    category:categories(*),
    images:product_images(*),
    reviews:product_reviews(rating, count)
  `)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

### Upsert Operations
```tsx
// Update or insert cart item
const { data } = await supabase
  .from('cart_items')
  .upsert(
    {
      user_id: userId,
      product_id: productId,
      quantity: newQuantity,
    },
    {
      onConflict: 'user_id,product_id',
      ignoreDuplicates: false,
    }
  )
  .select()
```

### Batch Operations
```tsx
// Bulk insert order items
const { data } = await supabase
  .from('order_items')
  .insert(
    cartItems.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }))
  )
```

### RPC Functions
```tsx
// Call stored procedure for complex order creation
const { data } = await supabase
  .rpc('create_order_with_items', {
    customer_info: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+213555123456',
    },
    items: [
      { product_id: 'uuid', quantity: 2 },
      { product_id: 'uuid', quantity: 1 },
    ],
  })
```

### Full-Text Search
```tsx
// Search products in Arabic and French
const { data } = await supabase
  .from('products')
  .select('*')
  .textSearch('search_vector', query, {
    type: 'websearch',
    config: 'arabic',
  })
  .limit(20)
```

### Error Handling Pattern
```tsx
async function safeQuery<T>(queryFn: () => Promise<PostgrestResponse<T>>) {
  try {
    const { data, error } = await queryFn()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database operation failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Query failed:', error)
    throw error
  }
}

// Usage
const products = await safeQuery(() =>
  supabase.from('products').select('*').eq('is_active', true)
)
```