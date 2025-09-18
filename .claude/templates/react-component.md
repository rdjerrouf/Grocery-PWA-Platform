# React Component Templates

## Server Component Pattern

```tsx
// app/products/[id]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Database } from '@/lib/database.types'
import { ProductImages } from '@/components/products/ProductImages'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

type Product = Database['public']['Tables']['products']['Row']

interface ProductPageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      reviews:product_reviews(rating, comment, user_name)
    `)
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <ProductImages images={product.images} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name_fr}
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              {product.name_ar}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-green-600">
              {formatPrice(product.price)} DZD
            </span>
            {product.compare_price && (
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.compare_price)} DZD
              </span>
            )}
          </div>

          <div className="prose max-w-none">
            <p>{product.description_fr}</p>
            <p className="text-right" dir="rtl">
              {product.description_ar}
            </p>
          </div>

          <AddToCartButton
            product={product}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
  }).format(price)
}
```

## Client Component with State

```tsx
// components/cart/AddToCartButton.tsx
'use client'

import { useState } from 'react'
import { useCartStore } from '@/stores/useCartStore'
import { Button } from '@/components/ui/button'
import { Minus, Plus, ShoppingCart } from 'lucide-react'

interface AddToCartButtonProps {
  product: {
    id: string
    name_fr: string
    name_ar: string
    price: number
    stock: number
  }
  className?: string
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { addItem, items } = useCartStore()

  const existingItem = items.find(item => item.productId === product.id)
  const currentQuantity = existingItem?.quantity || 0
  const maxQuantity = product.stock - currentQuantity

  const handleAddToCart = async () => {
    if (quantity > maxQuantity) return

    setIsLoading(true)
    try {
      await addItem({
        productId: product.id,
        name: product.name_fr,
        nameAr: product.name_ar,
        price: product.price,
        quantity,
      })
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (maxQuantity === 0) {
    return (
      <Button disabled className={className}>
        Out of Stock
      </Button>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span className="text-xl font-semibold min-w-[3rem] text-center">
          {quantity}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
          disabled={quantity >= maxQuantity}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isLoading || quantity > maxQuantity}
        className="w-full"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {isLoading ? 'Adding...' : 'Add to Cart'}
      </Button>

      {maxQuantity < 10 && (
        <p className="text-sm text-orange-600 text-center">
          Only {maxQuantity} left in stock
        </p>
      )}
    </div>
  )
}
```

## Form Component with Validation

```tsx
// components/forms/ProductForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProduct, updateProduct } from '@/app/actions/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const productSchema = z.object({
  name_ar: z.string().min(1, 'Arabic name is required'),
  name_fr: z.string().min(1, 'French name is required'),
  description_ar: z.string().optional(),
  description_fr: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category_id: z.string().min(1, 'Category is required'),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Partial<ProductFormData> & { id?: string }
  categories: Array<{ id: string; name_fr: string; name_ar: string }>
  onSuccess?: () => void
}

export function ProductForm({ product, categories, onSuccess }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!product?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product,
  })

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    try {
      let result

      if (isEditing && product?.id) {
        result = await updateProduct(product.id, data)
      } else {
        result = await createProduct(data)
      }

      if (result.success) {
        onSuccess?.()
      } else {
        console.error('Form submission error:', result.error)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* French Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Product Name (French)
          </label>
          <Input
            {...register('name_fr')}
            placeholder="Enter French name"
            error={errors.name_fr?.message}
          />
        </div>

        {/* Arabic Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Product Name (Arabic)
          </label>
          <Input
            {...register('name_ar')}
            placeholder="أدخل الاسم بالعربية"
            dir="rtl"
            error={errors.name_ar?.message}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Price (DZD)
          </label>
          <Input
            {...register('price', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.price?.message}
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Stock Quantity
          </label>
          <Input
            {...register('stock', { valueAsNumber: true })}
            type="number"
            placeholder="0"
            error={errors.stock?.message}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Category
          </label>
          <Select onValueChange={(value) => setValue('category_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name_fr} / {category.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && (
            <p className="text-sm text-red-600 mt-1">
              {errors.category_id.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* French Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description (French)
          </label>
          <Textarea
            {...register('description_fr')}
            placeholder="Enter French description"
            rows={4}
          />
        </div>

        {/* Arabic Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description (Arabic)
          </label>
          <Textarea
            {...register('description_ar')}
            placeholder="أدخل الوصف بالعربية"
            dir="rtl"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess?.()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEditing
              ? 'Updating...'
              : 'Creating...'
            : isEditing
            ? 'Update Product'
            : 'Create Product'
          }
        </Button>
      </div>
    </form>
  )
}
```

## List Component with Pagination

```tsx
// components/products/ProductGrid.tsx
import { Product } from '@/types/database'
import { ProductCard } from './ProductCard'
import { Pagination } from '@/components/ui/pagination'

interface ProductGridProps {
  products: Product[]
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function ProductGrid({
  products,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}
```

## Error Boundary Component

```tsx
// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Something went wrong
            </h2>
            <p className="text-gray-600">
              We encountered an error while loading this section.
            </p>
            <Button
              onClick={() => this.setState({ hasError: false })}
              variant="outline"
            >
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```