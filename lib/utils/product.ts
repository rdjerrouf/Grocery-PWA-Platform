import type { Product as DbProduct } from '@/lib/supabase/types'

// Frontend Product type (camelCase)
export interface Product {
  id: string
  name: string        // French name
  nameAr?: string     // Arabic name
  price: number       // Price in cents
  salePrice?: number  // Sale price in cents
  imageUrl?: string
  stockQuantity: number
  description?: string
  descriptionAr?: string
  unit: string
  weight?: number
  isFeatured: boolean
  categoryId?: string
}

// Convert database product to frontend product
export function dbProductToFrontend(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    nameAr: dbProduct.name_ar,
    price: Math.round(dbProduct.price * 100), // Convert to cents
    salePrice: dbProduct.sale_price ? Math.round(dbProduct.sale_price * 100) : undefined,
    imageUrl: dbProduct.image_url,
    stockQuantity: dbProduct.stock_quantity,
    description: dbProduct.description,
    descriptionAr: dbProduct.description_ar,
    unit: dbProduct.unit,
    weight: dbProduct.weight,
    isFeatured: dbProduct.is_featured,
    categoryId: dbProduct.category_id
  }
}

// Convert multiple database products to frontend products
export function dbProductsToFrontend(dbProducts: DbProduct[]): Product[] {
  return dbProducts.map(dbProductToFrontend)
}

// Currency formatter for DZD
export function formatCurrency(amountInCents: number): string {
  const amountInDinars = amountInCents / 100
  return new Intl.NumberFormat('fr-DZ', { 
    style: 'currency', 
    currency: 'DZD', 
    minimumFractionDigits: 2 
  }).format(amountInDinars)
}