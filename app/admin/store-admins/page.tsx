import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { StoreAdminAssignment } from '@/components/admin/StoreAdminAssignment'

async function assignStoreAdmin(formData: FormData) {
  'use server'

  const supabase = createServerClient()

  const adminData = {
    user_id: formData.get('user_id') as string,
    tenant_id: formData.get('tenant_id') as string,
    role: formData.get('role') as string || 'admin',
    permissions: {
      products: formData.get('products') === 'on',
      orders: formData.get('orders') === 'on',
      customers: formData.get('customers') === 'on',
      settings: formData.get('settings') === 'on'
    },
    is_active: true
  }

  const { error } = await supabase
    .from('store_admins')
    .upsert(adminData, {
      onConflict: 'user_id,tenant_id'
    })

  if (error) {
    console.error('Error assigning store admin:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/store-admins')
  return { success: true }
}

async function removeStoreAdmin(formData: FormData) {
  'use server'

  const supabase = createServerClient()
  const adminId = formData.get('admin_id') as string

  const { error } = await supabase
    .from('store_admins')
    .delete()
    .eq('id', adminId)

  if (error) {
    console.error('Error removing store admin:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/store-admins')
  return { success: true }
}

export default async function StoreAdminsPage() {
  const supabase = createServerClient()

  // Get all store admins with user and tenant information
  const { data: storeAdmins } = await supabase
    .from('store_admins')
    .select(`
      *,
      profiles!inner(
        id,
        email,
        full_name
      ),
      tenants!inner(
        id,
        slug,
        name,
        name_ar,
        name_fr
      )
    `)
    .order('created_at', { ascending: false })

  // Get all tenants for assignment dropdown
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, slug, name, name_ar, name_fr, is_active')
    .eq('is_active', true)
    .order('name')

  // Get all users (profiles) for assignment dropdown
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .order('email')

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Admin Management</h1>
          <p className="mt-2 text-gray-600">
            Assign store owners and admins to manage specific stores
          </p>
        </div>

        {/* Assignment Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Assign Store Admin</h2>

          <form action={assignStoreAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User *
                </label>
                <select
                  name="user_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a user...</option>
                  {profiles?.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name || profile.email} ({profile.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store *
                </label>
                <select
                  name="tenant_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a store...</option>
                  {tenants?.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="products"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Products</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="orders"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Orders</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="customers"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Customers</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Settings</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Assign Admin
              </button>
            </div>
          </form>
        </div>

        {/* Current Store Admins */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Current Store Admins</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {storeAdmins?.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {admin.profiles?.full_name || admin.profiles?.email}
                        </div>
                        <div className="text-sm text-gray-500">{admin.profiles?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{admin.tenants?.name}</div>
                        <div className="text-sm text-gray-500">/{admin.tenants?.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Object.entries(admin.permissions || {})
                        .filter(([_, value]) => value)
                        .map(([key, _]) => key)
                        .join(', ') || 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <form action={removeStoreAdmin} className="inline">
                        <input type="hidden" name="admin_id" value={admin.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to remove this store admin?')) {
                              e.preventDefault()
                            }
                          }}
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!storeAdmins || storeAdmins.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No store admins assigned yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}