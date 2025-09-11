// Database types matching your Supabase schema
export interface Tenant {
  id: string
  slug: string
  name: string
  name_ar?: string
  name_fr?: string
  logo_url?: string
  primary_color: string
  contact_phone?: string
  contact_email?: string
  address?: string
  delivery_fee: number
  minimum_order: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  tenant_id: string
  name: string
  name_ar?: string
  name_fr?: string
  slug: string
  description?: string
  image_url?: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  tenant_id: string
  category_id?: string
  sku?: string
  barcode?: string
  name: string
  name_ar?: string
  name_fr?: string
  description?: string
  description_ar?: string
  description_fr?: string
  image_url?: string
  price: number
  sale_price?: number
  stock_quantity: number
  low_stock_threshold: number
  unit: string
  weight?: number
  expiry_date?: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  tenant_id: string
  order_number: string
  status: string
  payment_status: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  delivery_address?: string
  delivery_fee: number
  subtotal: number
  total: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  quantity: number
  unit_price: number
  total_price: number
  product_name: string
  created_at: string
}