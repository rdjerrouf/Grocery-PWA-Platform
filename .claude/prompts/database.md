# Database - Schema Design & Query Optimization

Use this prompt for database-related tasks, schema design, and query optimization.

## Template

**Database Task**: [What needs to be designed or optimized]

**Requirements**:
- [Functional requirement 1]
- [Functional requirement 2]
- [Performance requirements]
- [Data integrity requirements]

**Multi-Tenant Considerations**:
- [How this affects tenant isolation]
- [RLS policy requirements]
- [Cross-tenant data needs]

**Expected Usage Patterns**:
- [Read/write ratios]
- [Query frequency]
- [Data volume expectations]

**Integration Points**: [How this connects to existing schema]

## Examples

### Order Management Schema
**Database Task**: Design complete order management system for multi-tenant grocery platform

**Requirements**:
- Support multiple order statuses (pending, confirmed, preparing, delivered, cancelled)
- Store customer information and delivery details
- Track order items with product snapshots for price consistency
- Support different payment methods (EDAHABIA, CIB)
- Order history and analytics capability

**Multi-Tenant Considerations**:
- Each tenant manages their own orders
- RLS policies prevent cross-tenant access
- Order numbering can be per-tenant or global
- Shared payment processing but tenant-specific settlement

**Expected Usage Patterns**:
- High read volume for order status checking
- Moderate write volume for new orders
- Analytical queries for admin dashboards
- Real-time updates for order status changes

**Integration Points**:
- Links to products table for order items
- Links to tenants table for tenant isolation
- Links to profiles table for customer information

### Inventory Management Schema
**Database Task**: Real-time inventory tracking with low stock alerts

**Requirements**:
- Track current stock levels per product
- Log stock movements (sales, restocking, adjustments)
- Support reserved inventory during checkout process
- Automated low stock alerts for admin users
- Inventory history for analytics

**Multi-Tenant Considerations**:
- Inventory is tenant-specific
- No cross-tenant inventory sharing
- Each tenant sets their own low stock thresholds
- RLS policies ensure data isolation

**Expected Usage Patterns**:
- Frequent stock level checks during shopping
- Real-time updates when orders are placed
- Bulk inventory updates during restocking
- Daily/weekly inventory reports

**Integration Points**:
- Direct relationship with products table
- Triggers on order completion to reduce stock
- Integration with Supabase Realtime for live updates

### Analytics Schema
**Database Task**: Admin dashboard analytics for sales and customer insights

**Requirements**:
- Daily/weekly/monthly sales summaries
- Product performance metrics
- Customer behavior tracking
- Revenue analytics by category
- Top-selling products reports

**Multi-Tenant Considerations**:
- Each tenant only sees their own analytics
- Aggregated data stays within tenant boundaries
- No cross-tenant comparisons or data leakage
- Tenant-specific KPI calculations

**Expected Usage Patterns**:
- Daily dashboard loads by admin users
- Weekly/monthly report generation
- Real-time sales tracking during peak hours
- Historical trend analysis

**Integration Points**:
- Aggregates data from orders and order_items
- Links to products and categories for segmentation
- Uses PostgreSQL window functions for time-series analysis