import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createServerClient()

  // Get all active tenants
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('slug, name, name_fr, name_ar, primary_color')
    .eq('is_active', true)
    .order('name')

  // If there's only one tenant, redirect to it
  if (tenants && tenants.length === 1) {
    redirect(`/stores/${tenants[0].slug}`)
  }

  if (error || !tenants || tenants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Grocery Platform
          </h1>
          <p className="text-gray-600 mb-8">
            Multi-tenant Grocery PWA Platform
          </p>
          <p className="text-gray-500">
            No stores are currently available.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Multi-Tenant Grocery Platform
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            منصة البقالة متعددة المستأجرين
          </p>
          <p className="text-lg text-gray-500">
            Choose your local grocery store
          </p>
        </div>

        {/* Demo Store Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Demo Store</h2>
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">Ahmed Grocery Store</p>
            <p className="text-gray-600 mb-6">Experience our platform with this demo store</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/stores/ahmed-grocery?locale=fr"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View in French
              </Link>
              <Link
                href="/stores/ahmed-grocery?locale=ar"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View in Arabic
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Tenant</h3>
            <p className="text-gray-600">Support multiple independent grocery stores with isolated data</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Bilingual</h3>
            <p className="text-gray-600">Full support for Arabic (RTL) and French languages</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">PWA Ready</h3>
            <p className="text-gray-600">Progressive Web App capabilities for mobile experience</p>
          </div>
        </div>

        {/* All Stores Section */}
        {tenants.length > 1 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">All Available Stores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {tenants.map((tenant) => (
                <Link
                  key={tenant.slug}
                  href={`/stores/${tenant.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: tenant.primary_color }}>
                      <span className="text-white text-xl font-bold">
                        {tenant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                      {tenant.name}
                    </h3>
                    {tenant.name_fr && tenant.name_fr !== tenant.name && (
                      <p className="text-gray-600 text-center text-sm mb-1">
                        {tenant.name_fr}
                      </p>
                    )}
                    {tenant.name_ar && (
                      <p className="text-gray-600 text-center text-lg" dir="rtl">
                        {tenant.name_ar}
                      </p>
                    )}
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Visit Store
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Powered by Supabase • Built with Next.js
          </p>
        </div>
      </div>
    </div>
  )
}