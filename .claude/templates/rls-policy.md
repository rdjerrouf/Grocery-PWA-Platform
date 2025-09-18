# Row Level Security (RLS) Templates

## Basic RLS Patterns

### 1. Tenant Isolation Pattern
```sql
-- Enable RLS on table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (customers can view active products)
CREATE POLICY "Customers view active products" ON products
  FOR SELECT USING (
    is_active = true
    AND tenant_id = (auth.jwt()->>'tenant_id')::uuid
  );

-- Policy for INSERT (only admins can create)
CREATE POLICY "Admins create products" ON products
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND tenant_id = (auth.jwt()->>'tenant_id')::uuid
    )
  );

-- Policy for UPDATE (only admins can update)
CREATE POLICY "Admins update products" ON products
  FOR UPDATE USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy for DELETE (only super_admin can delete)
CREATE POLICY "Super admins delete products" ON products
  FOR DELETE USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );
```

### 2. User-Owned Data Pattern
```sql
-- Orders: Users can only see their own orders
CREATE POLICY "Users view own orders" ON orders
  FOR SELECT USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Cart: Users can only modify their own cart
CREATE POLICY "Users manage own cart" ON cart_items
  FOR ALL USING (
    user_id = auth.uid()
  );
```

### 3. Public Read Pattern
```sql
-- Categories: Public read, admin write
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (
    is_active = true
    AND tenant_id = (auth.jwt()->>'tenant_id')::uuid
  );

CREATE POLICY "Admins manage categories" ON categories
  FOR ALL USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

### 4. Time-Based Access Pattern
```sql
-- Flash sales: Products visible only during sale period
CREATE POLICY "View flash sale products" ON flash_sale_products
  FOR SELECT USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND NOW() BETWEEN sale_start AND sale_end
    AND is_active = true
  );
```

### 5. Status-Based Access
```sql
-- Reviews: Only approved reviews are public
CREATE POLICY "View approved reviews" ON reviews
  FOR SELECT USING (
    (
      -- Public can see approved reviews
      status = 'approved'
      AND product_id IN (
        SELECT id FROM products
        WHERE tenant_id = (auth.jwt()->>'tenant_id')::uuid
      )
    )
    OR
    (
      -- Authors can see their own reviews
      user_id = auth.uid()
    )
    OR
    (
      -- Admins can see all reviews
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
      )
    )
  );
```

## Complex RLS Scenarios

### Hierarchical Access
```sql
-- Managers can only manage their assigned categories
CREATE POLICY "Category manager access" ON products
  FOR ALL USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND (
      -- Super admin: full access
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
      )
      OR
      -- Category manager: limited to assigned categories
      category_id IN (
        SELECT category_id
        FROM category_managers
        WHERE user_id = auth.uid()
        AND tenant_id = (auth.jwt()->>'tenant_id')::uuid
      )
    )
  );
```

### Cross-Table Validation
```sql
-- Can only add items to cart if product is available
CREATE POLICY "Add available products to cart" ON cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id
      AND tenant_id = (auth.jwt()->>'tenant_id')::uuid
      AND is_active = true
      AND stock > 0
    )
  );
```

### Rate Limiting Pattern
```sql
-- Limit reviews per user per product
CREATE POLICY "One review per product per user" ON reviews
  FOR INSERT WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM reviews
      WHERE user_id = auth.uid()
      AND product_id = NEW.product_id
    )
  );
```

## Testing RLS Policies

### SQL Test Queries
```sql
-- Test as anonymous user
SET LOCAL role TO 'anon';
SELECT * FROM products; -- Should return only active products

-- Test as authenticated user
SET LOCAL role TO 'authenticated';
SET LOCAL request.jwt.claims TO '{"sub": "user-uuid", "tenant_id": "tenant-uuid"}';
SELECT * FROM orders; -- Should return user's orders

-- Test as admin
SET LOCAL request.jwt.claims TO '{"sub": "admin-uuid", "tenant_id": "tenant-uuid", "role": "admin"}';
SELECT * FROM products; -- Should return all products for tenant
```

### TypeScript Testing
```tsx
// lib/test-rls.ts
import { createClient } from '@supabase/supabase-js'

export async function testRLSPolicies() {
  // Test with different user roles
  const testCases = [
    { role: 'anon', expected: 'public_only' },
    { role: 'customer', expected: 'tenant_products' },
    { role: 'admin', expected: 'all_tenant_data' },
  ]

  for (const test of testCases) {
    const supabase = createClient(url, key, {
      global: {
        headers: {
          'x-test-role': test.role,
        },
      },
    })

    const { data, error } = await supabase
      .from('products')
      .select('*')

    console.log(`Testing ${test.role}:`, data?.length, 'products')
  }
}
```

## Common RLS Gotchas & Solutions

### 1. JWT Claims Not Available
```sql
-- Always check if JWT exists
CREATE POLICY "Safe tenant check" ON products
  FOR SELECT USING (
    CASE
      WHEN auth.jwt() IS NULL THEN false
      WHEN auth.jwt()->>'tenant_id' IS NULL THEN false
      ELSE tenant_id = (auth.jwt()->>'tenant_id')::uuid
    END
  );
```

### 2. Performance Optimization
```sql
-- Add indexes for RLS conditions
CREATE INDEX idx_products_tenant_active
  ON products(tenant_id, is_active);

CREATE INDEX idx_profiles_user_role
  ON profiles(id, role);
```

### 3. Debugging RLS
```sql
-- Create a debug function
CREATE FUNCTION debug_rls(table_name TEXT)
RETURNS TABLE (
  policy_name TEXT,
  permissive TEXT,
  command TEXT,
  qual TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    polname::TEXT,
    CASE polpermissive
      WHEN true THEN 'PERMISSIVE'
      ELSE 'RESTRICTIVE'
    END,
    CASE polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      ELSE 'ALL'
    END,
    pg_get_expr(polqual, polrelid)::TEXT
  FROM pg_policy
  WHERE polrelid = table_name::regclass;
END;
$$ LANGUAGE plpgsql;

-- Use it
SELECT * FROM debug_rls('products');
```