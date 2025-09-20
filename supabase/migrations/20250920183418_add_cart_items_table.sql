-- Create cart_items table for persistent cart storage
-- This table stores items added to cart by authenticated users

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cart items
CREATE POLICY "cart_items_own_items" ON cart_items
FOR ALL USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
CREATE INDEX idx_cart_items_tenant ON cart_items(tenant_id);

-- Ensure one cart item per user/product/tenant combination
CREATE UNIQUE INDEX idx_cart_items_unique ON cart_items(user_id, product_id, tenant_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add user_id column to orders table for proper user isolation
ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update orders RLS policies to be user-specific
DROP POLICY IF EXISTS "orders_authenticated_full" ON orders;

-- Users can only see their own orders
CREATE POLICY "orders_own_orders" ON orders
FOR ALL USING (auth.uid() = user_id);

-- Add index for user orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);