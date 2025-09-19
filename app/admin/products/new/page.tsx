import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewProductPage() {
  const supabase = createServerClient()

  // TODO: Re-enable authentication after setting up admin user
  // Check if user is authenticated
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) {
  //   redirect('/auth/signin')
  // }

  // Fetch tenants and categories for the form
  const [tenantsResult, categoriesResult] = await Promise.all([
    supabase.from('tenants').select('id, name, slug').eq('is_active', true),
    supabase.from('categories').select('id, name, name_ar, name_fr').eq('is_active', true)
  ])

  const tenants = tenantsResult.data || []
  const categories = categoriesResult.data || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/products"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Products
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Add New Product</h1>
          <p className="mt-2 text-gray-600">Create a new product for your grocery store</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <ProductForm
            tenants={tenants}
            categories={categories}
          />
        </div>
      </div>
    </div>
  )
}