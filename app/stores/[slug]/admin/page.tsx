import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StoreAdminDashboard } from '@/components/store-admin/StoreAdminDashboard'
import { StoreAdminLayout } from '@/components/store-admin/StoreAdminLayout'

interface StoreAdminPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    locale?: 'fr' | 'ar'
  }>
}

export default async function StoreAdminPage({ params, searchParams }: StoreAdminPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const locale = (resolvedSearchParams.locale || 'ar') as 'fr' | 'ar'
  const supabase = createServerClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/stores/${resolvedParams.slug}/auth/signin?redirect=/stores/${resolvedParams.slug}/admin`)
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

  // If not a store admin and not global admin, redirect
  if (!storeAdmin) {
    // TODO: Check if user is global admin (you might want to add a global_admin flag to profiles)
    // For now, redirect to store page
    redirect(`/stores/${resolvedParams.slug}?locale=${locale}`)
  }

  return (
    <StoreAdminLayout tenant={tenant} locale={locale}>
      <StoreAdminDashboard tenant={tenant} locale={locale} />
    </StoreAdminLayout>
  )
}

export async function generateMetadata({ params, searchParams }: StoreAdminPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const locale = (resolvedSearchParams.locale || 'ar') as 'fr' | 'ar'

  return {
    title: locale === 'ar' ? 'لوحة تحكم المتجر' : 'Tableau de bord du magasin',
    description: locale === 'ar'
      ? 'إدارة متجرك والمنتجات والطلبات'
      : 'Gérez votre magasin, produits et commandes',
  }
}