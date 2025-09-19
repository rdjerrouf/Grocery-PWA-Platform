import { notFound } from 'next/navigation'
import { StoreLayout } from '@/components/layout/StoreLayout'
import { ProductDetailView } from '@/components/shop/ProductDetailView'
import { getTenantBySlug, getCategoriesByTenant, getProductById, getProductsByCategory } from '@/lib/supabase/queries'
import { dbProductsToFrontend } from '@/lib/utils/product'

interface ProductDetailPageProps {
  params: {
    slug: string
    productId: string
  }
  searchParams: {
    locale?: 'fr' | 'ar'
  }
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const { slug, productId } = await params
  const resolvedSearchParams = await searchParams
  const locale = resolvedSearchParams.locale || 'fr'

  // Get tenant data
  const tenant = await getTenantBySlug(slug)
  if (!tenant) {
    notFound()
  }

  // Get categories for navigation
  const categories = await getCategoriesByTenant(tenant.id)

  // Get product details
  const dbProduct = await getProductById(productId)
  if (!dbProduct || dbProduct.tenant_id !== tenant.id) {
    notFound()
  }

  const product = dbProductsToFrontend([dbProduct])[0]

  // Get related products from the same category
  let relatedProducts = []
  if (dbProduct.category_id) {
    const dbRelatedProducts = await getProductsByCategory(tenant.id, dbProduct.category_id)
    // Filter out current product and limit to 4
    const filteredProducts = dbRelatedProducts.filter(p => p.id !== productId).slice(0, 4)
    relatedProducts = dbProductsToFrontend(filteredProducts)
  }

  return (
    <StoreLayout tenant={tenant} categories={categories} locale={locale}>
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        tenant={tenant}
        locale={locale}
      />
    </StoreLayout>
  )
}