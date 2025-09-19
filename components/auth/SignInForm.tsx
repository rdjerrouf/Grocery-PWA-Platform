'use client'

import { useState } from 'react'
import { signIn } from '@/app/actions/auth'

interface SignInFormProps {
  tenantSlug: string
  locale: 'fr' | 'ar'
  redirectTo?: string
}

export function SignInForm({ tenantSlug, locale, redirectTo }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    // Add tenant and redirect info to form data
    formData.append('tenantSlug', tenantSlug)
    if (redirectTo) {
      formData.append('redirectTo', redirectTo)
    }

    try {
      const result = await signIn(formData)
      if (result && !result.success) {
        setError(result.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const isRTL = locale === 'ar'

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {locale === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isLoading}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
            isRTL ? 'text-right' : 'text-left'
          }`}
          placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Entrez votre e-mail'}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          disabled={isLoading}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
            isRTL ? 'text-right' : 'text-left'
          }`}
          placeholder={locale === 'ar' ? 'أدخل كلمة المرور' : 'Entrez votre mot de passe'}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {locale === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Connexion en cours...'}
          </div>
        ) : (
          locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter'
        )}
      </button>

      <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
        <a
          href={`/stores/${tenantSlug}/auth/forgot-password?locale=${locale}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
        >
          {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
        </a>
      </div>
    </form>
  )
}