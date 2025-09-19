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

  // Handle admin routes - TEMPORARILY DISABLED AUTH FOR SETUP
  if (path.includes('/admin')) {
    // TODO: Re-enable authentication after creating admin user
    // const session = await getSession(request, response)
    // if (!session) { ... }
    // For now, allow access to admin panel for initial setup
    console.log('Admin access granted for initial setup')
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