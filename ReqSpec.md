Multi-Tenant Supermarket Platform - Requirements Specification
1. Executive Summary
1.1 Project Overview
Development of a multi-tenant SaaS platform enabling multiple supermarkets to operate independent online stores through a single codebase infrastructure. The platform will serve web browsers (desktop/mobile) initially, with native mobile apps following after market validation.
1.2 Core Objectives

Scalability: Support 1-100+ supermarket tenants on shared infrastructure
Maintainability: Single codebase serving all tenants with configuration-based customization
Cost-efficiency: Minimize operational costs through resource sharing and automation
Market-fit: Algeria-specific payment methods and user experience

1.3 Technology Strategy

Web-first Progressive Web App (PWA) approach
Native mobile apps via Capacitor wrapper (post-MVP)
100% code reuse between web and mobile
Configuration-driven multi-tenancy

2. Functional Requirements
2.1 Multi-Tenant Architecture
2.1.1 Tenant Isolation

Data Segregation: PostgreSQL schema-based isolation (one schema per tenant)
Configuration Management: Database-stored tenant configurations
Access Control: Subdomain-based tenant identification (e.g., supermarket1.platform.dz)
Resource Sharing: Shared application server, separate data layers

2.1.2 Tenant Customization

Branding: Custom logos, colors, fonts per tenant
Features: Toggle-based feature activation (delivery, pickup, loyalty programs)
Business Rules: Configurable minimum order, delivery zones, operating hours
Pricing: Tenant-specific product pricing and promotions

2.2 Core E-Commerce Features
2.2.1 Product Management

Catalog: Categories, subcategories, product variants
Inventory: Real-time stock tracking per tenant
Pricing: Multiple price tiers, promotional pricing
Search: Full-text search with Arabic/French support

2.2.2 Shopping Experience

Cart Management: Persistent cart across sessions
Wishlist: Save products for later
Quick Reorder: Order history and repeat orders
Product Reviews: Customer ratings and reviews

2.2.3 Order Management

Order Types: Delivery and pickup options
Order Tracking: Real-time status updates
Order History: Complete purchase history
Notifications: SMS and in-app notifications

2.3 Payment Integration
2.3.1 Supported Payment Methods

EDAHABIA Cards:

Primary payment method (16+ million users)
Integration via Chargily Pay gateway
Support for new tiered card system


CIB Cards:

Secondary payment method (interbank cards)
Integration via Chargily Pay or SATIM
Support for all participating banks



2.3.2 Payment Features

Transaction Processing: Secure payment flow with 3D Secure where applicable
Payment Confirmation: SMS and email confirmations
Refund Management: Partial and full refund capabilities
Reconciliation: Automated daily reconciliation per tenant
Multi-language: Arabic and French payment interfaces

2.3.3 Payment Security

PCI Compliance: No card data storage, tokenization only
Fraud Detection: Basic velocity checks and suspicious pattern detection
Transaction Logging: Complete audit trail for compliance
Secure Webhooks: Signature verification for payment callbacks

2.4 User Management
2.4.1 Customer Accounts

Registration: Email/phone number registration
Authentication: JWT-based auth with refresh tokens
Profile Management: Delivery addresses, payment methods
Password Recovery: SMS/Email based recovery

2.4.2 Tenant Administration

Admin Panel: Web-based administration interface
Role-Based Access: Owner, manager, operator roles
Analytics Dashboard: Sales, orders, customer metrics
Inventory Management: Stock updates, low stock alerts

2.5 Delivery Management
2.5.1 Delivery Configuration

Zone Management: Wilaya-based delivery zones
Delivery Slots: Time-based delivery windows
Delivery Fees: Zone and order-value based pricing
Driver Assignment: Manual or automated assignment

2.5.2 Pickup Options

Store Selection: Multiple pickup locations per tenant
Pickup Slots: Available time slots for pickup
Pickup Notification: SMS when order ready
Verification: Order code for pickup verification

3. Non-Functional Requirements
3.1 Performance

Page Load: < 3 seconds on 3G connection
API Response: < 500ms for standard queries
Concurrent Users: Support 1000+ concurrent users per tenant
Database: < 100ms query time for common operations

3.2 Scalability

Horizontal Scaling: Stateless architecture for easy scaling
Database Scaling: Read replicas for high-traffic tenants
CDN Integration: Static assets served via CDN
Queue System: Async processing for heavy operations

3.3 Availability

Uptime Target: 99.9% availability
Graceful Degradation: Offline mode for critical features
Backup Strategy: Daily automated backups with point-in-time recovery
Disaster Recovery: RTO < 4 hours, RPO < 1 hour

3.4 Security

Data Encryption: TLS 1.3 for transit, AES-256 for sensitive data at rest
Authentication: Multi-factor authentication for admin accounts
Authorization: Row-level security in database
Compliance: GDPR-ready architecture, local data residency

3.5 Localization

Languages: Arabic (primary), French (secondary)
RTL Support: Full right-to-left layout support
Currency: Algerian Dinar (DZD) only
Date/Time: Local timezone (CET/CEST)

4. Technical Architecture
4.1 Technology Stack
4.1.1 Frontend

Framework: Next.js 14+ with App Router
Styling: Tailwind CSS for responsive design
State Management: Zustand for client state
PWA: Service workers for offline capability
Mobile Wrapper: Capacitor for native apps (Phase 2)

4.1.2 Backend

API Framework: FastAPI (Python) or Django REST Framework
Database: PostgreSQL 15+ with PostGIS for geo queries
Cache: Redis for session and data caching
Queue: Celery with Redis broker
Storage: S3-compatible object storage (Backblaze B2)

4.1.3 Infrastructure

Hosting: VPS (Hetzner/OVH) starting at 8GB RAM
Container: Docker with Docker Swarm orchestration
Reverse Proxy: Traefik with automatic SSL
CDN: Cloudflare for static assets and DDoS protection
Monitoring: Prometheus + Grafana stack

4.2 Development Approach
4.2.1 Code Organization
monorepo/
├── apps/
│   ├── web/          # Next.js PWA
│   ├── admin/        # Admin dashboard
│   └── mobile/       # Capacitor wrapper (Phase 2)
├── packages/
│   ├── ui/           # Shared components
│   ├── api-client/   # API SDK
│   └── config/       # Shared configurations
└── services/
    ├── api/          # Backend API
    └── workers/      # Background jobs
4.2.2 Development Phases

Phase 1 (Months 1-3): Core e-commerce, EDAHABIA payments, web platform
Phase 2 (Months 4-5): CIB payments, advanced features, mobile apps
Phase 3 (Months 6+): Analytics, loyalty programs, advanced delivery

5. User Experience Requirements
5.1 Web Application

Responsive Design: Mobile-first, works on all screen sizes
Offline Support: Browse products and cart without connection
Performance: Lazy loading, optimized images, code splitting
Accessibility: WCAG 2.1 AA compliance

5.2 Mobile Experience

PWA Features: Install prompt, offline mode, push notifications
Native Features (Phase 2): Camera for barcode scanning, GPS for delivery tracking
Platform Support: iOS 13+, Android 8+
App Store Deployment: Automated per-tenant builds

6. Integration Requirements
6.1 Payment Gateways

Primary: Chargily Pay (EDAHABIA + CIB support)
Webhook Handling: Secure webhook endpoints for payment status
Reconciliation: Daily automated reconciliation
Testing: Sandbox environment for development

6.2 Third-Party Services

SMS Gateway: For order notifications and OTP
Email Service: Transactional emails (order confirmation, receipts)
Analytics: Google Analytics 4 or Plausible (self-hosted)
Error Tracking: Sentry for error monitoring

7. Operational Requirements
7.1 Deployment

CI/CD: GitHub Actions for automated testing and deployment
Environments: Development, staging, production
Rollback: One-click rollback capability
Database Migrations: Automated with rollback support

7.2 Monitoring

Application Metrics: Response times, error rates, throughput
Business Metrics: Orders, revenue, conversion rates per tenant
Alerts: Slack/email notifications for critical issues
Logging: Centralized logging with 30-day retention

7.3 Support

Documentation: API docs, user guides, admin manuals
Training: Video tutorials for tenant onboarding
Support Channels: Email support, knowledge base
SLA: 24-hour response time for critical issues

8. Constraints and Assumptions
8.1 Constraints

Budget: Initial infrastructure budget < $500/month
Team: Single developer/owner initially
Market: Algeria-specific, not planning international expansion
Language: Arabic/French only, no English interface needed

8.2 Assumptions

Internet Connectivity: Users have at least 3G mobile data
Payment Adoption: Users willing to try online payments
Smartphone Penetration: 70%+ of target users have smartphones
Tenant Count: 1-5 tenants in first year, 10-20 in second year

9. Success Criteria
9.1 Technical Metrics

Performance: 95% of requests under 1 second
Availability: 99.9% uptime achieved
Error Rate: < 1% transaction failure rate
Mobile Score: 90+ Lighthouse score

9.2 Business Metrics

Tenant Acquisition: 3+ active tenants in 6 months
Transaction Volume: 100+ orders/day across platform
Payment Success: > 95% payment success rate
User Retention: 40% monthly active user retention

10. Risk Management
10.1 Technical Risks

Payment Gateway Downtime: Implement fallback payment methods
Scaling Issues: Design for horizontal scaling from day one
Data Loss: Automated backups and disaster recovery plan
Security Breach: Regular security audits and penetration testing

10.2 Business Risks

Slow Payment Adoption: Start with cash-on-delivery option
Tenant Churn: Flexible contracts, excellent support
Competition: Focus on superior UX and local market knowledge
Regulatory Changes: Stay informed on e-commerce regulations

11. Future Enhancements (Post-MVP)

AI Features: Product recommendations, demand forecasting
Loyalty Programs: Points, rewards, gamification
Subscription Commerce: Recurring orders for regular items
B2B Features: Bulk ordering for restaurants/businesses
Financial Services: Buy-now-pay-later integration
Social Commerce: WhatsApp/Facebook Messenger integration
Voice Commerce: Voice ordering capability
Blockchain: Supply chain transparency features