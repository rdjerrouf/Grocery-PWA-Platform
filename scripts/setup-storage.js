#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function setupStorage() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🗄️ Setting up storage buckets...')

  // Create product images bucket
  const { data: bucket, error: bucketError } = await supabase.storage
    .createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    })

  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('❌ Error creating product-images bucket:', bucketError.message)
  } else {
    console.log('✅ Product images bucket ready')
  }

  // Create category images bucket
  const { data: categoryBucket, error: categoryBucketError } = await supabase.storage
    .createBucket('category-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 2097152 // 2MB
    })

  if (categoryBucketError && !categoryBucketError.message.includes('already exists')) {
    console.error('❌ Error creating category-images bucket:', categoryBucketError.message)
  } else {
    console.log('✅ Category images bucket ready')
  }

  // List all buckets to verify
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('❌ Error listing buckets:', listError.message)
  } else {
    console.log('\n📦 Available storage buckets:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })
  }

  console.log('\n🎉 Storage setup completed!')
  process.exit(0)
}

setupStorage()