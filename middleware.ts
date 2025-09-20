import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient, getSession, getUserProfile } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = await createMiddlewareSupabaseClient(request, response)

  // Extract tenant from URL path
  const path = request.nextUrl.pathname
  const storeMatch = path.match(/^\/stores\/([^\/]+)/)
  const tenantSlug = storeMatch ? storeMatch[1] : null

  // Handle auth routes
  if (path.includes('/auth/')) {
    const session = await getSession(request, response)

    // If user is already authenticated, redirect to store home
    if (session && tenantSlug) {
      const locale = request.nextUrl.searchParams.get('locale') || 'fr'
      return NextResponse.redirect(
        new URL(`/stores/${tenantSlug}?locale=${locale}`, request.url)
      )
    }
  }

  // Handle global admin routes
  if (path.startsWith('/admin') && !path.includes('/stores/')) {
    // TODO: Add global admin authentication
    // For now, allow access to global admin panel
    console.log('Global admin access granted')
  }

  // Handle store admin routes
  if (path.includes('/admin') && tenantSlug) {
    const session = await getSession(request, response)
    if (!session) {
      return NextResponse.redirect(
        new URL(`/stores/${tenantSlug}/auth/signin?redirect=${encodeURIComponent(path)}`, request.url)
      )
    }

    // Check if user is authorized to access this store's admin
    const { data: storeAdmin } = await supabase
      .from('store_admins')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('tenant_id', response.headers.get('x-tenant-id'))
      .eq('is_active', true)
      .single()

    if (!storeAdmin) {
      // User is not authorized for this store's admin
      return NextResponse.redirect(new URL(`/stores/${tenantSlug}`, request.url))
    }

    // Set store admin permissions in headers for use in components
    response.headers.set('x-store-admin-role', storeAdmin.role)
    response.headers.set('x-store-admin-permissions', JSON.stringify(storeAdmin.permissions))
  }

  // Validate tenant exists for store routes
  if (tenantSlug && !path.includes('/auth/')) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, is_active')
      .eq('slug', tenantSlug)
      .eq('is_active', true)
      .single()

    if (!tenant) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Set tenant ID in headers for server components
    response.headers.set('x-tenant-id', tenant.id)
    response.headers.set('x-tenant-slug', tenantSlug)
  }

  return response
}

export const config = {
  matcher: [
    '/stores/:path*',
    '/admin',
    '/admin/:path*',
  ],
}