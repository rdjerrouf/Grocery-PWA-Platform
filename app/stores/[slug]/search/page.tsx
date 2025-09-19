import { notFound } from 'next/navigation'
import { StoreLayout } from '@/components/layout/StoreLayout'
import { ProductCard } from '@/components/shop/ProductCard'
import { SearchBar } from '@/components/shop/SearchBar'
import { getTenantBySlug, getCategoriesByTenant, searchProducts } from '@/lib/supabase/queries'
import { dbProductsToFrontend } from '@/lib/utils/product'

interface SearchPageProps {
  params: {
    slug: string
  }
  searchParams: {
    q?: string
    category?: string
    locale?: 'fr' | 'ar'
  }
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const { q: query, category, locale = 'fr' } = resolvedSearchParams

  // Get tenant data
  const tenant = await getTenantBySlug(slug)
  if (!tenant) {
    notFound()
  }

  // Get categories for navigation
  const categories = await getCategoriesByTenant(tenant.id)

  // Search products if query exists
  let products = []
  if (query && query.trim()) {
    const dbProducts = await searchProducts(tenant.id, query.trim())
    products = dbProductsToFrontend(dbProducts)
  }

  // Get display name based on locale
  const storeName = locale === 'ar' ? (tenant.name_ar || tenant.name) : tenant.name

  return (
    <StoreLayout tenant={tenant} categories={categories} locale={locale}>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className={`text-2xl font-bold text-gray-900 mb-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
              {locale === 'ar' ? 'البحث في المنتجات' : 'Recherche de produits'}
            </h1>

            {/* Search Bar */}
            <SearchBar
              tenantSlug={tenant.slug}
              initialQuery={query || ''}
              locale={locale}
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {query ? (
            <>
              {/* Results Header */}
              <div className={`mb-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-lg font-semibold text-gray-900">
                  {locale === 'ar'
                    ? `نتائج البحث عن "${query}"`
                    : `Résultats pour "${query}"`
                  }
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {locale === 'ar'
                    ? `تم العثور على ${products.length} منتج${products.length > 1 ? 'ات' : ''}`
                    : `${products.length} produit${products.length > 1 ? 's' : ''} trouvé${products.length > 1 ? 's' : ''}`
                  }
                </p>
              </div>

              {/* Products Grid */}
              {products.length > 0 ? (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${
                    locale === 'ar' ? 'direction-rtl' : ''
                  }`}
                  data-testid="search-results"
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
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">
                      {locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat trouvé'}
                    </p>
                    <p className="mt-2">
                      {locale === 'ar'
                        ? 'جرب البحث بكلمات مختلفة أو تصفح الفئات'
                        : 'Essayez avec des mots différents ou parcourez les catégories'
                      }
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No Search Query */
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg font-medium">
                  {locale === 'ar' ? 'ابدأ البحث' : 'Commencez votre recherche'}
                </p>
                <p className="mt-2">
                  {locale === 'ar'
                    ? 'أدخل كلمة في مربع البحث للعثور على المنتجات'
                    : 'Entrez un terme dans la barre de recherche pour trouver des produits'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Popular Categories - Show when no search or no results */}
        {(!query || products.length === 0) && categories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pb-8">
            <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
              {locale === 'ar' ? 'تصفح الفئات' : 'Parcourir les catégories'}
            </h3>
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
              locale === 'ar' ? 'direction-rtl' : ''
            }`}>
              {categories.slice(0, 8).map((category) => {
                const categoryName = locale === 'ar' ?
                  (category.name_ar || category.name) :
                  category.name

                return (
                  <a
                    key={category.id}
                    href={`/stores/${tenant.slug}/category/${category.slug}?locale=${locale}`}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                  >
                    <h4 className={`font-medium text-gray-900 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      {categoryName}
                    </h4>
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  )
}