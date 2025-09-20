'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { BrowserCache } from '@/lib/cache'

// Query keys
export const QUERY_KEYS = {
  PRODUCTS: 'products',
  PRODUCT: 'product',
  CATEGORIES: 'categories',
  CATEGORY: 'category',
  TENANTS: 'tenants',
  TENANT: 'tenant',
  CART: 'cart',
  ORDERS: 'orders',
  ORDER: 'order',
  USER: 'user',
} as const

// Products hooks
export function useProducts(tenantId: string, categoryId?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, tenantId, categoryId],
    queryFn: async () => {
      const cacheKey = `products_${tenantId}_${categoryId || 'all'}`

      // Try browser cache first
      const cached = BrowserCache.get(cacheKey)
      if (cached) return cached

      const supabase = createClient()
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            name_ar,
            name_fr,
            slug
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query.order('name')

      if (error) throw error

      // Cache in browser for 5 minutes
      BrowserCache.set(cacheKey, data, 5)

      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!tenantId,
  })
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT, productId],
    queryFn: async () => {
      const cacheKey = `product_${productId}`

      // Try browser cache first
      const cached = BrowserCache.get(cacheKey)
      if (cached) return cached

      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            name_ar,
            name_fr,
            slug
          ),
          tenants (
            id,
            name,
            name_ar,
            name_fr,
            slug
          )
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single()

      if (error) throw error

      // Cache in browser for 10 minutes
      BrowserCache.set(cacheKey, data, 10)

      return data
    },
    enabled: !!productId,
  })
}

export function useFeaturedProducts(tenantId: string, limit: number = 8) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, 'featured', tenantId, limit],
    queryFn: async () => {
      const cacheKey = `featured_products_${tenantId}_${limit}`

      // Try browser cache first
      const cached = BrowserCache.get(cacheKey)
      if (cached) return cached

      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            name_ar,
            name_fr,
            slug
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Cache in browser for 10 minutes
      BrowserCache.set(cacheKey, data, 10)

      return data || []
    },
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useSearchProducts(tenantId: string, searchTerm: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, 'search', tenantId, searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return []

      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            name_ar,
            name_fr,
            slug
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,name_ar.ilike.%${searchTerm}%,name_fr.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('name')
        .limit(20)

      if (error) throw error

      return data || []
    },
    enabled: enabled && !!tenantId && searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  })
}

// Categories hooks
export function useCategories(tenantId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, tenantId],
    queryFn: async () => {
      const cacheKey = `categories_${tenantId}`

      // Try browser cache first
      const cached = BrowserCache.get(cacheKey)
      if (cached) return cached

      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error

      // Cache in browser for 30 minutes
      BrowserCache.set(cacheKey, data, 30)

      return data || []
    },
    enabled: !!tenantId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useCategory(tenantId: string, slug: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORY, tenantId, slug],
    queryFn: async () => {
      const cacheKey = `category_${tenantId}_${slug}`

      // Try browser cache first
      const cached = BrowserCache.get(cacheKey)
      if (cached) return cached

      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) throw error

      // Cache in browser for 30 minutes
      BrowserCache.set(cacheKey, data, 30)

      return data
    },
    enabled: !!tenantId && !!slug,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Tenant hooks
export function useTenant(slug: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TENANT, slug],
    queryFn: async () => {
      const cacheKey = `tenant_${slug}`

      // Try browser cache first
      const cached = BrowserCache.get(cacheKey)
      if (cached) return cached

      const supabase = createClient()
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) throw error

      // Cache in browser for 1 hour
      BrowserCache.set(cacheKey, data, 60)

      return data
    },
    enabled: !!slug,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Mutation hooks for cache invalidation
export function useInvalidateProducts() {
  const queryClient = useQueryClient()

  return {
    invalidateProducts: (tenantId?: string) => {
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, tenantId] })
        // Clear browser cache
        BrowserCache.remove(`products_${tenantId}_all`)
        BrowserCache.remove(`featured_products_${tenantId}_8`)
      } else {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
      }
    },
    invalidateProduct: (productId: string) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT, productId] })
      BrowserCache.remove(`product_${productId}`)
    },
    invalidateCategories: (tenantId: string) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES, tenantId] })
      BrowserCache.remove(`categories_${tenantId}`)
    },
  }
}

// Prefetch hooks for performance
export function usePrefetchProduct() {
  const queryClient = useQueryClient()

  return {
    prefetchProduct: (productId: string) => {
      queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.PRODUCT, productId],
        queryFn: async () => {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              categories (
                id,
                name,
                name_ar,
                name_fr,
                slug
              ),
              tenants (
                id,
                name,
                name_ar,
                name_fr,
                slug
              )
            `)
            .eq('id', productId)
            .eq('is_active', true)
            .single()

          if (error) throw error
          return data
        },
        staleTime: 10 * 60 * 1000,
      })
    },
    prefetchProducts: (tenantId: string) => {
      queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.PRODUCTS, tenantId],
        queryFn: async () => {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              categories (
                id,
                name,
                name_ar,
                name_fr,
                slug
              )
            `)
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .order('name')

          if (error) throw error
          return data || []
        },
        staleTime: 5 * 60 * 1000,
      })
    },
  }
}