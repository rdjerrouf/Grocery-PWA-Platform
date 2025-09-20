import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrdersList } from '@/components/shop/OrdersList'
import { getTranslations } from 'next-intl/server'

interface OrdersPageProps {
  params: {
    slug: string
  }
  searchParams: {
    locale?: 'fr' | 'ar'
  }
}

export default async function OrdersPage({ params, searchParams }: OrdersPageProps) {
  const locale = (searchParams.locale || 'ar') as 'fr' | 'ar'
  const t = await getTranslations('orders')
  const supabase = createServerClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/stores/${params.slug}/auth/signin?redirect=/stores/${params.slug}/orders`)
  }

  // Get tenant information
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!tenant) {
    redirect('/')
  }

  // Get user's orders for this tenant
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      payment_status,
      total,
      created_at,
      order_items (
        id,
        quantity,
        product_name
      )
    `)
    .eq('user_id', user.id)
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  const isRTL = locale === 'ar'

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {locale === 'ar' ? 'طلباتي' : 'Mes commandes'}
          </h1>

          <OrdersList
            orders={orders || []}
            tenantSlug={params.slug}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params, searchParams }: OrdersPageProps) {
  const locale = (searchParams.locale || 'ar') as 'fr' | 'ar'
  
  return {
    title: locale === 'ar' ? 'طلباتي' : 'Mes commandes',
    description: locale === 'ar' 
      ? 'تتبع حالة طلباتك وسجل المشتريات'
      : 'Suivez le statut de vos commandes et votre historique d\'achats',
  }
}