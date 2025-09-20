import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StoreAdminLayout } from '@/components/store-admin/StoreAdminLayout'
import { StoreProductsList } from '@/components/store-admin/StoreProductsList'

interface StoreProductsPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    locale?: 'fr' | 'ar'
    category?: string
  }>
}

export default async function StoreProductsPage({ params, searchParams }: StoreProductsPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const locale = (resolvedSearchParams.locale || 'ar') as 'fr' | 'ar'
  const categoryFilter = resolvedSearchParams.category
  const supabase = createServerClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/stores/${resolvedParams.slug}/auth/signin?redirect=/stores/${resolvedParams.slug}/admin/products`)
  }

  // Get tenant information
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('is_active', true)
    .single()

  if (!tenant) {
    redirect('/')
  }

  // Check if user is authorized to access this store's admin
  const { data: storeAdmin } = await supabase
    .from('store_admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .single()

  if (!storeAdmin) {
    redirect(`/stores/${resolvedParams.slug}?locale=${locale}`)
  }

  // Get products for this store
  let productsQuery = supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        name_ar,
        name_fr
      )
    `)
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  if (categoryFilter) {
    productsQuery = productsQuery.eq('category_id', categoryFilter)
  }

  const { data: products } = await productsQuery

  // Get categories for this store
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('name')

  return (
    <StoreAdminLayout tenant={tenant} locale={locale}>
      <StoreProductsList
        products={products || []}
        categories={categories || []}
        tenant={tenant}
        locale={locale}
        categoryFilter={categoryFilter}
        storeAdmin={storeAdmin}
      />
    </StoreAdminLayout>
  )
}

export async function generateMetadata({ params, searchParams }: StoreProductsPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const locale = (resolvedSearchParams.locale || 'ar') as 'fr' | 'ar'

  return {
    title: locale === 'ar' ? 'إدارة المنتجات' : 'Gestion des produits',
    description: locale === 'ar'
      ? 'إدارة منتجات المتجر والمخزون والأسعار'
      : 'Gérez les produits, stock et prix du magasin',
  }
}