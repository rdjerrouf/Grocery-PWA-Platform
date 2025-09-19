import { ReactNode } from 'react'
import { ArrowLeft, Search, ShoppingCart, User, Globe } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase/types'

type DbTenant = Database['public']['Tables']['tenants']['Row']
type DbCategory = Database['public']['Tables']['categories']['Row']

interface StoreLayoutProps {
  children: ReactNode
  tenant: DbTenant
  categories?: DbCategory[]
  locale?: 'fr' | 'ar'
}

export function StoreLayout({ children, tenant, categories = [], locale = 'fr' }: StoreLayoutProps) {
  const storeName = locale === 'ar' ? (tenant.name_ar || tenant.name) : (tenant.name_fr || tenant.name)
  const isRTL = locale === 'ar'

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Left side - Back button and Store name */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Retour à l\'accueil'}
              >
                <ArrowLeft className={`w-5 h-5 text-gray-600 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900" style={{ color: tenant.primary_color }}>
                  {storeName}
                </h1>
                {tenant.address && (
                  <p className="text-sm text-gray-500 max-w-xs truncate">
                    {tenant.address}
                  </p>
                )}
              </div>
            </div>

            {/* Right side - Actions */}
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Language Toggle */}
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={locale === 'ar' ? 'تغيير اللغة' : 'Changer la langue'}
              >
                <Globe className="w-5 h-5 text-gray-600" />
              </button>

              {/* Search */}
              <Link
                href={`/stores/${tenant.slug}/search`}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={locale === 'ar' ? 'البحث' : 'Rechercher'}
              >
                <Search className="w-5 h-5 text-gray-600" />
              </Link>

              {/* Cart */}
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                aria-label={locale === 'ar' ? 'سلة التسوق' : 'Panier'}
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {/* Cart badge - placeholder for now */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">
                  0
                </span>
              </button>

              {/* User */}
              <Link
                href={`/stores/${tenant.slug}/auth/signin`}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
              >
                <User className="w-5 h-5 text-gray-600" />
              </Link>
            </div>
          </div>

          {/* Quick category navigation */}
          {categories.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <div className={`flex gap-4 overflow-x-auto scrollbar-hide ${isRTL ? 'flex-row-reverse' : ''}`}>
                {categories.slice(0, 6).map((category) => {
                  const categoryName = locale === 'ar'
                    ? (category.name_ar || category.name)
                    : (category.name_fr || category.name)

                  return (
                    <Link
                      key={category.id}
                      href={`/stores/${tenant.slug}/category/${category.slug}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 whitespace-nowrap transition-colors"
                    >
                      {categoryName}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3" style={{ color: tenant.primary_color }}>
                {storeName}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                {tenant.contact_phone && (
                  <p>
                    <span className="font-medium">
                      {locale === 'ar' ? 'الهاتف:' : 'Téléphone:'}
                    </span>{' '}
                    {tenant.contact_phone}
                  </p>
                )}
                {tenant.contact_email && (
                  <p>
                    <span className="font-medium">
                      {locale === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
                    </span>{' '}
                    {tenant.contact_email}
                  </p>
                )}
                {tenant.address && (
                  <p>
                    <span className="font-medium">
                      {locale === 'ar' ? 'العنوان:' : 'Adresse:'}
                    </span>{' '}
                    {tenant.address}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {locale === 'ar' ? 'معلومات التوصيل' : 'Informations de livraison'}
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">
                    {locale === 'ar' ? 'رسوم التوصيل:' : 'Frais de livraison:'}
                  </span>{' '}
                  {tenant.delivery_fee} {tenant.currency}
                </p>
                <p>
                  <span className="font-medium">
                    {locale === 'ar' ? 'الحد الأدنى للطلب:' : 'Commande minimale:'}
                  </span>{' '}
                  {tenant.minimum_order} {tenant.currency}
                </p>
              </div>
            </div>
          </div>

          <div className={`mt-6 pt-6 border-t text-center text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p>
              {locale === 'ar'
                ? 'مدعوم بواسطة منصة البقالة متعددة المستأجرين'
                : 'Propulsé par la plateforme d\'épicerie multi-tenant'
              }
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}