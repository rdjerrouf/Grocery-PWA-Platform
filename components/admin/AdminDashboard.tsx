import { createServerClient } from '@/lib/supabase/server'
import { TrendingUp, TrendingDown, Package, Store, ShoppingCart, Users, DollarSign, Eye } from 'lucide-react'
import Link from 'next/link'
import { QuickActions } from './QuickActions'

interface DashboardStats {
  totalTenants: number
  totalProducts: number
  activeProducts: number
  totalOrders: number
  totalRevenue: number
  lowStockProducts: number
  recentTenants: any[]
  recentProducts: any[]
  topCategories: any[]
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerClient()

  // Get tenants count
  const { data: tenants } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })

  // Get products stats
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name), tenants(name, slug)')
    .order('created_at', { ascending: false })

  // Get categories with product count
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      products:products(count)
    `)
    .order('name')

  const activeProducts = products?.filter(p => p.is_active).length || 0
  const lowStockProducts = products?.filter(p => p.stock_quantity && p.stock_quantity < 10).length || 0

  // Group products by category for top categories
  const categoryStats = categories?.map(cat => ({
    ...cat,
    productCount: cat.products?.[0]?.count || 0
  })).sort((a, b) => b.productCount - a.productCount) || []

  return {
    totalTenants: tenants?.length || 0,
    totalProducts: products?.length || 0,
    activeProducts,
    totalOrders: 0, // TODO: Implement orders
    totalRevenue: 0, // TODO: Implement orders
    lowStockProducts,
    recentTenants: tenants?.slice(0, 5) || [],
    recentProducts: products?.slice(0, 5) || [],
    topCategories: categoryStats.slice(0, 5)
  }
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<any>
  color: string
  href?: string
}

function StatCard({ title, value, change, icon: Icon, color, href }: StatCardProps) {
  const content = (
    <div className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <Icon className={`w-8 h-8 text-${color}-600`} />
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

export async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your grocery platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Stores"
          value={stats.totalTenants}
          change={12}
          icon={Store}
          color="blue"
          href="/admin/stores"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          change={8}
          icon={Package}
          color="green"
          href="/admin/products"
        />
        <StatCard
          title="Active Products"
          value={stats.activeProducts}
          icon={Eye}
          color="purple"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockProducts}
          icon={TrendingDown}
          color="red"
        />
      </div>

      {/* Coming Soon Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 opacity-50">
        <StatCard
          title="Total Orders"
          value="Coming Soon"
          icon={ShoppingCart}
          color="yellow"
        />
        <StatCard
          title="Revenue"
          value="Coming Soon"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          title="Active Users"
          value="Coming Soon"
          icon={Users}
          color="pink"
        />
        <StatCard
          title="Conversion Rate"
          value="Coming Soon"
          icon={TrendingUp}
          color="cyan"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Stores */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Stores</h2>
            <Link href="/admin/stores" className="text-blue-600 hover:text-blue-700 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentTenants.length > 0 ? (
              stats.recentTenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-8 h-8 rounded mr-3"
                      style={{ backgroundColor: tenant.primary_color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-500">{tenant.slug}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    tenant.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No stores yet</p>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link href="/admin/products" className="text-blue-600 hover:text-blue-700 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentProducts.length > 0 ? (
              stats.recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.tenants?.name} • {product.categories?.name || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{product.price} DZD</p>
                    <span className={`px-2 py-1 text-xs rounded ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No products yet</p>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
            <Link href="/admin/categories" className="text-blue-600 hover:text-blue-700 text-sm">
              Manage
            </Link>
          </div>
          <div className="space-y-4">
            {stats.topCategories.length > 0 ? (
              stats.topCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                    {category.productCount} products
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No categories yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  )
}