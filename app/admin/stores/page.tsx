import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Plus, Store, Eye, Edit, Trash2, Search } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'

async function createTenant(formData: FormData) {
  'use server'

  const supabase = createServerClient()

  const tenantData = {
    slug: formData.get('slug') as string,
    name: formData.get('name') as string,
    name_fr: formData.get('name_fr') as string,
    name_ar: formData.get('name_ar') as string,
    primary_color: formData.get('primary_color') as string || '#10B981',
    delivery_fee: parseFloat(formData.get('delivery_fee') as string) || 200,
    minimum_order: parseFloat(formData.get('minimum_order') as string) || 1000,
    currency: 'DZD',
    is_active: true
  }

  const { error } = await supabase
    .from('tenants')
    .insert(tenantData)

  if (error) {
    console.error('Error creating tenant:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/stores')
  return { success: true }
}

interface Tenant {
  id: string
  name: string
  name_ar: string | null
  name_fr: string | null
  slug: string
  primary_color: string
  delivery_fee: number
  minimum_order: number
  is_active: boolean
  created_at: string
}

export default async function AdminStoresPage() {
  const supabase = createServerClient()

  // Get existing tenants with product counts
  const { data: tenants } = await supabase
    .from('tenants')
    .select(`
      *,
      products:products(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
              <p className="mt-2 text-gray-600">Manage your multi-tenant stores</p>
            </div>
            <a
              href="#create-store-form"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Store
            </a>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search stores..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tenants && tenants.length > 0 ? (
            tenants.map((tenant) => (
              <div key={tenant.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div
                        className="w-10 h-10 rounded-lg mr-3 flex items-center justify-center"
                        style={{ backgroundColor: tenant.primary_color }}
                      >
                        <Store className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                        <p className="text-sm text-gray-500">/{tenant.slug}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tenant.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Multi-language names */}
                  {(tenant.name_ar || tenant.name_fr) && (
                    <div className="mb-4 space-y-1">
                      {tenant.name_fr && (
                        <p className="text-sm text-gray-600">🇫🇷 {tenant.name_fr}</p>
                      )}
                      {tenant.name_ar && (
                        <p className="text-sm text-gray-600" dir="rtl">🇸🇦 {tenant.name_ar}</p>
                      )}
                    </div>
                  )}

                  {/* Store Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {tenant.products?.[0]?.count || 0}
                      </p>
                      <p className="text-xs text-gray-500">Products</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {tenant.delivery_fee} DZD
                      </p>
                      <p className="text-xs text-gray-500">Delivery Fee</p>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      Min Order: {tenant.minimum_order} DZD
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link
                        href={`/stores/${tenant.slug}`}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded"
                        target="_blank"
                        title="View Store"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/stores/${tenant.id}/edit`}
                        className="p-2 text-gray-400 hover:text-green-600 rounded"
                        title="Edit Store"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 rounded"
                        title="Delete Store"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Link
                      href={`/admin/products?store=${tenant.slug}`}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Manage Products →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12">
                <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stores yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first store.</p>
              </div>
            </div>
          )}
        </div>

        {/* Create New Store Form */}
        <div id="create-store-form" className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Store</h2>

          <form action={createTenant} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Slug (URL)*
                </label>
                <input
                  type="text"
                  name="slug"
                  placeholder="e.g., carrefour-alger"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Will be used in URL: /stores/your-slug</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name (Primary)*
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Carrefour Alger"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  placeholder="e.g., Carrefour Alger"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم بالعربية
                </label>
                <input
                  type="text"
                  name="name_ar"
                  placeholder="e.g., كارفور الجزائر"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  name="primary_color"
                  defaultValue="#10B981"
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Fee (DZD)
                </label>
                <input
                  type="number"
                  name="delivery_fee"
                  defaultValue="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order (DZD)
                </label>
                <input
                  type="number"
                  name="minimum_order"
                  defaultValue="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Create Store
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}