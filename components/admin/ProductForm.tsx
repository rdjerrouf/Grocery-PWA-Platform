'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from './ImageUpload'

interface Tenant {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  name_ar: string | null
  name_fr: string | null
}

interface ProductFormData {
  tenant_id: string
  category_id: string
  name: string
  name_ar: string
  name_fr: string
  description: string
  description_ar: string
  description_fr: string
  price: number
  sale_price?: number
  stock_quantity: number
  unit: string
  weight?: number
  is_featured: boolean
  is_active: boolean
  image_url?: string
}

interface ProductFormProps {
  tenants: Tenant[]
  categories: Category[]
  initialData?: Partial<ProductFormData>
  isEditing?: boolean
  productId?: string
}

export default function ProductForm({
  tenants,
  categories,
  initialData,
  isEditing = false,
  productId
}: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState<ProductFormData>({
    tenant_id: initialData?.tenant_id || '',
    category_id: initialData?.category_id || '',
    name: initialData?.name || '',
    name_ar: initialData?.name_ar || '',
    name_fr: initialData?.name_fr || '',
    description: initialData?.description || '',
    description_ar: initialData?.description_ar || '',
    description_fr: initialData?.description_fr || '',
    price: initialData?.price || 0,
    sale_price: initialData?.sale_price || undefined,
    stock_quantity: initialData?.stock_quantity || 0,
    unit: initialData?.unit || 'piece',
    weight: initialData?.weight || undefined,
    is_featured: initialData?.is_featured || false,
    is_active: initialData?.is_active !== false, // Default to true
    image_url: initialData?.image_url || ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing && productId) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', productId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert([formData])

        if (error) throw error
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      console.error('Error saving product:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked
              : type === 'number' ? (value === '' ? 0 : Number(value))
              : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* Store Selection */}
      <div>
        <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700">
          Store *
        </label>
        <select
          id="tenant_id"
          name="tenant_id"
          value={formData.tenant_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a store</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Selection */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} {category.name_ar && `(${category.name_ar})`}
            </option>
          ))}
        </select>
      </div>

      {/* Product Names */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name (English) *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="name_ar" className="block text-sm font-medium text-gray-700">
            Product Name (Arabic)
          </label>
          <input
            type="text"
            id="name_ar"
            name="name_ar"
            value={formData.name_ar}
            onChange={handleChange}
            dir="rtl"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="name_fr" className="block text-sm font-medium text-gray-700">
            Product Name (French)
          </label>
          <input
            type="text"
            id="name_fr"
            name="name_fr"
            value={formData.name_fr}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (English)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="description_ar" className="block text-sm font-medium text-gray-700">
            Description (Arabic)
          </label>
          <textarea
            id="description_ar"
            name="description_ar"
            value={formData.description_ar}
            onChange={handleChange}
            rows={3}
            dir="rtl"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="description_fr" className="block text-sm font-medium text-gray-700">
            Description (French)
          </label>
          <textarea
            id="description_fr"
            name="description_fr"
            value={formData.description_fr}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Pricing and Stock */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (DZD) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700">
            Sale Price (DZD)
          </label>
          <input
            type="number"
            id="sale_price"
            name="sale_price"
            value={formData.sale_price || ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            id="stock_quantity"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
            Unit
          </label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="piece">Piece</option>
            <option value="kg">Kilogram</option>
            <option value="g">Gram</option>
            <option value="l">Liter</option>
            <option value="ml">Milliliter</option>
            <option value="pack">Pack</option>
            <option value="box">Box</option>
          </select>
        </div>
      </div>

      {/* Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
            Weight (grams)
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight || ''}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Product Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <ImageUpload
          value={formData.image_url}
          onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
          bucket="product-images"
          folder="products"
          maxSize={5}
        />
      </div>

      {/* Checkboxes */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <input
            id="is_featured"
            name="is_featured"
            type="checkbox"
            checked={formData.is_featured}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
            Featured Product
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </form>
  )
}