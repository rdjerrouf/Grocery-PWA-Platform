# Code - Feature Implementation

Use this prompt when you need to implement specific features or functionality.

## Template

**Feature**: [Name of the feature to implement]

**Requirements**:
- [Specific requirement 1]
- [Specific requirement 2]
- [Additional constraints or considerations]

**Technical Specifications**:
- **Database**: [Tables/schema changes needed]
- **Frontend**: [Components/pages to create]
- **Backend**: [Server actions/API endpoints]
- **Authentication**: [Permission requirements]

**Implementation Notes**:
- [Any specific patterns to follow]
- [Integration points with existing code]
- [Performance considerations]

## Examples

### Product Management Feature
**Feature**: Admin product CRUD interface with image upload

**Requirements**:
- Admin can create, edit, delete products
- Support Arabic/French names and descriptions
- Image upload to Supabase Storage
- Stock management with low stock alerts
- Category assignment

**Technical Specifications**:
- **Database**: Products table with multilingual fields, product_images table
- **Frontend**: ProductForm component, ProductList with actions
- **Backend**: Server actions for CRUD operations, image upload handler
- **Authentication**: Admin role required for all operations

**Implementation Notes**:
- Use React Hook Form with Zod validation
- Implement proper RLS policies for tenant isolation
- Follow the established server action patterns
- Use optimistic updates for better UX

### Shopping Cart Feature
**Feature**: Persistent shopping cart with real-time inventory checks

**Requirements**:
- Add/remove items from cart
- Quantity adjustments with stock validation
- Cart persistence across sessions
- Real-time inventory updates
- Cart total calculation

**Technical Specifications**:
- **Database**: cart_items table with user association
- **Frontend**: Cart state management with Zustand
- **Backend**: Server actions for cart operations
- **Authentication**: User must be logged in

**Implementation Notes**:
- Use Zustand for client-side state
- Sync with database for persistence
- Implement Supabase Realtime for inventory updates
- Handle offline scenarios gracefully