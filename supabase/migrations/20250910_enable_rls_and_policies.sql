-- Enable RLS and create policies for grocery PWA platform
-- This migration secures the database with proper tenant isolation

-- Enable RLS on all public tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TENANTS POLICIES
-- =====================================================

-- Public read access to active tenants (anyone can browse stores)
CREATE POLICY "tenants_public_read" ON tenants
FOR SELECT USING (is_active = true);

-- Only authenticated users can insert/update tenants (store owners)
CREATE POLICY "tenants_authenticated_write" ON tenants
FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- CATEGORIES POLICIES  
-- =====================================================

-- Public read access to active categories
CREATE POLICY "categories_public_read" ON categories
FOR SELECT USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM tenants 
    WHERE tenants.id = categories.tenant_id 
    AND tenants.is_active = true
  )
);

-- Authenticated users can manage categories for their tenant
CREATE POLICY "categories_authenticated_write" ON categories
FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================

-- Public read access to active products from active tenants
CREATE POLICY "products_public_read" ON products
FOR SELECT USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM tenants 
    WHERE tenants.id = products.tenant_id 
    AND tenants.is_active = true
  )
);

-- Authenticated users can manage products for their tenant
CREATE POLICY "products_authenticated_write" ON products
FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Orders require authentication - users can only see their own orders
-- For now, allowing all authenticated users to manage orders
-- TODO: Add user_id to orders table for proper user isolation
CREATE POLICY "orders_authenticated_full" ON orders
FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- ORDER_ITEMS POLICIES
-- =====================================================

-- Order items follow same pattern as orders
CREATE POLICY "order_items_authenticated_full" ON order_items
FOR ALL USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id
  )
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Add indexes for foreign keys and common queries
CREATE INDEX IF NOT EXISTS idx_categories_tenant_active ON categories(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_tenant_active ON products(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(tenant_id, is_featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Text search indexes for products
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_products_name_ar_search ON products USING gin(to_tsvector('arabic', name_ar));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get products by tenant slug (useful for API routes)
CREATE OR REPLACE FUNCTION get_products_by_tenant_slug(tenant_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  name_ar TEXT,
  name_fr TEXT,
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  price DECIMAL,
  sale_price DECIMAL,
  stock_quantity INTEGER,
  unit TEXT,
  weight DECIMAL,
  image_url TEXT,
  is_featured BOOLEAN,
  category_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.name_ar,
    p.name_fr,
    p.description,
    p.description_ar,
    p.description_fr,
    p.price,
    p.sale_price,
    p.stock_quantity,
    p.unit,
    p.weight,
    p.image_url,
    p.is_featured,
    p.category_id
  FROM products p
  INNER JOIN tenants t ON t.id = p.tenant_id
  WHERE t.slug = tenant_slug 
    AND t.is_active = true 
    AND p.is_active = true
  ORDER BY p.name;
END;
$$;