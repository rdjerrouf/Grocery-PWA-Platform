import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Plus, FolderTree, Eye, Edit, Trash2, Search, Package } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'

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
  return { success: true }
}

interface Category {
  id: string
  name: string
  name_ar: string | null
  name_fr: string | null
  slug: string
  description: string | null
  display_order: number
  is_active: boolean
  tenant_id: string | null
  created_at: string
  tenant?: {
    name: string
    slug: string
  } | null
  products?: Array<{ count: number }>
}

export default async function AdminCategoriesPage() {
  const supabase = createServerClient()

  // Get categories with product counts and tenant info
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      *,
      tenant:tenants(name, slug),
      products:products(count)
    `)
    .order('display_order', { ascending: true })

  // Get all tenants for the form
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
              <p className="mt-2 text-gray-600">Organize products into categories across all stores</p>
            </div>
            <a
              href="#create-category-form"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </a>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg mr-3 flex items-center justify-center">
                        <FolderTree className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">/{category.slug}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Multi-language names */}
                  {(category.name_ar || category.name_fr) && (
                    <div className="mb-4 space-y-1">
                      {category.name_fr && (
                        <p className="text-sm text-gray-600">🇫🇷 {category.name_fr}</p>
                      )}
                      {category.name_ar && (
                        <p className="text-sm text-gray-600" dir="rtl">🇸🇦 {category.name_ar}</p>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {category.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {category.products?.[0]?.count || 0}
                      </p>
                      <p className="text-xs text-gray-500">Products</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        #{category.display_order}
                      </p>
                      <p className="text-xs text-gray-500">Order</p>
                    </div>
                  </div>

                  {/* Store Assignment */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Store: {category.tenant ? category.tenant.name : 'All Stores'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/products?category=${category.slug}`}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded"
                        title="View Products"
                      >
                        <Package className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="p-2 text-gray-400 hover:text-green-600 rounded"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 rounded"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Link
                      href={`/admin/products?category=${category.slug}`}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      View Products →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12">
                <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first category.</p>
              </div>
            </div>
          )}
        </div>

        {/* Create New Category Form */}
        <div id="create-category-form" className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Category</h2>

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
                <p className="text-xs text-gray-500 mt-1">Will be used in URLs</p>
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
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
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
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors font-medium"
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