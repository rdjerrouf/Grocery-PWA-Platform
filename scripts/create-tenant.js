#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function createTenant() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase
    .from('tenants')
    .insert({
      slug: 'carrefour-alger',
      name: 'Carrefour Alger',
      name_fr: 'Carrefour Alger',
      name_ar: 'كارفور الجزائر',
      primary_color: '#E74C3C',
      delivery_fee: 300,
      minimum_order: 1500,
      currency: 'DZD',
      is_active: true
    })

  if (error) {
    console.error('Error creating tenant:', error)
  } else {
    console.log('Tenant created successfully:', data)
  }

  process.exit(0)
}

createTenant()