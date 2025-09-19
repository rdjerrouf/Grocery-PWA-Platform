import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

async function createCategory(formData: FormData) {
  'use server'

  const supabase = createServerClient()

  const categoryData = {
    name: formData.get('name') as string,
    name_ar: formData.get('name_ar') as string || null,
    name_fr: formData.get('name_fr') as string || null,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string || null,
    display_order: parseInt(formData.get('display_order') as string) || 0,
    tenant_id: formData.get('tenant_id') as string || null,
    is_active: true
  }

  const { error } = await supabase
    .from('categories')
    .insert(categoryData)

  if (error) {
    console.error('Error creating category:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export default async function NewCategoryPage() {
  const supabase = createServerClient()

  // Get all tenants for the form
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/categories"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Category</h1>
              <p className="mt-2 text-gray-600">Add a new category to organize your products</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form action={createCategory} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name (Primary)*
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Fresh Produce"
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
                  placeholder="e.g., fresh-produce"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Will be used in URLs (no spaces, lowercase)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom en Français
                </label>
                <input
                  type="text"
                  name="name_fr"
                  placeholder="e.g., Produits Frais"
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
                  placeholder="e.g., منتجات طازجة"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Stores (Global)</option>
                  {tenants?.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Leave empty to make available for all stores</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="display_order"
                  defaultValue="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (0 = highest priority)</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Optional description for this category..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">This will help customers understand what products are in this category</p>
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
                className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}