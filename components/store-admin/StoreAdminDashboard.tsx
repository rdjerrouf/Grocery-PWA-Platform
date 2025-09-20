import { createServerClient } from '@/lib/supabase/server'
import { Package, ShoppingCart, TrendingUp, TrendingDown, Users, DollarSign, Eye, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase/types'

type DbTenant = Database['public']['Tables']['tenants']['Row']

interface StoreAdminDashboardProps {
  tenant: DbTenant
  locale?: 'fr' | 'ar'
}

interface StoreStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  recentProducts: any[]
  recentOrders: any[]
}

async function getStoreStats(tenantId: string): Promise<StoreStats> {
  const supabase = createServerClient()

  // Get products stats for this store
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  // Get orders stats for this store
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  const activeProducts = products?.filter(p => p.is_active).length || 0
  const lowStockProducts = products?.filter(p => p.stock_quantity && p.stock_quantity < 10).length || 0
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

  return {
    totalProducts: products?.length || 0,
    activeProducts,
    lowStockProducts,
    totalOrders: orders?.length || 0,
    pendingOrders,
    totalRevenue,
    recentProducts: products?.slice(0, 5) || [],
    recentOrders: orders?.slice(0, 5) || []
  }
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<any>
  color: string
  href?: string
  locale?: 'fr' | 'ar'
}

function StatCard({ title, value, change, icon: Icon, color, href, locale = 'ar' }: StatCardProps) {
  const isRTL = locale === 'ar'

  const content = (
    <div className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-${color}-500 ${isRTL ? 'text-right border-r-4 border-l-0' : ''}`}>
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
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

export async function StoreAdminDashboard({ tenant, locale = 'ar' }: StoreAdminDashboardProps) {
  const stats = await getStoreStats(tenant.id)
  const isRTL = locale === 'ar'
  const storeName = locale === 'ar' ? (tenant.name_ar || tenant.name) : (tenant.name_fr || tenant.name)

  return (
    <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'ar' ? 'لوحة تحكم المتجر' : 'Tableau de bord du magasin'}
        </h1>
        <p className="text-gray-600 mt-2">
          {locale === 'ar'
            ? `إدارة متجر ${storeName}`
            : `Gestion du magasin ${storeName}`
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={locale === 'ar' ? 'إجمالي المنتجات' : 'Total des produits'}
          value={stats.totalProducts}
          change={8}
          icon={Package}
          color="blue"
          href={`/stores/${tenant.slug}/admin/products`}
          locale={locale}
        />
        <StatCard
          title={locale === 'ar' ? 'المنتجات النشطة' : 'Produits actifs'}
          value={stats.activeProducts}
          icon={Eye}
          color="green"
          locale={locale}
        />
        <StatCard
          title={locale === 'ar' ? 'مخزون منخفض' : 'Stock faible'}
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          color="orange"
          locale={locale}
        />
        <StatCard
          title={locale === 'ar' ? 'إجمالي الطلبات' : 'Total des commandes'}
          value={stats.totalOrders}
          change={12}
          icon={ShoppingCart}
          color="purple"
          href={`/stores/${tenant.slug}/admin/orders`}
          locale={locale}
        />
      </div>

      {/* Revenue and Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title={locale === 'ar' ? 'الإيرادات الإجمالية' : 'Revenus totaux'}
          value={`${stats.totalRevenue.toLocaleString()} ${tenant.currency}`}
          change={5}
          icon={DollarSign}
          color="emerald"
          locale={locale}
        />
        <StatCard
          title={locale === 'ar' ? 'الطلبات المعلقة' : 'Commandes en attente'}
          value={stats.pendingOrders}
          icon={TrendingUp}
          color="yellow"
          locale={locale}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-lg font-semibold text-gray-900">
              {locale === 'ar' ? 'المنتجات الحديثة' : 'Produits récents'}
            </h2>
            <Link
              href={`/stores/${tenant.slug}/admin/products`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {locale === 'ar' ? 'عرض الكل' : 'Voir tout'}
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentProducts.length > 0 ? (
              stats.recentProducts.map((product) => (
                <div key={product.id} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'ar' ? (product.name_ar || product.name) : (product.name_fr || product.name)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.categories?.name || (locale === 'ar' ? 'غير مصنف' : 'Non catégorisé')}
                    </p>
                  </div>
                  <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                    <p className="font-medium text-gray-900">{product.price} {tenant.currency}</p>
                    <span className={`px-2 py-1 text-xs rounded ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active
                        ? (locale === 'ar' ? 'نشط' : 'Actif')
                        : (locale === 'ar' ? 'غير نشط' : 'Inactif')
                      }
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {locale === 'ar' ? 'لا توجد منتجات بعد' : 'Aucun produit pour le moment'}
              </p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-lg font-semibold text-gray-900">
              {locale === 'ar' ? 'الطلبات الحديثة' : 'Commandes récentes'}
            </h2>
            <Link
              href={`/stores/${tenant.slug}/admin/orders`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {locale === 'ar' ? 'عرض الكل' : 'Voir tout'}
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <p className="font-medium text-gray-900">#{order.order_number}</p>
                    <p className="text-sm text-gray-500">{order.customer_name}</p>
                  </div>
                  <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                    <p className="font-medium text-gray-900">{order.total} {tenant.currency}</p>
                    <span className={`px-2 py-1 text-xs rounded ${
                      order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' && (locale === 'ar' ? 'معلق' : 'En attente')}
                      {order.status === 'completed' && (locale === 'ar' ? 'مكتمل' : 'Terminé')}
                      {order.status === 'cancelled' && (locale === 'ar' ? 'ملغي' : 'Annulé')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {locale === 'ar' ? 'لا توجد طلبات بعد' : 'Aucune commande pour le moment'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {locale === 'ar' ? 'إجراءات سريعة' : 'Actions rapides'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/stores/${tenant.slug}/admin/products/new`}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <Package className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="font-medium text-gray-900">
              {locale === 'ar' ? 'إضافة منتج' : 'Ajouter un produit'}
            </p>
          </Link>
          <Link
            href={`/stores/${tenant.slug}/admin/orders`}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="font-medium text-gray-900">
              {locale === 'ar' ? 'إدارة الطلبات' : 'Gérer les commandes'}
            </p>
          </Link>
          <Link
            href={`/stores/${tenant.slug}/admin/settings`}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="font-medium text-gray-900">
              {locale === 'ar' ? 'إعدادات المتجر' : 'Paramètres du magasin'}
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}