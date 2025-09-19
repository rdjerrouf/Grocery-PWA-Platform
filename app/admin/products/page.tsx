import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface Product {
  id: string
  name: string
  name_ar: string | null
  name_fr: string | null
  price: number
  stock_quantity: number | null
  is_active: boolean
  category: {
    name: string
    name_ar: string | null
  } | null
  tenant: {
    name: string
    slug: string
  }
}

export default async function AdminProductsPage() {
  const supabase = createServerClient()

  // TODO: Re-enable authentication after setting up admin user
  // Check if user is authenticated
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) {
  //   redirect('/auth/signin')
  // }

  // Fetch products with category and tenant info
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      name_ar,
      name_fr,
      price,
      stock_quantity,
      is_active,
      category:categories(name, name_ar),
      tenant:tenants(name, slug)
    `)
    .order('created_at', { ascending: false })

  // Fetch categories for filter dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  // Fetch tenants for filter dropdown
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
              <p className="mt-2 text-gray-600">Manage products across all tenants</p>
            </div>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Link>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Stores</option>
                {tenants?.map((tenant) => (
                  <option key={tenant.id} value={tenant.slug}>
                    {tenant.name}
                  </option>
                ))}
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Products</h2>
          </div>

          {products && products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
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
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.name_ar && (
                            <div className="text-sm text-gray-600" dir="rtl">
                              {product.name_ar}
                            </div>
                          )}
                          {product.name_fr && (
                            <div className="text-sm text-gray-600">
                              {product.name_fr}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.tenant?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price} DZD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock_quantity ?? 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/stores/${product.tenant?.slug}/product/${product.id}`}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            target="_blank"
                            title="View Product"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No products found</p>
                <p className="mt-2">Get started by adding your first product.</p>
                <Link
                  href="/admin/products/new"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {products && products.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-sm font-medium text-gray-500">Total Products</div>
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-sm font-medium text-gray-500">Active Products</div>
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.is_active).length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-sm font-medium text-gray-500">Out of Stock</div>
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock_quantity === 0).length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-sm font-medium text-gray-500">Low Stock</div>
              <div className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.stock_quantity && p.stock_quantity < 10).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}