import { supabase } from './client'
import type { Product, Category, Tenant } from './types'

// Get active tenant by slug (public access)
export async function getTenantBySlug(slug: string) {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single() // RLS policy handles is_active check

  if (error) {
    console.error('Error fetching tenant:', error)
    return null
  }

  return data as Tenant
}

// Get categories for a tenant (public access via RLS)
export async function getCategoriesByTenant(tenantId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data as Category[]
}

// Get products for a tenant (public access via RLS)
export async function getProductsByTenant(tenantId: string, categoryId?: string) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as Product[]
}

// Get featured products for a tenant (public access via RLS)
export async function getFeaturedProducts(tenantId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_featured', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return data as Product[]
}

// Get single product by ID (public access via RLS)
export async function getProductById(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as Product
}

// Search products by name (public access via RLS)
export async function searchProducts(tenantId: string, query: string, locale: 'fr' | 'ar' = 'fr') {
  const searchField = locale === 'ar' ? 'name_ar' : 'name'
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .or(`${searchField}.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error searching products:', error)
    return []
  }

  return data as Product[]
}

// Get products by tenant slug (for URL routing like /stores/ahmed-grocery)
export async function getProductsByTenantSlug(tenantSlug: string, categoryId?: string) {
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) {
    return []
  }
  
  return getProductsByTenant(tenant.id, categoryId)
}

// Get all data for a store page (tenant + categories + featured products)
export async function getStoreData(tenantSlug: string) {
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) {
    return null
  }

  const [categories, featuredProducts] = await Promise.all([
    getCategoriesByTenant(tenant.id),
    getFeaturedProducts(tenant.id)
  ])

  return {
    tenant,
    categories,
    featuredProducts
  }
}