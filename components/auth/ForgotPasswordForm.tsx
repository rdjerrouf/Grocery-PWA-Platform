'use client'

import { useState } from 'react'
import { forgotPassword } from '@/app/actions/auth'

interface ForgotPasswordFormProps {
  tenantSlug: string
  locale: 'fr' | 'ar'
  redirectTo?: string
}

export function ForgotPasswordForm({ tenantSlug, locale, redirectTo }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    // Add tenant and redirect info to form data
    formData.append('tenantSlug', tenantSlug)
    if (redirectTo) {
      formData.append('redirectTo', redirectTo)
    }

    try {
      const result = await forgotPassword(formData)
      if (result && !result.success) {
        setError(result.error || 'Une erreur est survenue')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const isRTL = locale === 'ar'

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {locale === 'ar' ? 'تم إرسال الرابط!' : 'Lien envoyé !'}
        </h3>
        <p className="text-muted-foreground text-sm">
          {locale === 'ar'
            ? 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور'
            : 'Vérifiez votre boîte e-mail pour le lien de réinitialisation du mot de passe'}
        </p>
      </div>
    )
  }

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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {locale === 'ar' ? 'جارٍ الإرسال...' : 'Envoi en cours...'}
          </div>
        ) : (
          locale === 'ar' ? 'إرسال رابط الاستعادة' : 'Envoyer le lien de récupération'
        )}
      </button>
    </form>
  )
}