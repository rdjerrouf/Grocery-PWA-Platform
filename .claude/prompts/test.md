# Test - Testing Strategies & Implementation

Use this prompt when you need help with testing approaches or implementing tests.

## Template

**Testing Scope**: [What needs to be tested]

**Type of Tests**:
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Database tests
- [ ] Performance tests

**Specific Requirements**:
- [Test scenario 1]
- [Test scenario 2]
- [Edge cases to cover]

**Tools & Framework**: [Preferred testing tools]

**Success Criteria**: [How to determine tests are sufficient]

## Examples

### RLS Policy Testing
**Testing Scope**: Verify Row Level Security policies work correctly for multi-tenant isolation

**Type of Tests**:
- [x] Integration tests
- [x] Database tests

**Specific Requirements**:
- Users can only see their tenant's data
- Admin users have proper permissions
- Anonymous users have appropriate access
- Cross-tenant data leakage prevention

**Tools & Framework**:
- Jest for test runner
- Supabase test client with different auth contexts
- Database seeding for test data

**Success Criteria**:
- All RLS policies verified with different user roles
- No cross-tenant data access possible
- Performance impact of RLS policies measured

### E2E Shopping Flow
**Testing Scope**: Complete customer shopping experience from product browse to order completion

**Type of Tests**:
- [x] E2E tests

**Specific Requirements**:
- Product catalog browsing and search
- Add to cart functionality
- Checkout process with payment
- Order confirmation and tracking
- Multi-language support (Arabic/French)

**Tools & Framework**:
- Playwright for E2E testing
- Test database with seed data
- Mock payment gateway responses

**Success Criteria**:
- Complete shopping flow works in both languages
- All payment scenarios covered
- Mobile and desktop compatibility verified

### Server Action Testing
**Testing Scope**: Product management server actions for admin users

**Type of Tests**:
- [x] Unit tests
- [x] Integration tests

**Specific Requirements**:
- CRUD operations work correctly
- Input validation with Zod schemas
- Proper error handling
- Permission checks for admin-only actions

**Tools & Framework**:
- Jest for unit tests
- Supertest for API testing
- Mock Supabase client for isolated tests

**Success Criteria**:
- All server actions have >90% test coverage
- Error scenarios properly handled
- Authentication and authorization verified