# System Architecture (Next.js + Supabase)

## Overall Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Web App   │  │  Admin Panel │  │     PWA      │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
                Supabase Client
                      │
┌─────────────────────┴───────────────────────────────┐
│                    Supabase Backend                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Row Level Security (RLS)               │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │   Auth   │  │ Database │  │   Storage    │  │  │
│  │  └──────────┘  └──────────┘  └──────────────┘  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │ Realtime │  │Edge Func │  │   Vectors    │  │  │
│  │  └──────────┘  └──────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Multi-Tenant Strategy with Supabase

### 1. Tenant Identification
- Subdomain-based: `store1.platform.dz`
- Tenant ID stored in JWT custom claims
- Middleware extracts and validates tenant

### 2. Data Isolation via RLS
```sql
-- Every table has tenant_id
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name_ar TEXT,
  name_fr TEXT,
  -- ... other fields
);

-- RLS Policy
CREATE POLICY "Tenant Isolation" ON products
  FOR ALL USING (
    tenant_id = auth.jwt()->>'tenant_id'::uuid
  );
```

### 3. Authentication Flow
1. User signs up/in via Supabase Auth
2. Custom claim adds tenant_id to JWT
3. All queries automatically filtered by RLS
4. No need for manual tenant filtering!

## Project Structure

```
supermarket-platform/
├── app/
│   ├── [locale]/                 # i18n (ar/fr)
│   │   ├── (shop)/               # Customer-facing
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── products/         # Catalog
│   │   │   ├── cart/             # Cart
│   │   │   └── checkout/         # Checkout
│   │   ├── (admin)/              # Admin panel
│   │   │   ├── dashboard/        # Analytics
│   │   │   ├── products/         # Management
│   │   │   └── orders/           # Orders
│   │   └── (auth)/               # Auth pages
│   │       ├── login/
│   │       └── register/
│   └── api/
│       ├── webhooks/             # Payment webhooks
│       └── cron/                 # Scheduled jobs
├── components/
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   ├── middleware.ts        # Auth middleware
│   │   └── admin.ts             # Admin client
│   └── actions/                 # Server actions
└── supabase/
    ├── migrations/               # Database migrations
    ├── functions/                # Edge functions
    └── seed.sql                  # Seed data
```

## Data Flow

1. **Customer visits store1.platform.dz**
2. **Middleware** extracts tenant "store1"
3. **Supabase Auth** validates user
4. **RLS** automatically filters all queries
5. **Server Components** fetch data
6. **Client Components** handle interactivity
7. **Server Actions** handle mutations
8. **Realtime** updates inventory/orders