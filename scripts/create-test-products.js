#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function createTestProducts() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get tenants
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, slug')

  if (!tenants || tenants.length === 0) {
    console.log('❌ No tenants found. Run create-both-tenants.js first.')
    process.exit(1)
  }

  // Get or create categories
  const categories = [
    { name: 'Fruits & Vegetables', name_ar: 'فواكه وخضروات', name_fr: 'Fruits et Légumes' },
    { name: 'Dairy Products', name_ar: 'منتجات الألبان', name_fr: 'Produits Laitiers' },
    { name: 'Bread & Bakery', name_ar: 'خبز ومخبوزات', name_fr: 'Pain et Boulangerie' }
  ]

  console.log('Creating categories...')
  for (const tenant of tenants) {
    for (const cat of categories) {
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      const { data, error } = await supabase
        .from('categories')
        .upsert({
          tenant_id: tenant.id,
          name: cat.name,
          name_ar: cat.name_ar,
          name_fr: cat.name_fr,
          slug: slug,
          is_active: true
        }, {
          onConflict: 'tenant_id,slug'
        })
        .select()

      if (error) {
        console.error('Error creating category:', error)
      }
    }
  }

  // Get categories for product creation
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('id, tenant_id, name')

  // Create test products
  const products = [
    {
      name: 'Fresh Apples',
      name_ar: 'تفاح طازج',
      name_fr: 'Pommes Fraîches',
      description: 'Fresh red apples from local farms',
      description_ar: 'تفاح أحمر طازج من المزارع المحلية',
      description_fr: 'Pommes rouges fraîches des fermes locales',
      price: 350,
      stock_quantity: 100,
      unit: 'kg',
      is_featured: true,
      category_filter: 'Fruits & Vegetables'
    },
    {
      name: 'Fresh Milk',
      name_ar: 'حليب طازج',
      name_fr: 'Lait Frais',
      description: 'Pure fresh milk from local dairy',
      description_ar: 'حليب طازج نقي من الألبان المحلية',
      description_fr: 'Lait pur et frais de la laiterie locale',
      price: 120,
      stock_quantity: 50,
      unit: 'liter',
      is_featured: true,
      category_filter: 'Dairy Products'
    },
    {
      name: 'French Bread',
      name_ar: 'خبز فرنسي',
      name_fr: 'Pain Français',
      description: 'Traditional French baguette',
      description_ar: 'باجيت فرنسي تقليدي',
      description_fr: 'Baguette française traditionnelle',
      price: 80,
      stock_quantity: 30,
      unit: 'piece',
      is_featured: true,
      category_filter: 'Bread & Bakery'
    }
  ]

  console.log('Creating products...')
  for (const tenant of tenants) {
    for (const product of products) {
      // Find category for this tenant
      const category = dbCategories?.find(c =>
        c.tenant_id === tenant.id &&
        c.name === product.category_filter
      )

      if (!category) {
        console.log(`⚠️ No category found for ${product.name} in tenant ${tenant.slug}`)
        continue
      }

      const productData = {
        tenant_id: tenant.id,
        category_id: category.id,
        name: product.name,
        name_ar: product.name_ar,
        name_fr: product.name_fr,
        description: product.description,
        description_ar: product.description_ar,
        description_fr: product.description_fr,
        price: product.price,
        stock_quantity: product.stock_quantity,
        unit: product.unit,
        is_featured: product.is_featured,
        is_active: true,
        sku: `${tenant.slug}-${product.name.toLowerCase().replace(/\s+/g, '-')}`
      }

      const { data, error } = await supabase
        .from('products')
        .upsert(productData, {
          onConflict: 'sku'
        })
        .select()

      if (error) {
        console.error(`Error creating product ${product.name}:`, error)
      } else {
        console.log(`✅ Product created: ${product.name} for ${tenant.slug}`)
      }
    }
  }

  // Verify products were created
  const { data: allProducts } = await supabase
    .from('products')
    .select(`
      name,
      name_ar,
      price,
      tenant:tenants(slug)
    `)
    .eq('is_active', true)

  console.log('\n📦 All products in database:')
  allProducts?.forEach(product => {
    console.log(`  - ${product.name} (${product.name_ar}) - ${product.price/100} DZD - ${product.tenant?.slug}`)
  })

  process.exit(0)
}

createTestProducts()