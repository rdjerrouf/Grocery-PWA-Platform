import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createServerClient()

  // Get all active tenants
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('subdomain, name_fr, name_ar, logo_url')
    .eq('is_active', true)
    .order('name_fr')

  // If there's only one tenant, redirect to it
  if (tenants && tenants.length === 1) {
    redirect(`/stores/${tenants[0].subdomain}`)
  }

  if (error || !tenants || tenants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DzMarket
          </h1>
          <p className="text-gray-600 mb-8">
            Algerian Local Marketplace Platform
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
            DzMarket
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            السوق المحلي الجزائري
          </p>
          <p className="text-lg text-gray-500">
            Choose your local grocery store
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Link
              key={tenant.subdomain}
              href={`/stores/${tenant.subdomain}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                {tenant.logo_url && (
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <img
                      src={tenant.logo_url}
                      alt={tenant.name_fr}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                )}
                <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  {tenant.name_fr}
                </h2>
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

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Powered by Supabase • Built with Next.js
          </p>
        </div>
      </div>
    </div>
  )
}