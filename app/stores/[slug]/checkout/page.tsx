import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckoutForm } from '@/components/shop/CheckoutForm'
import { getTranslations } from 'next-intl/server'

interface CheckoutPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    locale?: 'fr' | 'ar'
  }>
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const locale = (resolvedSearchParams.locale || 'ar') as 'fr' | 'ar'
  const t = await getTranslations({ locale, namespace: 'checkout' })
  const supabase = createServerClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/stores/${resolvedParams.slug}/auth/signin?redirect=/stores/${resolvedParams.slug}/checkout`)
  }

  // Get tenant information
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('is_active', true)
    .single()

  if (!tenant) {
    redirect('/')
  }

  // Get user profile for pre-filling form
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get cart items for this tenant
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        name_ar,
        name_fr,
        price,
        image_url,
        unit,
        stock_quantity
      )
    `)
    .eq('user_id', user.id)
    .eq('tenant_id', tenant.id)

  if (!cartItems || cartItems.length === 0) {
    redirect(`/stores/${resolvedParams.slug}`)
  }

  const isRTL = locale === 'ar'

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {locale === 'ar' ? 'إتمام الطلب' : 'Finaliser la commande'}
          </h1>

          <CheckoutForm
            tenant={tenant}
            cartItems={cartItems}
            userProfile={profile}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params, searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = await searchParams
  const locale = (resolvedSearchParams.locale || 'ar') as 'fr' | 'ar'

  return {
    title: locale === 'ar' ? 'إتمام الطلب' : 'Finaliser la commande',
    description: locale === 'ar'
      ? 'راجع طلبك وأكمل عملية الشراء'
      : 'Vérifiez votre commande et finalisez votre achat',
  }
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#10B981',
  }
}