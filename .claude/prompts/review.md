# Review - Code Review & Quality Assurance

Use this prompt when you need code review or want to improve code quality.

## Template

**Code to Review**: [Description of code/feature]

**Review Focus**:
- [ ] Code quality & readability
- [ ] Performance optimization
- [ ] Security considerations
- [ ] Best practices adherence
- [ ] TypeScript usage
- [ ] Supabase integration patterns

**Specific Concerns**:
- [Any particular areas of concern]
- [Questions about implementation choices]

**Code Sample**:
```tsx
// Paste code to review here
```

**Context**: [Where this code fits in the application]

## Examples

### Product Listing Component Review
**Code to Review**: Product catalog page with search and filtering

**Review Focus**:
- [x] Performance optimization
- [x] TypeScript usage
- [x] Supabase integration patterns

**Specific Concerns**:
- Is the database query efficient?
- Are we properly typing the Supabase responses?
- Should we implement pagination?

**Code Sample**:
```tsx
export default async function ProductsPage({ searchParams }: Props) {
  const supabase = createServerComponentClient({ cookies })

  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)

  if (searchParams.search) {
    query = query.or(`name_ar.ilike.%${searchParams.search}%,name_fr.ilike.%${searchParams.search}%`)
  }

  const { data: products } = await query.order('created_at', { ascending: false })

  return <ProductGrid products={products || []} />
}
```

**Context**: Main product listing page used by customers to browse products

### Server Action Security Review
**Code to Review**: Product creation server action with file upload

**Review Focus**:
- [x] Security considerations
- [x] Best practices adherence
- [x] Error handling

**Specific Concerns**:
- Are we properly validating file uploads?
- Is the authentication check sufficient?
- How should we handle large file uploads?

**Code Sample**:
```tsx
export async function createProduct(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const image = formData.get('image') as File
  const productData = {
    name_ar: formData.get('name_ar'),
    name_fr: formData.get('name_fr'),
    price: parseFloat(formData.get('price') as string),
  }

  // Upload image
  const { data: imageData } = await supabase.storage
    .from('products')
    .upload(`${Date.now()}-${image.name}`, image)

  // Create product
  const { data } = await supabase
    .from('products')
    .insert({ ...productData, image_url: imageData?.path })

  revalidatePath('/products')
  return data
}
```

**Context**: Admin function for creating new products with image uploads