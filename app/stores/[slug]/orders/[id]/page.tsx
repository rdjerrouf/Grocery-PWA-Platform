import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { OrderDetails } from '@/components/shop/OrderDetails'
import { getTranslations } from 'next-intl/server'

interface OrderDetailPageProps {
  params: {
    slug: string
    id: string
  }
  searchParams: {
    locale?: 'fr' | 'ar'
    success?: string
  }
}

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const locale = (searchParams.locale || 'ar') as 'fr' | 'ar'
  const t = await getTranslations('orders')
  const supabase = createServerClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/stores/${params.slug}/auth/signin?redirect=/stores/${params.slug}/orders/${params.id}`)
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

  // Get order details
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        product_name,
        products (
          id,
          name,
          name_ar,
          name_fr,
          image_url
        )
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .eq('tenant_id', tenant.id)
    .single()

  if (error || !order) {
    notFound()
  }

  const isRTL = locale === 'ar'
  const showSuccessMessage = searchParams.success === 'true'

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {showSuccessMessage && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {locale === 'ar' ? 'تم إنشاء الطلب بنجاح!' : 'Commande créée avec succès !'}
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      {locale === 'ar' 
                        ? 'سيتم الاتصال بك قريباً لتأكيد الطلب وتحديد موعد التوصيل.'
                        : 'Vous serez contacté prochainement pour confirmer la commande et planifier la livraison.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <OrderDetails
            order={order}
            tenant={tenant}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params, searchParams }: OrderDetailPageProps) {
  const locale = (searchParams.locale || 'ar') as 'fr' | 'ar'
  
  return {
    title: locale === 'ar' ? `تفاصيل الطلب #${params.id.slice(-8)}` : `Commande #${params.id.slice(-8)}`,
    description: locale === 'ar' 
      ? 'تفاصيل الطلب ومتابعة حالة التوصيل'
      : 'Détails de la commande et suivi du statut de livraison',
  }
}