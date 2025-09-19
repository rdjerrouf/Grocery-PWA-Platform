import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/shop/ProductCard'
import { StoreLayout } from '@/components/layout/StoreLayout'
import { getStoreData } from '@/lib/supabase/queries'
import { dbProductsToFrontend } from '@/lib/utils/product'
import { ShoppingBasket, Apple, Milk, Sandwich, Beef, Carrot, Cookie, Coffee } from 'lucide-react'

interface StorePageProps {
  params: {
    slug: string
  }
  searchParams: {
    locale?: 'fr' | 'ar'
  }
}

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const locale = resolvedSearchParams.locale || 'fr'

  // Fetch store data from Supabase
  const storeData = await getStoreData(slug)

  if (!storeData) {
    notFound()
  }

  const { tenant, categories, featuredProducts } = storeData


  // Convert database products to frontend format
  const products = dbProductsToFrontend(featuredProducts)

  // Get display name based on locale
  const storeName = locale === 'ar' ? (tenant.name_ar || tenant.name) : tenant.name

  // Category icon mapping
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes('fruits') || name.includes('فواكه')) return Apple
    if (name.includes('dairy') || name.includes('ألبان')) return Milk
    if (name.includes('bread') || name.includes('خبز')) return Sandwich
    if (name.includes('meat') || name.includes('لحوم')) return Beef
    if (name.includes('vegetables') || name.includes('خضروات')) return Carrot
    if (name.includes('snacks') || name.includes('وجبات')) return Cookie
    if (name.includes('beverages') || name.includes('مشروبات')) return Coffee
    return ShoppingBasket
  }

  return (
    <StoreLayout tenant={tenant} categories={categories} locale={locale}>
      <div className="bg-gray-50 min-h-screen">
        {/* Store Welcome Section */}
        <section className="bg-white py-6 px-4 border-b">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
              {locale === 'ar' ? (tenant.name_ar || tenant.name) : tenant.name}
            </h1>
            {tenant.address && (
              <p className={`text-gray-600 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                {tenant.address}
              </p>
            )}
          </div>
        </section>

        {/* Categories Navigation - Large Circular Icons */}
        {categories.length > 0 && (
          <section className="bg-white py-8 px-4 shadow-sm">
            <div className={`flex gap-8 overflow-x-auto scrollbar-hide ${locale === 'ar' ? 'justify-center flex-row-reverse' : 'justify-center'} max-w-6xl mx-auto`}>
              {categories.map((category) => {
                const categoryName = locale === 'ar' ?
                  (category.name_ar || category.name) :
                  category.name
                const IconComponent = getCategoryIcon(categoryName)

                return (
                  <a
                    key={category.id}
                    href={`/stores/${tenant.slug}/category/${category.slug}?locale=${locale}`}
                    className="flex flex-col items-center gap-3 min-w-[100px] cursor-pointer group"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center group-hover:from-green-500 group-hover:to-green-700 transition-all duration-300 shadow-lg group-hover:shadow-xl transform group-hover:scale-105">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <span className={`text-sm text-gray-800 text-center font-semibold leading-tight ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      {categoryName}
                    </span>
                  </a>
                )
              })}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="px-4 py-8">
          <h2 className={`text-2xl font-bold mb-8 max-w-6xl mx-auto ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            {locale === 'ar' ? 'المنتجات المميزة' : 'Produits en vedette'}
            <div className="w-16 h-1 bg-green-500 mt-2"></div>
          </h2>

          {products.length > 0 ? (
            <div
              className="flex justify-center gap-6 max-w-7xl mx-auto px-4"
              data-testid="product-grid"
            >
              {products.slice(0, 3).map((product, index) => (
                <div key={product.id} className="flex-1 max-w-sm">
                  <ProductCard
                    product={product}
                    locale={locale}
                    gradientIndex={index}
                    tenantId={tenant.id}
                    tenantSlug={tenant.slug}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {locale === 'ar' ?
                  'لا توجد منتجات مميزة متاحة حالياً' :
                  'Aucun produit en vedette disponible pour le moment'
                }
              </p>
            </div>
          )}
        </section>

        {/* Store Info */}
        <section className="mt-12 bg-white p-6 rounded-lg shadow-sm">
          <h3 className={`text-lg font-semibold mb-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            {locale === 'ar' ? 'معلومات المتجر' : 'Informations du magasin'}
          </h3>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            {tenant.contact_phone && (
              <div>
                <span className="font-medium">
                  {locale === 'ar' ? 'الهاتف:' : 'Téléphone:'}
                </span>
                <span className="ml-2">{tenant.contact_phone}</span>
              </div>
            )}
            {tenant.contact_email && (
              <div>
                <span className="font-medium">
                  {locale === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
                </span>
                <span className="ml-2">{tenant.contact_email}</span>
              </div>
            )}
            <div>
              <span className="font-medium">
                {locale === 'ar' ? 'رسوم التوصيل:' : 'Frais de livraison:'}
              </span>
              <span className="ml-2">{tenant.delivery_fee / 100} DZD</span>
            </div>
            <div>
              <span className="font-medium">
                {locale === 'ar' ? 'الحد الأدنى للطلب:' : 'Commande minimale:'}
              </span>
              <span className="ml-2">{tenant.minimum_order / 100} DZD</span>
            </div>
          </div>
        </section>
      </div>
    </StoreLayout>
  )
}