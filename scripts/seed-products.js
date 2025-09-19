const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...')

    // Get existing tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, slug, name')
      .eq('is_active', true)

    if (tenantsError) {
      throw new Error(`Error fetching tenants: ${tenantsError.message}`)
    }

    if (!tenants || tenants.length === 0) {
      console.log('❌ No active tenants found. Please create tenants first.')
      return
    }

    console.log(`📍 Found ${tenants.length} tenants:`, tenants.map(t => t.slug))

    // Sample categories to create for each tenant
    const categoryTemplates = [
      {
        name: 'Fruits & Vegetables',
        name_ar: 'الفواكه والخضروات',
        name_fr: 'Fruits et Légumes',
        slug: 'fruits-vegetables',
        description: 'Fresh fruits and vegetables',
        display_order: 1
      },
      {
        name: 'Dairy & Eggs',
        name_ar: 'الألبان والبيض',
        name_fr: 'Produits Laitiers et Œufs',
        slug: 'dairy-eggs',
        description: 'Fresh dairy products and eggs',
        display_order: 2
      },
      {
        name: 'Meat & Poultry',
        name_ar: 'اللحوم والدواجن',
        name_fr: 'Viande et Volaille',
        slug: 'meat-poultry',
        description: 'Fresh meat and poultry',
        display_order: 3
      },
      {
        name: 'Bakery',
        name_ar: 'المخبوزات',
        name_fr: 'Boulangerie',
        slug: 'bakery',
        description: 'Fresh bread and baked goods',
        display_order: 4
      }
    ]

    // Create categories for each tenant
    for (const tenant of tenants) {
      console.log(`📂 Creating categories for ${tenant.name}...`)

      const categoriesToInsert = categoryTemplates.map(template => ({
        ...template,
        tenant_id: tenant.id,
        is_active: true
      }))

      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .upsert(categoriesToInsert, {
          onConflict: 'tenant_id,slug',
          ignoreDuplicates: false
        })
        .select()

      if (categoriesError) {
        console.error(`❌ Error creating categories for ${tenant.name}:`, categoriesError.message)
        continue
      }

      console.log(`✅ Created ${categoriesToInsert.length} categories for ${tenant.name}`)

      // Get the created categories to use their IDs
      const { data: createdCategories } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('tenant_id', tenant.id)

      const categoryMap = {}
      createdCategories?.forEach(cat => {
        categoryMap[cat.slug] = cat.id
      })

      // Sample products for each category
      const productTemplates = [
        // Fruits & Vegetables
        {
          category_slug: 'fruits-vegetables',
          name: 'Fresh Apples',
          name_ar: 'تفاح طازج',
          name_fr: 'Pommes Fraîches',
          description: 'Crisp and sweet red apples',
          description_ar: 'تفاح أحمر طازج ومقرمش',
          description_fr: 'Pommes rouges croquantes et sucrées',
          price: 250.00,
          stock_quantity: 50,
          unit: 'kg',
          weight: 1000,
          is_featured: true
        },
        {
          category_slug: 'fruits-vegetables',
          name: 'Fresh Bananas',
          name_ar: 'موز طازج',
          name_fr: 'Bananes Fraîches',
          description: 'Ripe yellow bananas',
          description_ar: 'موز أصفر ناضج',
          description_fr: 'Bananes jaunes mûres',
          price: 180.00,
          stock_quantity: 75,
          unit: 'kg',
          weight: 1000,
          is_featured: true
        },
        {
          category_slug: 'fruits-vegetables',
          name: 'Fresh Tomatoes',
          name_ar: 'طماطم طازجة',
          name_fr: 'Tomates Fraîches',
          description: 'Red ripe tomatoes',
          description_ar: 'طماطم حمراء ناضجة',
          description_fr: 'Tomates rouges mûres',
          price: 220.00,
          stock_quantity: 40,
          unit: 'kg',
          weight: 1000,
          is_featured: false
        },
        // Dairy & Eggs
        {
          category_slug: 'dairy-eggs',
          name: 'Fresh Milk',
          name_ar: 'حليب طازج',
          name_fr: 'Lait Frais',
          description: 'Fresh whole milk 1L',
          description_ar: 'حليب كامل طازج 1 لتر',
          description_fr: 'Lait entier frais 1L',
          price: 150.00,
          stock_quantity: 30,
          unit: 'liter',
          weight: 1000,
          is_featured: true
        },
        {
          category_slug: 'dairy-eggs',
          name: 'Fresh Eggs',
          name_ar: 'بيض طازج',
          name_fr: 'Œufs Frais',
          description: 'Farm fresh eggs (12 pieces)',
          description_ar: 'بيض مزرعة طازج (12 حبة)',
          description_fr: 'Œufs de ferme frais (12 pièces)',
          price: 320.00,
          stock_quantity: 25,
          unit: 'dozen',
          weight: 720,
          is_featured: false
        },
        // Meat & Poultry
        {
          category_slug: 'meat-poultry',
          name: 'Fresh Chicken Breast',
          name_ar: 'صدر دجاج طازج',
          name_fr: 'Blanc de Poulet Frais',
          description: 'Boneless chicken breast',
          description_ar: 'صدر دجاج بدون عظم',
          description_fr: 'Blanc de poulet désossé',
          price: 850.00,
          stock_quantity: 15,
          unit: 'kg',
          weight: 1000,
          is_featured: false
        },
        // Bakery
        {
          category_slug: 'bakery',
          name: 'French Baguette',
          name_ar: 'باغيت فرنسي',
          name_fr: 'Baguette Française',
          description: 'Fresh baked French baguette',
          description_ar: 'باغيت فرنسي مخبوز طازج',
          description_fr: 'Baguette française fraîchement cuite',
          price: 80.00,
          stock_quantity: 20,
          unit: 'piece',
          weight: 250,
          is_featured: false
        }
      ]

      // Create products for this tenant
      console.log(`🛍️ Creating products for ${tenant.name}...`)

      const productsToInsert = productTemplates.map(template => {
        const { category_slug, ...productData } = template
        return {
          ...productData,
          tenant_id: tenant.id,
          category_id: categoryMap[category_slug],
          is_active: true
        }
      }).filter(product => product.category_id) // Only include products with valid category_id

      if (productsToInsert.length > 0) {
        const { error: productsError } = await supabase
          .from('products')
          .insert(productsToInsert)

        if (productsError) {
          console.error(`❌ Error creating products for ${tenant.name}:`, productsError.message)
          continue
        }

        console.log(`✅ Created ${productsToInsert.length} products for ${tenant.name}`)
      }
    }

    console.log('🎉 Product seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error during seeding:', error.message)
    process.exit(1)
  }
}

// Run the seeding function
seedProducts().then(() => {
  console.log('✨ Seeding process finished')
  process.exit(0)
})