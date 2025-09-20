'use client'

import { useState } from 'react'
import { resetPassword } from '@/app/actions/auth'

interface ResetPasswordFormProps {
  tenantSlug: string
  locale: 'fr' | 'ar'
  redirectTo?: string
}

export function ResetPasswordForm({ tenantSlug, locale, redirectTo }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setFieldErrors({})

    // Add tenant and redirect info to form data
    formData.append('tenantSlug', tenantSlug)
    if (redirectTo) {
      formData.append('redirectTo', redirectTo)
    }

    try {
      const result = await resetPassword(formData)
      if (result && !result.success) {
        if (result.errors) {
          // Handle validation errors
          const newFieldErrors: Record<string, string> = {}
          result.errors.forEach((error: any) => {
            if (error.path && error.path[0]) {
              newFieldErrors[error.path[0]] = error.message
            }
          })
          setFieldErrors(newFieldErrors)
        } else {
          setError(result.error || 'Une erreur est survenue')
        }
      }
      // If successful, redirect will happen in the server action
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
          htmlFor="password"
          className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {locale === 'ar' ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          disabled={isLoading}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
            isRTL ? 'text-right' : 'text-left'
          } ${fieldErrors.password ? 'border-red-500' : ''}`}
          placeholder={locale === 'ar' ? 'أدخل كلمة المرور الجديدة (6 أحرف على الأقل)' : 'Entrez votre nouveau mot de passe (min. 6 caractères)'}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        {fieldErrors.password && (
          <p className="text-red-600 text-sm">{fieldErrors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {locale === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirmer le nouveau mot de passe'}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          disabled={isLoading}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
            isRTL ? 'text-right' : 'text-left'
          } ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
          placeholder={locale === 'ar' ? 'أعد إدخال كلمة المرور الجديدة' : 'Répétez votre nouveau mot de passe'}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        {fieldErrors.confirmPassword && (
          <p className="text-red-600 text-sm">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {locale === 'ar' ? 'جارٍ إعادة التعيين...' : 'Réinitialisation en cours...'}
          </div>
        ) : (
          locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Réinitialiser le mot de passe'
        )}
      </button>
    </form>
  )
}