import { createServerClient } from './server'
import { Database } from './types'

type DbTenant = Database['public']['Tables']['tenants']['Row']
type DbCategory = Database['public']['Tables']['categories']['Row']
type DbProduct = Database['public']['Tables']['products']['Row']

export interface StoreData {
  tenant: DbTenant
  categories: DbCategory[]
  featuredProducts: DbProduct[]
}

export async function getStoreData(slug: string): Promise<StoreData | null> {
  const supabase = createServerClient()

  // Get tenant by slug
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (tenantError || !tenant) {
    return null
  }

  // Get categories for this tenant
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('display_order')

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
  }

  // Get featured products for this tenant
  const { data: featuredProducts, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })

  if (productsError) {
    console.error('Error fetching products:', productsError)
  }

  return {
    tenant,
    categories: categories || [],
    featuredProducts: featuredProducts || []
  }
}

export async function getTenantBySlug(slug: string): Promise<DbTenant | null> {
  const supabase = createServerClient()

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !tenant) {
    return null
  }

  return tenant
}

export async function getCategoriesByTenant(tenantId: string): Promise<DbCategory[]> {
  const supabase = createServerClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories || []
}

export async function getProductsByCategory(
  tenantId: string,
  categoryId: string
): Promise<DbProduct[]> {
  const supabase = createServerClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return products || []
}

export async function searchProducts(
  tenantId: string,
  query: string
): Promise<DbProduct[]> {
  const supabase = createServerClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,name_fr.ilike.%${query}%,name_ar.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name')
    .limit(20)

  if (error) {
    console.error('Error searching products:', error)
    return []
  }

  return products || []
}