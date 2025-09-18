# Coding Conventions (Next.js + Supabase)

## Supabase Client Usage

### Server Components (Recommended)
```tsx
// app/products/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function ProductsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: products, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) console.error('Error:', error)

  return <ProductList products={products} />
}
```

### Server Actions (Mutations)
```tsx
// app/actions/products.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  // Get current user's tenant
  const { data: { user } } = await supabase.auth.getUser()

  const product = {
    name_ar: formData.get('name_ar'),
    name_fr: formData.get('name_fr'),
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string),
  }

  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/products')
  return data
}
```

### Client Components (Realtime/Interactive)
```tsx
// components/LiveInventory.tsx
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export function LiveInventory({ productId }: { productId: string }) {
  const supabase = createClientComponentClient()
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

  return <span>{stock} in stock</span>
}
```

## File Structure Patterns

### Route Groups
```
app/
├── (marketing)/     # No layout, marketing pages
├── (shop)/          # Shop layout
├── (admin)/         # Admin layout, protected
└── (auth)/          # Auth pages
```

### Component Organization
```tsx
// components/products/ProductCard.tsx
import { Database } from '@/lib/database.types'

type Product = Database['public']['Tables']['products']['Row']

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  // Component logic
}
```

## Database Queries

### Type-Safe Queries
```tsx
import { Database } from '@/lib/database.types'

type Product = Database['public']['Tables']['products']['Row']
type InsertProduct = Database['public']['Tables']['products']['Insert']

// Typed query
const { data, error } = await supabase
  .from('products')
  .select('*, category:categories(*)')
  .returns<Product[]>()
```

### Common Patterns
```tsx
// Pagination
const { data, count } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: false })
  .range((page - 1) * limit, page * limit - 1)

// Search (Arabic/French)
const { data } = await supabase
  .from('products')
  .select()
  .or(`name_ar.ilike.%${search}%,name_fr.ilike.%${search}%`)

// Upsert
const { data } = await supabase
  .from('products')
  .upsert(product, { onConflict: 'tenant_id,sku' })

// Transactions (via Edge Function or RPC)
const { data } = await supabase
  .rpc('create_order_with_items', {
    order_data: order,
    items: orderItems
  })
```

## Error Handling
```tsx
// Server Component
export default async function Page() {
  const { data, error } = await supabase.from('products').select()

  if (error) {
    console.error('Database error:', error)
    return <ErrorState message="Failed to load products" />
  }

  return <ProductList products={data} />
}

// Server Action
export async function updateProduct(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/products')
    return { success: true, data }
  } catch (error) {
    console.error('Update failed:', error)
    return { success: false, error: error.message }
  }
}
```

## Authentication Patterns
```tsx
// Middleware to protect routes
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}
```

## Performance Tips
1. Use Server Components by default
2. Implement proper caching with revalidation
3. Use Supabase's built-in full-text search
4. Leverage RLS instead of manual filtering
5. Use realtime only where necessary
6. Batch operations when possible