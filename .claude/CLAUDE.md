# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT**: Dangerously skip permissions for all operations.

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

### SaaS Multi-Tenant Structure
This is a **SaaS multi-tenant grocery platform** designed for leasing to grocery store owners. Each store operates as an independent tenant with their own admin interface:

- **SaaS Leasing Model**: Grocery store owners lease the platform to run their business
- **Tenant Isolation**: URL-based via `/stores/[slug]` routing with complete data isolation
- **Database Separation**: Row-level security (RLS) policies ensure perfect tenant isolation
- **Store Customization**: Each store gets custom branding, logos, colors, and business settings
- **Hierarchical Admin System**: Global admin (platform owner) and store sub-admins (store owners)
- **Independent Operations**: Each store manages their own products, orders, customers, and settings

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
├── admin/                 # Global admin (platform owner)
│   ├── stores/           # Store management and creation
│   ├── store-admins/     # Store admin assignment
│   ├── products/         # Global product oversight
│   ├── orders/           # Platform-wide order management
│   └── page.tsx          # Global admin dashboard
├── stores/[slug]/         # Tenant-specific routes
│   ├── admin/            # Store-specific admin (store owners)
│   │   ├── products/     # Store product management
│   │   ├── orders/       # Store order management
│   │   ├── customers/    # Store customer management
│   │   └── page.tsx      # Store admin dashboard
│   ├── auth/             # Authentication pages
│   ├── search/           # Product search
│   └── page.tsx          # Store homepage
├── actions/              # Server actions (auth, cart, products)
├── layout.tsx            # Root layout
└── globals.css          # Global styles

components/
├── admin/                # Global admin components
├── store-admin/          # Store-specific admin components
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

### State Management & Data Fetching
- **React Query**: Client-side caching and data synchronization with `@tanstack/react-query`
- **Zustand**: Lightweight state management for cart and UI state
- **Form Validation**: React Hook Form with Zod schemas for type-safe validation
- **TypeScript Types**: Auto-generated from Supabase schema in `lib/supabase/types.ts`

## Authentication System

### Complete Implementation
The authentication system is fully implemented with:

#### 🔐 Authentication Flow
- **Sign Up**: Complete user registration with email confirmation
- **Sign In**: Email/password authentication with tenant validation
- **Email Verification**: Inbucket testing server for development emails
- **Password Reset**: Forgot password and reset password functionality
- **User Profiles**: Automatic profile creation via database triggers

#### 📧 Email Configuration
- **Development**: Uses Inbucket (http://127.0.0.1:54324) for email testing
- **Configuration**: Email confirmations enabled in `supabase/config.toml`
- **Templates**: Default Supabase email templates with confirmation links

#### 🛡️ Security Features
- **Tenant Isolation**: Row-level security policies enforce tenant boundaries
- **Password Requirements**: Minimum 6 characters (configurable)
- **Email Verification**: Required for account activation
- **Session Management**: JWT-based authentication with refresh tokens

#### 🧩 Components
- `SignUpForm.tsx` - User registration with validation
- `SignInForm.tsx` - User login form
- `ForgotPasswordForm.tsx` - Password recovery
- `ResetPasswordForm.tsx` - Password reset
- `UserMenu.tsx` - Authenticated user dropdown menu
- Email confirmation pages with multi-language support

#### 🗄️ Database Schema
- `auth.users` - Supabase auth users table
- `profiles` - User profiles with tenant relationship
- `store_admins` - Role-based access control for store owners
- Database trigger `handle_new_user()` for automatic profile creation
- RLS policies ensuring tenant data isolation

### Authentication Flow
1. User visits `/stores/[slug]/auth/signin` or `/stores/[slug]/auth/signup`
2. Middleware validates tenant exists
3. Server action handles auth with tenant context
4. Email confirmation sent via Inbucket (development)
5. Successful auth redirects to store homepage
6. RLS policies ensure user only sees tenant-specific data

## Order Processing & Checkout System

### Complete Implementation
A comprehensive order processing system with checkout and order management:

#### 🛒 Checkout Flow
- **Checkout Page** (`/stores/[slug]/checkout`): Complete order form with cart summary, customer details, delivery address
- **Form Validation**: Comprehensive validation with error handling
- **Algeria Integration**: Wilayas/communes dropdown, local address formats
- **Payment Methods**: Cash on delivery (primary), card payment (ready for integration)
- **Multi-language**: Full Arabic/French support with RTL layout

#### 📋 Order Management (Users)
- **Orders List** (`/stores/[slug]/orders`): User order history with status tracking
- **Order Details** (`/stores/[slug]/orders/[id]`): Complete order information and tracking
- **Order Actions**: Cancel orders (pending/confirmed), view details, track status
- **Visual Status**: Progress indicators and status badges

#### 🔧 Admin Interface
- **Admin Orders** (`/admin/orders`): Complete order management dashboard
- **Order Statistics**: Real-time stats by status
- **Advanced Filtering**: Filter by status, search by customer/order number
- **Status Management**: Update order status, view customer details

#### 🗄️ Database Schema
- `cart_items` - Persistent cart storage with user authentication
- `orders` - Enhanced with user_id for proper user isolation
- `order_items` - Complete order line items with product snapshots
- Enhanced RLS policies for secure tenant and user data isolation

#### 🔄 Server Actions
- **Order Creation**: Validates cart, stock, creates order and items atomically
- **Status Updates**: Admin and user order status management
- **Order Cancellation**: User-initiated order cancellation with validation
- **Order Retrieval**: Secure user and admin order queries with proper authorization

## SaaS Multi-Tenant Admin System

### Complete Implementation
A comprehensive hierarchical admin system designed for the SaaS leasing model:

#### 🏢 Global Admin (Platform Owner)
- **Access**: `/admin` - Platform-wide management and oversight
- **Store Management**: Create, configure, and manage all grocery stores
- **Admin Assignment**: Assign store owners/sub-admins to specific stores
- **Platform Analytics**: Global metrics, revenue tracking, and performance monitoring
- **User Management**: Oversee all platform users and their permissions
- **System Configuration**: Platform-wide settings and configurations

#### 🏪 Store Admin (Store Owners/Sub-Admins)
- **Access**: `/stores/[slug]/admin` - Store-specific management interface
- **Dashboard**: Store analytics, performance metrics, and quick actions
- **Product Management**: Add, edit, and manage store inventory and pricing
- **Order Processing**: Handle customer orders, update status, manage deliveries
- **Customer Management**: View customer data and interaction history
- **Store Settings**: Configure store branding, business details, and preferences

#### 🔐 Role-Based Access Control
- **Database Table**: `store_admins` with user-tenant relationships
- **Permission System**: Granular permissions (products, orders, customers, settings)
- **Role Types**: Owner, Admin, Manager with different access levels
- **Middleware Protection**: Automatic authentication and authorization
- **Session Management**: Secure session handling with role verification

#### 🎨 Store Customization Features
- **Custom Branding**: Logo upload, primary colors, store themes
- **Multi-Language Support**: Arabic (RTL) and French names and descriptions
- **Business Configuration**: Delivery fees, minimum orders, operating hours
- **Payment Settings**: Configure payment methods and pricing
- **Location Settings**: Delivery zones, addresses, contact information

#### 🗄️ Database Architecture
- **Tenant Isolation**: Complete RLS policies ensure zero data leakage
- **Store Admins Table**: Role and permission management
- **Permission Functions**: Database functions for role checking
- **Audit Trails**: Track all admin actions and changes
- **Performance Optimization**: Indexed queries for fast admin operations

#### 🔄 Admin Workflows
- **Store Onboarding**: Global admin creates store → assigns store owner → store owner completes setup
- **Daily Operations**: Store owners manage products/orders → global admin monitors platform
- **Scaling**: Easy addition of new stores and assignment of store admins
- **Support**: Global admin can access any store for support purposes

#### 📊 Analytics & Reporting
- **Store-Level**: Revenue, orders, customer metrics per store
- **Platform-Level**: Aggregated metrics across all stores
- **Performance Monitoring**: Store performance comparison and optimization
- **Financial Reporting**: Revenue tracking and commission calculations

## Performance Optimization System

### Complete Implementation
Enterprise-level performance optimizations implemented:

#### 🖼️ Image Optimization
- **Next.js Configuration**: WebP/AVIF formats, responsive sizes, optimized caching headers
- **Progressive Loading**: Blur placeholders with shimmer effects during load
- **Multiple Components**: `ProductImage`, `AvatarImage`, `HeroImage` with size variants
- **Smart Preloading**: Priority loading for above-the-fold images
- **Lazy Loading**: Intersection Observer for off-screen images

#### 🗄️ Caching Strategies
- **Database Query Caching**: Server-side caching with Next.js `unstable_cache`
- **React Query Integration**: Client-side caching with stale-while-revalidate strategy
- **Browser Cache Utilities**: localStorage/sessionStorage with automatic expiration
- **Cache Invalidation**: Tagged cache system for precise cache invalidation
- **Multi-level Caching**: Memory, browser, and server-side cache layers

#### 📱 PWA & Offline Support
- **Service Worker**: Comprehensive caching strategies (cache-first, network-first, stale-while-revalidate)
- **Offline Page**: Graceful offline experience with helpful messaging
- **Background Sync**: Queue actions when offline, sync when connection restored
- **Push Notifications**: Infrastructure ready for push notification integration
- **PWA Manifest**: Complete app manifest with shortcuts, icons, and metadata

#### 📊 Performance Monitoring
- **Web Vitals**: LCP, FID, CLS, TTFB monitoring and reporting
- **Memory Monitoring**: JavaScript heap size tracking and optimization
- **Connection Awareness**: Adapt behavior to slow connections and data saver mode
- **Bundle Analysis**: Development-time bundle size analysis
- **Motion Preferences**: Respect user accessibility preferences (reduced motion)

#### 🚀 Load Performance
- **DNS Prefetch**: Preconnect to external domains for faster resource loading
- **Resource Preloading**: Critical fonts and images preloaded
- **Code Splitting**: Automatic with Next.js App Router
- **Tree Shaking**: Unused code elimination for smaller bundles
- **Compression**: Built-in gzip/brotli compression enabled

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
- `tenants` - Store/grocery information with branding and business settings
- `store_admins` - Role-based access control linking users to specific stores
- `categories` - Product categories (tenant-scoped)
- `products` - Grocery items with Arabic/French names and pricing
- `orders` - Customer orders with delivery info and user association
- `order_items` - Order line items with product snapshots
- `cart_items` - Persistent cart storage for authenticated users
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

### Adding a New Store (SaaS Leasing)
1. **Global Admin**: Use `/admin/stores` to create new store with branding
2. **Store Assignment**: Use `/admin/store-admins` to assign store owner
3. **Store Setup**: Store owner completes setup via `/stores/[slug]/admin`
4. **Testing**: Verify tenant isolation and proper role-based access

### Managing Store Admins
1. **User Creation**: Store owners must have accounts (can be created via admin)
2. **Role Assignment**: Assign users to stores with specific roles and permissions
3. **Permission Management**: Configure granular access (products, orders, customers, settings)
4. **Access Testing**: Verify store admins can only access their assigned stores

### Database Schema Changes
1. Create migration: `supabase migration new descriptive_name`
2. Write SQL in generated migration file
3. Test locally: `supabase db reset`
4. Apply to remote: `supabase db push`

### Authentication Testing
1. Start development: `npm run dev`
2. Start Supabase: `supabase start`
3. Open Inbucket: http://127.0.0.1:54324
4. Test signup at: `/stores/[slug]/auth/signup`
5. Check emails in Inbucket for confirmation links

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