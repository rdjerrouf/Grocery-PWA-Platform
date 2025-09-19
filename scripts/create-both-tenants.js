#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function createTenants() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const tenants = [
    {
      slug: 'ahmed-grocery',
      name: 'Ahmed Grocery Store',
      name_fr: 'Épicerie Ahmed',
      name_ar: 'بقالة أحمد',
      primary_color: '#10B981',
      delivery_fee: 200,
      minimum_order: 1000,
      currency: 'DZD',
      contact_phone: '+213 21 123 456',
      contact_email: 'contact@ahmed-grocery.dz',
      address: '123 Rue de la République, Alger',
      is_active: true
    },
    {
      slug: 'carrefour-alger',
      name: 'Carrefour Alger',
      name_fr: 'Carrefour Alger',
      name_ar: 'كارفور الجزائر',
      primary_color: '#E74C3C',
      delivery_fee: 300,
      minimum_order: 1500,
      currency: 'DZD',
      contact_phone: '+213 21 789 012',
      contact_email: 'info@carrefour-alger.dz',
      address: '456 Boulevard Mohamed V, Alger',
      is_active: true
    }
  ]

  console.log('Creating tenants...')

  for (const tenant of tenants) {
    console.log(`Creating tenant: ${tenant.name}`)

    const { data, error } = await supabase
      .from('tenants')
      .upsert(tenant, {
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error(`Error creating tenant ${tenant.name}:`, error)
    } else {
      console.log(`✅ Tenant created successfully: ${tenant.name}`)
    }
  }

  // Verify tenants were created
  const { data: allTenants, error: fetchError } = await supabase
    .from('tenants')
    .select('id, slug, name, name_ar')

  if (fetchError) {
    console.error('Error fetching tenants:', fetchError)
  } else {
    console.log('\n📍 All tenants in database:')
    allTenants.forEach(tenant => {
      console.log(`  - ${tenant.name} (${tenant.name_ar}) - /stores/${tenant.slug}`)
    })
  }

  process.exit(0)
}

createTenants()