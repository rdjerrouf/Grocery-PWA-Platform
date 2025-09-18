# Supabase Setup & Configuration

## Initial Setup

### 1. Create Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to remote project
supabase link --project-ref your-project-ref
```

### 2. Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Payment
CHARGILY_API_KEY=your_api_key
CHARGILY_SECRET=your_secret
NEXT_PUBLIC_APP_URL=https://platform.dz
```

## Database Schema

### Core Tables
```sql
-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subdomain TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users with tenant association
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  role TEXT CHECK (role IN ('customer', 'admin', 'super_admin')),
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  sku TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  category_id UUID REFERENCES categories(id),
  price DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'piece',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, sku)
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### RLS Policies
```sql
-- Tenant isolation for products
CREATE POLICY "Tenant Isolation - Select" ON products
  FOR SELECT USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
  );

CREATE POLICY "Tenant Isolation - Insert" ON products
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Tenant Isolation - Update" ON products
  FOR UPDATE USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Public read for active tenants
CREATE POLICY "Public Read" ON tenants
  FOR SELECT USING (is_active = true);

-- Profiles access
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());
```

### Functions & Triggers
```sql
-- Function to set tenant_id in JWT
CREATE OR REPLACE FUNCTION set_tenant_claim()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    raw_app_meta_data ||
    jsonb_build_object('tenant_id', NEW.tenant_id::text)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to set tenant claim on profile creation
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_claim();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  tenant_subdomain TEXT;
  tenant_record RECORD;
BEGIN
  -- Extract subdomain from metadata (passed during signup)
  tenant_subdomain := NEW.raw_user_meta_data->>'subdomain';

  -- Get tenant
  SELECT * INTO tenant_record
  FROM tenants
  WHERE subdomain = tenant_subdomain;

  -- Create profile
  INSERT INTO profiles (id, tenant_id, role, name)
  VALUES (
    NEW.id,
    tenant_record.id,
    'customer',
    NEW.raw_user_meta_data->>'name'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## Storage Buckets
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('products', 'products', true),
  ('tenants', 'tenants', true);

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id IN ('products', 'tenants'));

CREATE POLICY "Tenant Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

## Realtime Subscriptions
```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime
ADD TABLE products, orders, inventory;
```

## Edge Functions Setup
```typescript
// supabase/functions/payment-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Handle Chargily webhook
  const signature = req.headers.get('X-Chargily-Signature')
  const payload = await req.text()

  // Verify and process...

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Local Development
```bash
# Start local Supabase
supabase start

# Run migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > lib/database.types.ts

# Stop local Supabase
supabase stop
```