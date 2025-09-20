import { ReactNode } from 'react'
import Link from 'next/link'
import {
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  ArrowLeft,
  Globe
} from 'lucide-react'
import { Database } from '@/lib/supabase/types'

type DbTenant = Database['public']['Tables']['tenants']['Row']

interface StoreAdminLayoutProps {
  children: ReactNode
  tenant: DbTenant
  locale?: 'fr' | 'ar'
}

export function StoreAdminLayout({ children, tenant, locale = 'ar' }: StoreAdminLayoutProps) {
  const isRTL = locale === 'ar'
  const storeName = locale === 'ar' ? (tenant.name_ar || tenant.name) : (tenant.name_fr || tenant.name)

  const navigation = [
    {
      name: locale === 'ar' ? 'لوحة التحكم' : 'Tableau de bord',
      href: `/stores/${tenant.slug}/admin`,
      icon: BarChart3,
      current: true
    },
    {
      name: locale === 'ar' ? 'المنتجات' : 'Produits',
      href: `/stores/${tenant.slug}/admin/products`,
      icon: Package,
      current: false
    },
    {
      name: locale === 'ar' ? 'الطلبات' : 'Commandes',
      href: `/stores/${tenant.slug}/admin/orders`,
      icon: ShoppingCart,
      current: false
    },
    {
      name: locale === 'ar' ? 'العملاء' : 'Clients',
      href: `/stores/${tenant.slug}/admin/customers`,
      icon: Users,
      current: false
    },
    {
      name: locale === 'ar' ? 'الإعدادات' : 'Paramètres',
      href: `/stores/${tenant.slug}/admin/settings`,
      icon: Settings,
      current: false
    }
  ]

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Left side - Store info */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link
                href={`/stores/${tenant.slug}?locale=${locale}`}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={locale === 'ar' ? 'العودة للمتجر' : 'Retour au magasin'}
              >
                <ArrowLeft className={`w-5 h-5 text-gray-600 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ backgroundColor: tenant.primary_color }}
                >
                  <Store className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{storeName}</h1>
                  <p className="text-xs text-gray-500">
                    {locale === 'ar' ? 'لوحة تحكم المتجر' : 'Administration du magasin'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Language Toggle */}
              <div className="flex items-center gap-1">
                <Link
                  href={`/stores/${tenant.slug}/admin?locale=fr`}
                  className={`px-2 py-1 text-sm rounded transition-colors ${
                    locale === 'fr'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  FR
                </Link>
                <Link
                  href={`/stores/${tenant.slug}/admin?locale=ar`}
                  className={`px-2 py-1 text-sm rounded transition-colors ${
                    locale === 'ar'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  AR
                </Link>
              </div>

              {/* Store View */}
              <Link
                href={`/stores/${tenant.slug}?locale=${locale}`}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <Globe className="w-4 h-4 inline mr-1" />
                {locale === 'ar' ? 'عرض المتجر' : 'Voir le magasin'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className={`w-64 bg-white shadow-sm min-h-screen ${isRTL ? 'border-l' : 'border-r'}`}>
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''} ${
                        item.current
                          ? 'text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: item.current ? tenant.primary_color : undefined
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}