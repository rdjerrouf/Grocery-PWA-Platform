'use client'

import { useState } from 'react'
import { Trash2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
  slug: string
  description: string | null
  display_order: number
  tenant_id: string | null
  is_active: boolean
  products?: Array<{ count: number }>
}

interface CategoryFormProps {
  category: Category
  tenants: Tenant[]
  onUpdate: (formData: FormData) => Promise<any>
  onDelete: (formData: FormData) => Promise<any>
}

export function CategoryForm({ category, tenants, onUpdate, onDelete }: CategoryFormProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const formData = new FormData()
    formData.append('id', category.id)
    await onDelete(formData)
  }

  const productCount = category.products?.[0]?.count || 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/admin/categories"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Category Details</h2>
            <p className="text-sm text-gray-500">
              {productCount} product{productCount !== 1 ? 's' : ''} in this category
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Category
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "<strong>{category.name}</strong>"?
              {productCount > 0 && (
                <span className="text-red-600">
                  {' '}This will affect {productCount} product{productCount !== 1 ? 's' : ''}.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <form action={onUpdate} className="space-y-6">
        <input type="hidden" name="id" value={category.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name (Primary)*
            </label>
            <input
              type="text"
              name="name"
              defaultValue={category.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Slug (URL)*
            </label>
            <input
              type="text"
              name="slug"
              defaultValue={category.slug}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom en Français
            </label>
            <input
              type="text"
              name="name_fr"
              defaultValue={category.name_fr || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم بالعربية
            </label>
            <input
              type="text"
              name="name_ar"
              defaultValue={category.name_ar || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Assignment
            </label>
            <select
              name="tenant_id"
              defaultValue={category.tenant_id || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Stores (Global)</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              name="display_order"
              defaultValue={category.display_order}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={category.description || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              value="true"
              defaultChecked={category.is_active}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active (visible to customers)</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/categories"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}