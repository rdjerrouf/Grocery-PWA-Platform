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

## Current Project Structure (UPDATED 2025-09-18)

```
grucery-pwa-platform/
├── app/                          # Next.js 15 App Router
│   ├── page.tsx                  # ✅ Homepage (multi-tenant selection)
│   ├── layout.tsx                # ✅ Root layout
│   ├── globals.css               # Global styles
│   ├── admin/                    # ✅ Admin interface
│   │   └── page.tsx              # ✅ Tenant management
│   ├── stores/[slug]/            # ✅ Multi-tenant store routes
│   │   ├── page.tsx              # ✅ Store homepage
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── signin/
│   │   │   │   └── page.tsx      # Sign-in page
│   │   │   └── signup/
│   │   │       └── page.tsx      # Sign-up page
│   │   └── search/
│   │       └── page.tsx          # Product search
│   ├── actions/                  # Server Actions
│   │   └── auth.ts               # ✅ Authentication actions
│   └── api/                      # API routes
│       ├── debug/                # Debug endpoints
│       ├── debug-env/            # Environment debugging
│       └── fix-featured/         # Utility endpoints
├── components/                   # React Components
│   ├── auth/                     # ✅ Authentication components
│   │   └── SignInForm.tsx        # ✅ Working sign-in form
│   ├── layout/                   # Layout components
│   │   └── StoreLayout.tsx       # ✅ Store-specific layout
│   ├── shop/                     # Shopping components
│   │   └── ProductCard.tsx       # Product display card
│   └── ui/                       # Reusable UI components
├── lib/                          # Utilities & Configurations
│   ├── supabase/                 # ✅ Supabase integration
│   │   ├── client.ts             # ✅ Browser client
│   │   ├── server.ts             # ✅ Server client
│   │   ├── middleware.ts         # ✅ Auth middleware
│   │   └── queries.ts            # Database queries
│   ├── constants/                # App constants
│   │   └── algeria.ts            # Algeria-specific data
│   └── utils/                    # Utility functions
│       └── product.ts            # Product utilities
├── supabase/                     # ✅ Supabase configuration
│   ├── config.toml               # Supabase config
│   ├── migrations/               # ✅ Database migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_rls_policies.sql
│   ├── .branches/                # Branch management
│   └── .temp/                    # Temporary files
├── scripts/                      # ✅ Utility scripts
│   ├── create-tenant.js          # ✅ Tenant creation script
│   └── seed.js                   # Database seeding
├── stores/                       # State management
│   └── useCartStore.ts           # Shopping cart store (Zustand)
├── tests/                        # ✅ Playwright E2E tests
│   ├── homepage.spec.ts          # Homepage tests
│   ├── store-page.spec.ts        # Store page tests
│   └── product-card.spec.ts      # Component tests
├── .claude/                      # ✅ Claude Code documentation
│   ├── current-phase.md          # ✅ Current development status
│   ├── next-phase.md             # ✅ Next development phase
│   ├── project-context.md        # ✅ Project overview
│   ├── session-summary.md        # ✅ Latest session summary
│   ├── quick-start.md            # ✅ Next session guide
│   ├── architecture.md           # This file
│   ├── prompts/                  # Development prompts
│   └── templates/                # Code templates
├── public/                       # Static assets
│   └── images/                   # Image assets
├── middleware.ts                 # ✅ Next.js middleware (tenant routing)
├── CLAUDE.md                     # ✅ Main development documentation
├── package.json                  # Dependencies & scripts
├── playwright.config.ts          # ✅ E2E testing configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── next.config.js                # Next.js configuration
```

### ✅ **Working Features (Confirmed)**
- **Multi-tenant Homepage**: Displays Ahmed Grocery & Carrefour Alger
- **Admin Panel**: Tenant management at `/admin`
- **Store Pages**: Both stores accessible with proper routing
- **Authentication**: SignInForm component functional
- **Database**: PostgreSQL with RLS policies for tenant isolation
- **Development Stack**: Next.js 15 + Turbopack + Supabase running

### 🔄 **Key Differences from Original Plan**
1. **Simplified Structure**: No locale-based routing yet (will add later)
2. **Working Admin**: Admin panel outside tenant routing for easier management
3. **Auth Components**: SignInForm created, SignUp and others pending
4. **Direct Tenant Routing**: `/stores/[slug]` instead of subdomain (for development)

## Current Data Flow (WORKING)

1. **Customer visits localhost:3000/stores/ahmed-grocery**
2. **Middleware** extracts tenant "ahmed-grocery" from URL path
3. **Middleware** validates tenant exists in database
4. **Headers** set tenant context (x-tenant-id, x-tenant-slug)
5. **Server Components** fetch tenant-specific data via RLS
6. **Client Components** handle interactivity
7. **Server Actions** handle form submissions (tenant creation working)
8. **Database RLS** automatically filters all queries by tenant_id

### ✅ **Verified Working Examples**
- Homepage tenant selection: `localhost:3000`
- Ahmed Grocery: `localhost:3000/stores/ahmed-grocery`
- Carrefour Alger: `localhost:3000/stores/carrefour-alger`
- Admin panel: `localhost:3000/admin`
- Tenant creation via admin form: ✅ Tested and working