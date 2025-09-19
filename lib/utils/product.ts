import { Database } from '@/lib/supabase/types'

type DbProduct = Database['public']['Tables']['products']['Row']

export interface FrontendProduct {
  id: string
  name: string
  name_fr?: string
  name_ar?: string
  description?: string
  description_fr?: string
  description_ar?: string
  price: number
  salePrice?: number
  imageUrl?: string
  unit: string
  stock: number
  isAvailable: boolean
  categoryId?: string
}

export function dbProductsToFrontend(dbProducts: DbProduct[]): FrontendProduct[] {
  return dbProducts.map(product => ({
    id: product.id,
    name: product.name,
    name_fr: product.name_fr || undefined,
    name_ar: product.name_ar || undefined,
    description: product.description || undefined,
    description_fr: product.description_fr || undefined,
    description_ar: product.description_ar || undefined,
    price: Number(product.price),
    salePrice: product.sale_price ? Number(product.sale_price) : undefined,
    imageUrl: product.image_url || undefined,
    unit: product.unit || 'piece',
    stock: product.stock_quantity || 0,
    isAvailable: product.is_active && (product.stock_quantity || 0) > 0,
    categoryId: product.category_id || undefined
  }))
}

export function formatPrice(price: number, currency: string = 'DZD'): string {
  return `${price.toFixed(2)} ${currency}`
}

export function getDisplayName(
  product: FrontendProduct,
  locale: 'fr' | 'ar' = 'fr'
): string {
  if (locale === 'ar' && product.name_ar) {
    return product.name_ar
  }
  if (locale === 'fr' && product.name_fr) {
    return product.name_fr
  }
  return product.name
}

export function getDisplayDescription(
  product: FrontendProduct,
  locale: 'fr' | 'ar' = 'fr'
): string | undefined {
  if (locale === 'ar' && product.description_ar) {
    return product.description_ar
  }
  if (locale === 'fr' && product.description_fr) {
    return product.description_fr
  }
  return product.description
}