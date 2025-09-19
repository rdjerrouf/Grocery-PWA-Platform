# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development
- `pnpm dev` - Start development server with Turbopack (Next.js 15)
- `pnpm build` - Build production application with Turbopack
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint for code quality

### Testing
- `pnpm test` - Run Playwright E2E tests
- `pnpm test:headed` - Run tests with browser UI visible
- `pnpm test:ui` - Run tests with Playwright UI
- `pnpm test:report` - Show test results report

### Database Management (Supabase)
- `supabase start` - Start local Supabase stack (requires Docker)
- `supabase stop` - Stop local Supabase stack
- `supabase db reset` - Reset database with fresh migrations and seed data
- `supabase db push` - Apply local schema changes to remote database
- `supabase migration new <name>` - Create new database migration
- `supabase studio` - Access local Supabase Studio at http://localhost:54323

## Architecture Overview

### Multi-Tenant Structure
This is a multi-tenant grocery platform where each store operates as an independent tenant:

- **Tenant Isolation**: URL-based via `/stores/[slug]` routing
- **Database Separation**: Row-level security (RLS) policies isolate tenant data
- **Subdomain Support**: Middleware extracts tenant from URL path
- **Tenant Validation**: Middleware verifies active tenant before serving pages

### Supabase-First Backend
- **Authentication**: JWT-based with session management
- **Database**: PostgreSQL with auto-generated TypeScript types
- **Row-Level Security**: Comprehensive RLS policies for tenant isolation
- **Real-time**: Supabase realtime for live updates
- **Storage**: File uploads with tenant-specific access controls

### Internationalization
- **Languages**: Arabic (primary, RTL) and French (secondary)
- **Framework**: next-intl for translations
- **Locale Detection**: URL parameter and user preference
- **RTL Support**: Full right-to-left layout support for Arabic

## Project Structure

```
app/
├── stores/[slug]/          # Tenant-specific routes
│   ├── auth/              # Authentication pages
│   ├── search/            # Product search
│   └── page.tsx           # Store homepage
├── actions/               # Server actions (auth, cart, products)
├── layout.tsx             # Root layout
└── globals.css           # Global styles

components/
├── layout/               # Layout components (Header, Sidebar, StoreLayout)
├── shop/                # Shopping components (ProductCard, SearchBar)
└── ui/                  # Reusable UI components

lib/
├── supabase/            # Supabase clients and utilities
│   ├── client.ts        # Client-side Supabase client
│   ├── server.ts        # Server-side Supabase clients
│   ├── middleware.ts    # Middleware Supabase client
│   ├── admin.ts         # Admin/service role client
│   └── types.ts         # Database type definitions
├── constants/           # Constants (Algeria-specific data)
└── utils.ts            # Utility functions

supabase/
├── migrations/          # Database migrations
├── config.toml         # Supabase configuration
└── seed.sql           # Database seed data

middleware.ts           # Tenant validation and auth middleware
```

## Development Guidelines

### Tenant-Aware Development
- Always extract tenant context from URL using middleware or params
- Use tenant-aware Supabase queries with RLS policies
- Test with multiple tenants to ensure proper isolation
- Validate tenant exists before serving pages

### Supabase Patterns
- **Client Components**: Use `createClient()` from `lib/supabase/client.ts`
- **Server Components**: Use `createServerClient()` from `lib/supabase/server.ts`
- **Server Actions**: Use `createServerActionClient()` from `lib/supabase/server.ts`
- **Middleware**: Use `createMiddlewareSupabaseClient()` from `lib/supabase/middleware.ts`

### Authentication Flow
1. User visits `/stores/[slug]/auth/signin`
2. Middleware validates tenant exists
3. Server action handles auth with tenant context
4. Successful auth redirects to store homepage
5. RLS policies ensure user only sees tenant-specific data

### Database Queries
All queries automatically respect tenant boundaries via RLS policies:
```typescript
// RLS automatically filters by tenant_id
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
```

## Environment Setup

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_APP_URL` - Application base URL
- `NEXT_PUBLIC_DEFAULT_LOCALE` - Default locale (ar/fr)

Optional integrations:
- Chargily Pay for payments (Algeria-specific)
- Twilio for SMS notifications
- Upstash Redis for caching
- OpenAI API for Supabase Studio AI features

## Database Schema

### Core Tables
- `tenants` - Store/grocery information with branding
- `categories` - Product categories (tenant-scoped)
- `products` - Grocery items with Arabic/French names
- `orders` - Customer orders with delivery info
- `order_items` - Order line items
- `profiles` - User profiles linked to auth.users

### Key Features
- Multi-language support (Arabic/French) in database fields
- Soft deletes with `is_active` flags
- Audit trails with `created_at`/`updated_at`
- Algeria-specific currency (DZD) and delivery zones

## Testing Strategy

### Playwright Configuration
- Tests run against `http://localhost:3000`
- Covers major browsers (Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari)
- Automatic dev server startup for test runs
- HTML report generation with `pnpm test:report`
- Configurable retry logic (2 retries on CI)

### Test Structure
- `tests/homepage.spec.ts` - Landing page functionality
- `tests/store-page.spec.ts` - Store-specific pages
- `tests/product-card.spec.ts` - Product display components
- `tests/api.spec.ts` - API endpoints

### Test Data
Use seed data from `supabase/seed.sql` for consistent test scenarios.

## Common Development Tasks

### Adding a New Tenant
1. Insert record in `tenants` table via Supabase Studio
2. Configure branding (logo, colors, name translations)
3. Test tenant isolation by visiting `/stores/[new-slug]`

### Database Schema Changes
1. Create migration: `supabase migration new descriptive_name`
2. Write SQL in generated migration file
3. Test locally: `supabase db reset`
4. Apply to remote: `supabase db push`

### Internationalization Updates
1. Add translations to message files
2. Use `useTranslations()` hook in components
3. Test both Arabic (RTL) and French (LTR) layouts

### Payment Integration (Chargily Pay)
- Algeria-specific payment gateway for EDAHABIA/CIB cards
- Webhook handling for payment confirmations
- Multi-language payment interfaces

## Algeria-Specific Features

### Localization
- Arabic as primary language with RTL support
- French as secondary language
- Algeria Dinar (DZD) currency
- Wilaya-based delivery zones

### Payment Methods
- EDAHABIA cards (primary)
- CIB interbank cards
- Cash on delivery option
- Chargily Pay integration

### Market Considerations
- Mobile-first design for 3G networks
- PWA for app-like experience without app stores
- SMS notifications for order updates
- Offline-capable browsing