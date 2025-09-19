import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
  redirect('/admin/stores')
}

export default function NewStorePage() {
  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/stores"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Store</h1>
              <p className="mt-2 text-gray-600">Add a new store to your multi-tenant platform</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
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

              <div className="md:col-span-2">
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

            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/stores"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
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