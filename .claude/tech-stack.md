# Technology Stack (Next.js + Supabase)

## Core Stack
- **Framework**: Next.js 14 (App Router)
- **Backend**: Supabase
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Realtime subscriptions
  - Storage (images/files)
  - Edge Functions
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query

## Supabase Services Used

### Database
- PostgreSQL with RLS
- Full-text search (Arabic/French)
- PostGIS for delivery zones
- pg_cron for scheduled tasks

### Authentication
- Email/Password auth
- Phone auth (SMS OTP)
- OAuth providers (Google)
- Custom JWT claims for tenant_id
- MFA support

### Storage
- Product images
- Tenant logos
- Order documents
- Automatic image optimization

### Realtime
- Live inventory updates
- Order status tracking
- Admin notifications
- Shopping cart sync

### Edge Functions
- Payment webhook processing
- Complex calculations
- Third-party integrations
- Scheduled jobs

## Frontend Libraries
- **Supabase Client**: @supabase/supabase-js
- **Auth Helpers**: @supabase/auth-helpers-nextjs
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **i18n**: next-intl
- **Tables**: TanStack Table
- **Charts**: Recharts

## Development Tools
- **Supabase CLI**: Local development
- **TypeScript**: Type generation from DB
- **Database GUI**: Supabase Studio
- **Migrations**: Supabase migrations

## Payment Integration
- **Gateway**: Chargily Pay
- **Webhook Handler**: Supabase Edge Functions
- **Payment Methods**: EDAHABIA, CIB

## Deployment
- **Frontend**: Vercel (free tier)
- **Backend**: Supabase (free → $25/mo)
- **Domain**: Cloudflare
- **Monitoring**: Vercel Analytics + Supabase Dashboard

## Cost Breakdown (Monthly)
- **Starting (MVP)**: $0
  - Vercel: Free tier
  - Supabase: Free tier
  - Cloudflare: Free tier

- **Growth (10-50 tenants)**: ~$25
  - Vercel: Free tier still works
  - Supabase: Pro plan ($25)
  - Cloudflare: Free tier

- **Scale (50-100+ tenants)**: ~$50-100
  - Vercel: Pro ($20)
  - Supabase: Pro with add-ons
  - Additional services as needed