import { createServerClient } from './server'
import { createCachedQuery, CACHE_TAGS, CACHE_TIMES } from '../cache'

// Cached tenant queries
export const getCachedTenant = createCachedQuery(
  async (slug: string) => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data
  },
  {
    tags: [CACHE_TAGS.TENANTS],
    revalidate: CACHE_TIMES.LONG,
    keyParts: ['tenant'],
  }
)

export const getCachedTenants = createCachedQuery(
  async () => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  },
  {
    tags: [CACHE_TAGS.TENANTS],
    revalidate: CACHE_TIMES.LONG,
    keyParts: ['tenants', 'all'],
  }
)

// Cached product queries
export const getCachedProducts = createCachedQuery(
  async (tenantId: string, categoryId?: string) => {
    const supabase = createServerClient()
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
    return data || []
  },
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_TIMES.MEDIUM,
    keyParts: ['products'],
  }
)

export const getCachedProduct = createCachedQuery(
  async (productId: string) => {
    const supabase = createServerClient()
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
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_TIMES.MEDIUM,
    keyParts: ['product'],
  }
)

export const getCachedFeaturedProducts = createCachedQuery(
  async (tenantId: string, limit: number = 8) => {
    const supabase = createServerClient()
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
    return data || []
  },
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_TIMES.MEDIUM,
    keyParts: ['products', 'featured'],
  }
)

export const getCachedSearchProducts = createCachedQuery(
  async (tenantId: string, searchTerm: string, limit: number = 20) => {
    const supabase = createServerClient()
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
      .limit(limit)

    if (error) throw error
    return data || []
  },
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_TIMES.SHORT,
    keyParts: ['products', 'search'],
  }
)

// Cached category queries
export const getCachedCategories = createCachedQuery(
  async (tenantId: string) => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data || []
  },
  {
    tags: [CACHE_TAGS.CATEGORIES],
    revalidate: CACHE_TIMES.LONG,
    keyParts: ['categories'],
  }
)

export const getCachedCategory = createCachedQuery(
  async (tenantId: string, slug: string) => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data
  },
  {
    tags: [CACHE_TAGS.CATEGORIES],
    revalidate: CACHE_TIMES.LONG,
    keyParts: ['category'],
  }
)

// Cached user queries
export const getCachedUserProfile = createCachedQuery(
  async (userId: string) => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },
  {
    tags: [CACHE_TAGS.USER],
    revalidate: CACHE_TIMES.MEDIUM,
    keyParts: ['profile'],
  }
)

// Cached cart queries
export const getCachedCartItems = createCachedQuery(
  async (userId: string, tenantId: string) => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          name_ar,
          name_fr,
          price,
          image_url,
          stock_quantity,
          is_active
        )
      `)
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)

    if (error) throw error
    return data || []
  },
  {
    tags: [CACHE_TAGS.CART],
    revalidate: CACHE_TIMES.SHORT,
    keyParts: ['cart'],
  }
)

// Cached order queries
export const getCachedUserOrders = createCachedQuery(
  async (userId: string, tenantId?: string) => {
    const supabase = createServerClient()
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total,
        created_at,
        tenants (
          name,
          name_ar,
          name_fr,
          slug
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },
  {
    tags: [CACHE_TAGS.ORDERS],
    revalidate: CACHE_TIMES.SHORT,
    keyParts: ['orders', 'user'],
  }
)

export const getCachedOrder = createCachedQuery(
  async (orderId: string, userId: string) => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          product_name,
          products (
            id,
            name,
            name_ar,
            name_fr,
            image_url
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  },
  {
    tags: [CACHE_TAGS.ORDERS],
    revalidate: CACHE_TIMES.SHORT,
    keyParts: ['order'],
  }
)

// Admin cached queries
export const getCachedAllOrders = createCachedQuery(
  async (limit: number = 100) => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          product_name
        ),
        tenants (
          id,
          name,
          name_ar,
          name_fr,
          slug
        ),
        profiles (
          id,
          name,
          phone
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },
  {
    tags: [CACHE_TAGS.ORDERS],
    revalidate: CACHE_TIMES.SHORT,
    keyParts: ['orders', 'admin'],
  }
)

// Statistics queries
export const getCachedOrderStats = createCachedQuery(
  async (tenantId?: string) => {
    const supabase = createServerClient()
    let query = supabase
      .from('orders')
      .select('status, total, created_at')

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) throw error

    // Calculate statistics
    const stats = {
      total_orders: data?.length || 0,
      total_revenue: data?.reduce((sum, order) => sum + Number(order.total), 0) || 0,
      pending_orders: data?.filter(order => order.status === 'pending').length || 0,
      completed_orders: data?.filter(order => order.status === 'delivered').length || 0,
      cancelled_orders: data?.filter(order => order.status === 'cancelled').length || 0,
    }

    return stats
  },
  {
    tags: [CACHE_TAGS.ORDERS],
    revalidate: CACHE_TIMES.MEDIUM,
    keyParts: ['stats', 'orders'],
  }
)