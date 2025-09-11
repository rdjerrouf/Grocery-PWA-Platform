import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/shop/ProductCard'
import { StoreLayout } from '@/components/layout/StoreLayout'
import { getStoreData } from '@/lib/supabase/queries'
import { dbProductsToFrontend } from '@/lib/utils/product'

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

  return (
    <StoreLayout tenant={tenant} categories={categories} locale={locale}>
      <div className="container mx-auto px-4 py-8">
        {/* Categories Navigation */}
        {categories.length > 0 && (
          <section className="mb-8">
            <div className={`flex gap-2 overflow-x-auto ${locale === 'ar' ? 'justify-end flex-row-reverse' : ''}`}>
              {categories.map((category) => {
                const categoryName = locale === 'ar' ? 
                  (category.name_ar || category.name) : 
                  category.name
                
                return (
                  <button
                    key={category.id}
                    className={`px-4 py-2 bg-secondary text-secondary-foreground rounded-lg whitespace-nowrap hover:bg-secondary/80 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    {categoryName}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section>
          <h2 className={`text-xl font-semibold mb-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            {locale === 'ar' ? 'المنتجات المميزة' : 'Produits en vedette'}
          </h2>
          
          {products.length > 0 ? (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              data-testid="product-grid"
            >
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  locale={locale}
                />
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
        <section className="mt-12 bg-card p-6 rounded-lg">
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