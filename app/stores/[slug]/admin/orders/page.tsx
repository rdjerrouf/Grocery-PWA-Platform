import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StoreAdminLayout } from '@/components/store-admin/StoreAdminLayout'
import { StoreOrdersList } from '@/components/store-admin/StoreOrdersList'

interface StoreOrdersPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    locale?: 'fr' | 'ar'
    status?: string
  }>
}

export default async function StoreOrdersPage({ params, searchParams }: StoreOrdersPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const locale = (resolvedSearchParams.locale || 'ar') as 'fr' | 'ar'
  const statusFilter = resolvedSearchParams.status
  const supabase = createServerClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/stores/${resolvedParams.slug}/auth/signin?redirect=/stores/${resolvedParams.slug}/admin/orders`)
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

  // Check if user is authorized to access this store's admin
  const { data: storeAdmin } = await supabase
    .from('store_admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .single()

  if (!storeAdmin) {
    redirect(`/stores/${resolvedParams.slug}?locale=${locale}`)
  }

  // Get orders for this store
  let ordersQuery = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        product_name
      )
    `)
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    ordersQuery = ordersQuery.eq('status', statusFilter)
  }

  const { data: orders } = await ordersQuery

  return (
    <StoreAdminLayout tenant={tenant} locale={locale}>
      <StoreOrdersList
        orders={orders || []}
        tenant={tenant}
        locale={locale}
        statusFilter={statusFilter}
      />
    </StoreAdminLayout>
  )
}

export async function generateMetadata({ params, searchParams }: StoreOrdersPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const locale = (resolvedSearchParams.locale || 'ar') as 'fr' | 'ar'

  return {
    title: locale === 'ar' ? 'إدارة الطلبات' : 'Gestion des commandes',
    description: locale === 'ar'
      ? 'إدارة طلبات العملاء ومتابعة حالة التوصيل'
      : 'Gérez les commandes des clients et suivez le statut de livraison',
  }
}