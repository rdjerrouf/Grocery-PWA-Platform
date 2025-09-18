# Tenant - Multi-Tenant Specific Tasks

Use this prompt for multi-tenant specific features, tenant management, and tenant isolation concerns.

## Template

**Tenant Feature**: [What tenant-specific functionality is needed]

**Tenant Scope**:
- [ ] Tenant-specific data
- [ ] Cross-tenant functionality
- [ ] Tenant configuration
- [ ] Tenant onboarding
- [ ] Tenant analytics

**Isolation Requirements**:
- [Data that must be isolated]
- [Data that can be shared]
- [Permission boundaries]

**Customization Needs**:
- [Tenant-specific UI/branding]
- [Feature flags per tenant]
- [Custom business logic]

**Scaling Considerations**: [How this affects multiple tenants]

## Examples

### Tenant Onboarding Flow
**Tenant Feature**: Complete onboarding process for new grocery store tenants

**Tenant Scope**:
- [x] Tenant configuration
- [x] Tenant onboarding

**Isolation Requirements**:
- Each tenant gets their own subdomain
- Tenant data completely isolated
- Admin users can only manage their tenant
- Customer data belongs to specific tenant

**Customization Needs**:
- Custom store name and logo
- Brand colors and styling
- Currency and language preferences
- Store-specific categories and settings

**Scaling Considerations**:
- Onboarding process should be self-service
- Automated subdomain setup
- Default data seeding for new tenants
- Billing integration for tenant upgrades

### Tenant-Specific Product Categories
**Tenant Feature**: Allow each tenant to define their own product category structure

**Tenant Scope**:
- [x] Tenant-specific data
- [x] Tenant configuration

**Isolation Requirements**:
- Categories are completely tenant-specific
- No cross-tenant category sharing
- Category hierarchy belongs to tenant
- RLS policies enforce category isolation

**Customization Needs**:
- Custom category names in Arabic/French
- Tenant-specific category icons
- Different category hierarchies per tenant
- Custom category-based product organization

**Scaling Considerations**:
- Efficient category queries across tenants
- Category management UI for admins
- Migration tools for category restructuring
- Category analytics per tenant

### Cross-Tenant Analytics Platform
**Tenant Feature**: Platform-level analytics while maintaining tenant isolation

**Tenant Scope**:
- [x] Cross-tenant functionality
- [x] Tenant analytics

**Isolation Requirements**:
- Individual tenant data remains isolated
- Only aggregated, anonymized metrics shared
- Platform admins see overall trends
- Tenant admins only see their own data

**Customization Needs**:
- Tenant-specific dashboard themes
- Custom KPI definitions per tenant
- Tenant comparison features (opt-in)
- White-label analytics reports

**Scaling Considerations**:
- Efficient aggregation across many tenants
- Real-time analytics without performance impact
- Data warehouse integration for large-scale analytics
- Tenant-specific caching strategies