# Multi-Tenant Supermarket Platform

## Project Overview
Building a multi-tenant SaaS platform for Algerian supermarkets using Next.js 14 and Supabase as a Backend-as-a-Service (BaaS).

## Why Supabase?
- **Cost**: Free tier perfect for MVP, $25/mo handles significant scale
- **Features**: Auth, Realtime, Storage, Edge Functions built-in
- **Multi-tenancy**: Row Level Security (RLS) perfect for tenant isolation
- **PostgreSQL**: Full SQL power when needed
- **Developer Experience**: Excellent TypeScript support

## Business Context
- **Market**: Algeria-specific e-commerce
- **Target**: 1-100+ supermarket tenants
- **Users**: Arabic/French speaking customers
- **Payments**: EDAHABIA (16M+ users) and CIB cards via Chargily

## Architecture Decisions
- **Frontend**: Next.js 14 App Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Multi-tenancy**: RLS with tenant_id in all tables
- **File Storage**: Supabase Storage for product images
- **Realtime**: Supabase Realtime for live inventory
- **Edge Functions**: For payment webhooks and complex logic

## Success Metrics
- Page load < 3 seconds on 3G
- 99.9% uptime (Supabase SLA)
- 95% payment success rate
- 3+ active tenants in 6 months

## Constraints
- Budget: Free tier initially, then $25/month
- Team: Single developer
- Languages: Arabic/French UI only
- Region: Algeria-focused