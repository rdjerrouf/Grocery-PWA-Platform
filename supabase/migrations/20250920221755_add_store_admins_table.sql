-- Add store admins table for role-based access control
-- This allows you (main admin) to assign store owners/sub-admins to specific tenants

CREATE TABLE store_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'manager')),
  permissions JSONB DEFAULT '{"products": true, "orders": true, "customers": true, "settings": false}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- Enable RLS
ALTER TABLE store_admins ENABLE ROW LEVEL SECURITY;

-- Policies for store_admins
-- Only authenticated users can manage store admins
CREATE POLICY "store_admins_authenticated_full" ON store_admins
FOR ALL USING (auth.uid() IS NOT NULL);

-- Add indexes
CREATE INDEX idx_store_admins_user ON store_admins(user_id);
CREATE INDEX idx_store_admins_tenant ON store_admins(tenant_id);
CREATE INDEX idx_store_admins_active ON store_admins(tenant_id, is_active);

-- Function to check if user is store admin
CREATE OR REPLACE FUNCTION is_store_admin(user_uuid UUID, tenant_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM store_admins
    WHERE user_id = user_uuid
    AND tenant_id = tenant_uuid
    AND is_active = true
  );
END;
$$;

-- Function to get user's store admin permissions
CREATE OR REPLACE FUNCTION get_store_admin_permissions(user_uuid UUID, tenant_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_permissions JSONB;
BEGIN
  SELECT permissions INTO user_permissions
  FROM store_admins
  WHERE user_id = user_uuid
  AND tenant_id = tenant_uuid
  AND is_active = true;

  RETURN COALESCE(user_permissions, '{}'::jsonb);
END;
$$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_store_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER store_admins_updated_at_trigger
  BEFORE UPDATE ON store_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_store_admins_updated_at();