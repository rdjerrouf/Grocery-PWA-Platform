import { notFound } from 'next/navigation'
import { StoreLayout } from '@/components/layout/StoreLayout'
import { ProductCard } from '@/components/shop/ProductCard'
import { getTenantBySlug, getCategoriesByTenant, getProductsByCategory } from '@/lib/supabase/queries'
import { dbProductsToFrontend } from '@/lib/utils/product'

interface CategoryPageProps {
  params: {
    slug: string
    categorySlug: string
  }
  searchParams: {
    locale?: 'fr' | 'ar'
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug, categorySlug } = await params
  const resolvedSearchParams = await searchParams
  const locale = resolvedSearchParams.locale || 'fr'

  // Get tenant data
  const tenant = await getTenantBySlug(slug)
  if (!tenant) {
    notFound()
  }

  // Get all categories for navigation
  const categories = await getCategoriesByTenant(tenant.id)

  // Find the specific category
  const category = categories.find(cat => cat.slug === categorySlug)
  if (!category) {
    notFound()
  }

  // Get products for this category
  const dbProducts = await getProductsByCategory(tenant.id, category.id)
  const products = dbProductsToFrontend(dbProducts)

  // Get localized category name
  const categoryName = locale === 'ar' ? 
    (category.name_ar || category.name) : 
    (category.name_fr || category.name)

  return (
    <StoreLayout tenant={tenant} categories={categories} locale={locale}>
      <div className="bg-gray-50 min-h-screen">
        {/* Category Header */}
        <section className="bg-white py-8 px-4 border-b">
          <div className="max-w-7xl mx-auto">
            <div className={`${locale === 'ar' ? 'text-right' : 'text-left'}`}>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {categoryName}
              </h1>
              <p className="text-gray-600">
                {locale === 'ar'
                  ? `تصفح منتجات ${categoryName}`
                  : `Parcourez les produits de ${categoryName}`
                }
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          {products.length > 0 ? (
            <>
              <div className={`mb-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                <p className="text-sm text-gray-600">
                  {locale === 'ar'
                    ? `${products.length} منتج${products.length > 1 ? 'ات' : ''} متوفر${products.length > 1 ? 'ة' : ''}`
                    : `${products.length} produit${products.length > 1 ? 's' : ''} disponible${products.length > 1 ? 's' : ''}`
                  }
                </p>
              </div>

              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${
                  locale === 'ar' ? 'direction-rtl' : ''
                }`}
                data-testid="category-products"
              >
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    gradientIndex={index}
                    tenantId={tenant.id}
                    tenantSlug={tenant.slug}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg font-medium">
                  {locale === 'ar' ? 'لا توجد منتجات في هذه الفئة' : 'Aucun produit dans cette catégorie'}
                </p>
                <p className="mt-2">
                  {locale === 'ar'
                    ? 'تحقق مرة أخرى لاحقاً أو تصفح فئات أخرى'
                    : 'Vérifiez plus tard ou parcourez d\'autres catégories'
                  }
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Related Categories */}
        {categories.length > 1 && (
          <section className="max-w-7xl mx-auto px-4 pb-8">
            <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
              {locale === 'ar' ? 'فئات أخرى' : 'Autres catégories'}
            </h3>
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${locale === 'ar' ? 'direction-rtl' : ''}`}>
              {categories
                .filter(cat => cat.id !== category.id)
                .slice(0, 4)
                .map((cat) => {
                  const catName = locale === 'ar' ?
                    (cat.name_ar || cat.name) :
                    (cat.name_fr || cat.name)

                  return (
                    <a
                      key={cat.id}
                      href={`/stores/${tenant.slug}/category/${cat.slug}?locale=${locale}`}
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                    >
                      <h4 className={`font-medium text-gray-900 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                        {catName}
                      </h4>
                    </a>
                  )
                })}
            </div>
          </section>
        )}
      </div>
    </StoreLayout>
  )
}