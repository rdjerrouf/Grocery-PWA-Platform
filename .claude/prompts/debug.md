# Debug - Troubleshooting & Problem Solving

Use this prompt when you encounter errors or need help debugging issues.

## Template

**Issue**: [Brief description of the problem]

**Error Message**: [Exact error message if available]
```
[Paste error logs/stack trace here]
```

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Error occurs]

**Expected Behavior**: [What should happen instead]

**Current Code**: [Relevant code snippets]
```tsx
// Paste relevant code here
```

**Environment**:
- Next.js version: [version]
- Supabase version: [version]
- Browser: [if frontend issue]
- Database: [if backend issue]

**Investigation Done**:
- [What you've already tried]
- [Results of attempts]

## Examples

### RLS Policy Issue
**Issue**: Products not showing up for authenticated users

**Error Message**:
```
Error: No rows returned from products query
```

**Steps to Reproduce**:
1. User logs in successfully
2. Navigate to products page
3. Empty product list displayed despite products existing in database

**Expected Behavior**: Products should be visible to authenticated users of the same tenant

**Current Code**:
```tsx
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
```

**Environment**:
- Next.js version: 14.0.0
- Supabase version: 2.38.0
- Database: PostgreSQL with RLS enabled

**Investigation Done**:
- Verified JWT contains tenant_id claim
- Checked RLS policies are enabled
- Confirmed products exist in database

### Authentication Middleware Issue
**Issue**: Middleware redirecting authenticated users incorrectly

**Error Message**:
```
TypeError: Cannot read properties of null (reading 'user')
```

**Steps to Reproduce**:
1. User logs in
2. Navigate to admin page
3. Gets redirected to login despite being authenticated

**Expected Behavior**: Authenticated admin users should access admin pages

**Current Code**:
```tsx
export async function middleware(req: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession()
  // session is null here
}
```

**Environment**:
- Next.js version: 14.0.0
- Browser: Chrome 120
- Supabase auth helpers: 0.8.0

**Investigation Done**:
- Checked cookies are being set
- Verified createMiddlewareClient usage
- Tested with different browsers