import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  revalidatePath('/')
  revalidatePath('/admin')

  return { success: true }
}

export default async function AdminPage() {
  const supabase = createServerClient()

  // Get existing tenants
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Admin Panel - Tenant Management
          </h1>

          {/* Create New Tenant Form */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Store</h2>
            <form action={createTenant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Slug (URL)
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name (English/French)
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Store
              </button>
            </form>
          </div>

          {/* Existing Tenants */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Existing Stores</h2>
            {tenants && tenants.length > 0 ? (
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {tenant.name}
                          {tenant.name_ar && (
                            <span className="mr-2 text-gray-600" dir="rtl">
                              ({tenant.name_ar})
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Slug: {tenant.slug} •
                          Delivery: {tenant.delivery_fee} DZD •
                          Min Order: {tenant.minimum_order} DZD
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: tenant.primary_color }}
                        ></div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          tenant.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tenant.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No stores created yet.</p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Back to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}