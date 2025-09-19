const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Create sample tenants
    console.log('📝 Creating sample tenants...')
    const tenants = [
      {
        slug: 'ahmed-grocery',
        name: 'Ahmed Grocery Store',
        name_fr: 'Épicerie Ahmed',
        name_ar: 'بقالة أحمد',
        primary_color: '#10B981',
        contact_phone: '+213 555 123 456',
        contact_email: 'contact@ahmedgrocery.dz',
        address: 'Rue des Martyrs, Alger Centre, Alger',
        delivery_fee: 200,
        minimum_order: 1000,
        currency: 'DZD',
        is_active: true
      },
      {
        slug: 'superette-bab-ezzouar',
        name: 'Superette Bab Ezzouar',
        name_fr: 'Superette Bab Ezzouar',
        name_ar: 'سوبرماركت باب الزوار',
        primary_color: '#3B82F6',
        contact_phone: '+213 555 987 654',
        contact_email: 'info@superettebz.dz',
        address: 'Cité 20 Août, Bab Ezzouar, Alger',
        delivery_fee: 150,
        minimum_order: 800,
        currency: 'DZD',
        is_active: true
      }
    ]

    const { data: createdTenants, error: tenantsError } = await supabase
      .from('tenants')
      .insert(tenants)
      .select()

    if (tenantsError) {
      console.error('❌ Error creating tenants:', tenantsError)
      return
    }

    console.log(`✅ Created ${createdTenants.length} tenants`)

    // 2. Create categories for each tenant
    console.log('📂 Creating categories...')
    const categories = []

    createdTenants.forEach(tenant => {
      const tenantCategories = [
        {
          tenant_id: tenant.id,
          name: 'Fruits & Vegetables',
          name_fr: 'Fruits et Légumes',
          name_ar: 'الفواكه والخضروات',
          slug: 'fruits-vegetables',
          display_order: 1,
          is_active: true
        },
        {
          tenant_id: tenant.id,
          name: 'Dairy Products',
          name_fr: 'Produits Laitiers',
          name_ar: 'منتجات الألبان',
          slug: 'dairy',
          display_order: 2,
          is_active: true
        },
        {
          tenant_id: tenant.id,
          name: 'Meat & Poultry',
          name_fr: 'Viande et Volaille',
          name_ar: 'اللحوم والدواجن',
          slug: 'meat-poultry',
          display_order: 3,
          is_active: true
        },
        {
          tenant_id: tenant.id,
          name: 'Bakery',
          name_fr: 'Boulangerie',
          name_ar: 'المخبزة',
          slug: 'bakery',
          display_order: 4,
          is_active: true
        },
        {
          tenant_id: tenant.id,
          name: 'Beverages',
          name_fr: 'Boissons',
          name_ar: 'المشروبات',
          slug: 'beverages',
          display_order: 5,
          is_active: true
        }
      ]
      categories.push(...tenantCategories)
    })

    const { data: createdCategories, error: categoriesError } = await supabase
      .from('categories')
      .insert(categories)
      .select()

    if (categoriesError) {
      console.error('❌ Error creating categories:', categoriesError)
      return
    }

    console.log(`✅ Created ${createdCategories.length} categories`)

    // 3. Create sample products
    console.log('🛒 Creating sample products...')
    const products = []

    createdTenants.forEach(tenant => {
      const tenantCategories = createdCategories.filter(cat => cat.tenant_id === tenant.id)

      // Sample products for each category
      const sampleProducts = [
        // Fruits & Vegetables
        {
          tenant_id: tenant.id,
          category_id: tenantCategories.find(cat => cat.slug === 'fruits-vegetables')?.id,
          sku: 'FV001',
          name: 'Fresh Tomatoes',
          name_fr: 'Tomates Fraîches',
          name_ar: 'طماطم طازجة',
          description: 'Fresh local tomatoes, perfect for salads and cooking',
          description_fr: 'Tomates locales fraîches, parfaites pour les salades et la cuisine',
          description_ar: 'طماطم محلية طازجة، مثالية للسلطات والطبخ',
          price: 150,
          stock_quantity: 100,
          unit: 'kg',
          is_featured: true,
          is_active: true
        },
        {
          tenant_id: tenant.id,
          category_id: tenantCategories.find(cat => cat.slug === 'fruits-vegetables')?.id,
          sku: 'FV002',
          name: 'Fresh Apples',
          name_fr: 'Pommes Fraîches',
          name_ar: 'تفاح طازج',
          description: 'Crispy red apples, imported quality',
          description_fr: 'Pommes rouges croquantes, qualité importée',
          description_ar: 'تفاح أحمر مقرمش، جودة مستوردة',
          price: 280,
          stock_quantity: 80,
          unit: 'kg',
          is_featured: true,
          is_active: true
        },
        // Dairy Products
        {
          tenant_id: tenant.id,
          category_id: tenantCategories.find(cat => cat.slug === 'dairy')?.id,
          sku: 'DP001',
          name: 'Fresh Milk',
          name_fr: 'Lait Frais',
          name_ar: 'حليب طازج',
          description: 'Fresh pasteurized milk, 1L bottle',
          description_fr: 'Lait pasteurisé frais, bouteille 1L',
          description_ar: 'حليب مبستر طازج، زجاجة 1 لتر',
          price: 120,
          stock_quantity: 50,
          unit: 'bottle',
          is_featured: true,
          is_active: true
        },
        // Meat & Poultry
        {
          tenant_id: tenant.id,
          category_id: tenantCategories.find(cat => cat.slug === 'meat-poultry')?.id,
          sku: 'MP001',
          name: 'Fresh Chicken',
          name_fr: 'Poulet Frais',
          name_ar: 'دجاج طازج',
          description: 'Fresh local chicken, cleaned and prepared',
          description_fr: 'Poulet local frais, nettoyé et préparé',
          description_ar: 'دجاج محلي طازج، منظف ومحضر',
          price: 450,
          stock_quantity: 30,
          unit: 'kg',
          is_featured: false,
          is_active: true
        },
        // Bakery
        {
          tenant_id: tenant.id,
          category_id: tenantCategories.find(cat => cat.slug === 'bakery')?.id,
          sku: 'BK001',
          name: 'Fresh Bread',
          name_fr: 'Pain Frais',
          name_ar: 'خبز طازج',
          description: 'Traditional Algerian bread, baked daily',
          description_fr: 'Pain traditionnel algérien, cuit quotidiennement',
          description_ar: 'خبز جزائري تقليدي، مخبوز يومياً',
          price: 25,
          stock_quantity: 200,
          unit: 'piece',
          is_featured: false,
          is_active: true
        },
        // Beverages
        {
          tenant_id: tenant.id,
          category_id: tenantCategories.find(cat => cat.slug === 'beverages')?.id,
          sku: 'BV001',
          name: 'Mineral Water',
          name_fr: 'Eau Minérale',
          name_ar: 'مياه معدنية',
          description: 'Natural mineral water, 1.5L bottle',
          description_fr: 'Eau minérale naturelle, bouteille 1,5L',
          description_ar: 'مياه معدنية طبيعية، زجاجة 1.5 لتر',
          price: 80,
          stock_quantity: 120,
          unit: 'bottle',
          is_featured: false,
          is_active: true
        }
      ]

      products.push(...sampleProducts)
    })

    const { data: createdProducts, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (productsError) {
      console.error('❌ Error creating products:', productsError)
      return
    }

    console.log(`✅ Created ${createdProducts.length} products`)

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📍 You can now visit:')
    console.log('• Homepage: http://localhost:3000')
    console.log('• Ahmed Grocery: http://localhost:3000/stores/ahmed-grocery')
    console.log('• Superette Bab Ezzouar: http://localhost:3000/stores/superette-bab-ezzouar')
    console.log('• Admin Panel: http://localhost:3000/admin')

  } catch (error) {
    console.error('💥 Seeding failed:', error)
  }
}

// Run the seeding function
seedDatabase()