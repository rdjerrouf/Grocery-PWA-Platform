'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, LogOut, Settings, ShoppingBag } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'

interface UserMenuProps {
  tenantSlug: string
  locale: 'fr' | 'ar'
}

interface UserProfile {
  id: string
  name: string
  email?: string
}

export function UserMenu({ tenantSlug, locale }: UserMenuProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const isRTL = locale === 'ar'

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', session.user.id)
          .single()

        setUser({
          id: session.user.id,
          name: profile?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email
        })
      }
      setIsLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (event === 'SIGNED_IN' && session?.user) {
        checkUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut()
    setUser(null)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="inline-flex items-center justify-center rounded-lg h-10 w-10 bg-white/20 animate-pulse">
        <User className="w-5 h-5" />
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href={`/stores/${tenantSlug}/auth/signin?locale=${locale}`}
        className="bg-white/20 hover:bg-white/30 inline-flex items-center justify-center rounded-lg h-10 px-4 text-sm font-medium transition-colors"
      >
        {locale === 'ar' ? 'دخول' : 'Connexion'}
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="inline-flex items-center justify-center rounded-lg h-10 w-10 hover:bg-white/20 transition-colors"
      >
        <User className="w-5 h-5" />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className={`absolute top-12 z-20 w-64 bg-white rounded-lg shadow-lg border ${isRTL ? 'left-0' : 'right-0'}`}>
            <div className="p-4 border-b">
              <p className="font-medium text-gray-900">{user.name}</p>
              {user.email && (
                <p className="text-sm text-gray-500">{user.email}</p>
              )}
            </div>

            <div className="p-2">
              <Link
                href={`/stores/${tenantSlug}/profile?locale=${locale}`}
                className={`flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>{locale === 'ar' ? 'الملف الشخصي' : 'Profil'}</span>
              </Link>

              <Link
                href={`/stores/${tenantSlug}/orders?locale=${locale}`}
                className={`flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
                onClick={() => setIsDropdownOpen(false)}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{locale === 'ar' ? 'طلباتي' : 'Mes commandes'}</span>
              </Link>

              <hr className="my-2" />

              <button
                onClick={handleSignOut}
                className={`w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Se déconnecter'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}