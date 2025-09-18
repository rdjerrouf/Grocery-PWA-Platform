# Ask - General Questions & Clarifications

Use this prompt when you need clarification or have questions about the project.

## Template

**Context**: [Brief description of what you're working on]

**Question**: [Your specific question]

**Background**: [Any relevant context or previous attempts]

**Expected Outcome**: [What you hope to understand or achieve]

## Examples

### Architecture Question
**Context**: Implementing multi-tenant authentication with Supabase

**Question**: Should we store tenant_id in JWT claims or fetch it from the profiles table on each request?

**Background**: Currently using middleware to extract subdomain and determine tenant, but need to decide how to pass this to RLS policies

**Expected Outcome**: Clear guidance on the most efficient approach for tenant isolation

### Database Design Question
**Context**: Designing the orders table for multi-tenant e-commerce

**Question**: How should we handle order numbering across tenants? Global counter or per-tenant?

**Background**: Need human-readable order numbers for customer reference, but also need to ensure uniqueness

**Expected Outcome**: Database schema recommendation with proper constraints

### Performance Question
**Context**: Product catalog with Arabic/French search

**Question**: Should we use Supabase's full-text search or implement custom search with PostgreSQL?

**Background**: Need to search across both Arabic and French product names and descriptions

**Expected Outcome**: Search implementation strategy with performance considerations