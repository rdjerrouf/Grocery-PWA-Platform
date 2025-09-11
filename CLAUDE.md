# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-tenant grocery PWA platform built with Next.js 15, Supabase, and TypeScript. It supports multiple grocery stores (tenants) with internationalization (Arabic, French, English) and real-time shopping cart functionality.

## Development Commands

- `npm run dev` - Start development server with Turbopack and Chrome browser
- `npm run build` - Build production bundle with Turbopack  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Testing Commands

- `npm run test` - Run Playwright tests headlessly
- `npm run test:headed` - Run Playwright tests with browser UI
- `npm run test:ui` - Run Playwright tests with interactive UI mode
- `npm run test:report` - Show HTML test report

## Database & Backend

### Supabase Configuration
- Local development uses ports: API (54321), DB (54322), Studio (54323)
- Database schema includes: tenants, categories, products, orders, order_items
- Migrations are in `supabase/migrations/`
- Seed data in `supabase/seed.sql`

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Multi-tenant Architecture
The database is designed around tenants (grocery stores):
- Each tenant has their own products, categories, and orders
- Products support multiple languages (name, name_ar, name_fr)
- Prices are stored in cents (multiply by 100)
- Currency defaults to DZD (Algerian Dinar)

## Code Architecture

### State Management
- **Zustand** for cart state (`stores/useCartStore.ts`)
- Cart handles: add/remove items, quantity updates, subtotal calculation
- Cart items include: productId, name, nameAr, price, salePrice, quantity, unit

### Component Structure
- **App Router** architecture (`app/` directory)
- **UI Components** in `components/ui/` (using Tailwind CSS + shadcn/ui patterns)
- **Shop Components** in `components/shop/` (ProductCard, etc.)
- Path alias `@/*` maps to project root

### Styling & UI
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **Responsive design** with mobile-first approach
- **Product cards** support: sale prices, stock status, quantity controls

### Form Handling
- **React Hook Form** with **Zod** validation
- **@hookform/resolvers** for Zod integration

### Internationalization
- **next-intl** for i18n support  
- **Two languages**: French (default) and Arabic
- Products support French (`name`) and Arabic (`nameAr`) names/descriptions
- Location data supports French and Arabic (`nameAr`) wilaya names
- Currency formatting uses `Intl.NumberFormat` with DZD

### PWA Features
- **next-pwa** configured for Progressive Web App functionality

## Key Patterns

### Database Field Naming
- Database uses snake_case: `name_ar`, `name_fr`, `sale_price`, `stock_quantity`
- Frontend uses camelCase: `nameAr`, `nameFr`, `salePrice`, `stockQuantity`
- Convert between conventions when interfacing with Supabase
- French is primary language (`name`), Arabic is secondary (`name_ar`)

### Price Handling
- Prices stored as integers in cents in database
- Convert to display format: `amount / 100`
- Use `formatCurrency()` utility for consistent formatting

### Product Data Flow
- Products have required: `id`, `name` (French), `price`, `stockQuantity`
- Optional: `nameAr`, `salePrice`, `imageUrl`, `description`, `descriptionAr`
- Cart operations use `productId` for identification
- Locale prop: `'fr'` (default) or `'ar'` for language switching

### TypeScript Configuration
- Strict mode enabled
- Path mapping: `@/*` → `./`
- Next.js plugin for optimal TypeScript experience

### Location Constants (Algeria)
- **Algeria wilayas data** in `lib/constants/algeria.ts`
- Complete list of 58 wilayas with codes, names (French/Arabic), and cities
- Utility functions: `getWilayaByCode()`, `getWilayaByName()`, `getCitiesByWilaya()`, `searchWilayas()`
- Use for: delivery zones, user location selection, tenant filtering, shipping calculations
- Names in French (primary) and Arabic (`nameAr`)
- Example: `getWilayaByCode('16')` returns Alger wilaya with all its cities

## Testing Architecture

### **E2E Testing with Playwright**
- **Test files** in `tests/` directory
- **Configuration** in `playwright.config.ts`
- **Test data attributes** on components for reliable selection
- **Multi-browser testing** (Chrome, Firefox, Safari, Mobile)

### **Test Coverage**
- **Homepage** navigation and layout
- **Store pages** in French/Arabic locales  
- **Product cards** display and interactions
- **API endpoints** and Supabase integration
- **Error handling** and 404 pages
- **Performance** and security checks

### **Testing Best Practices**
- Use `data-testid` attributes for component targeting
- Test both French and Arabic language modes
- Verify real Supabase data loading
- Check responsive design on mobile/desktop
- Monitor console errors during tests