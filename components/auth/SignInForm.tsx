'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface SignInFormProps {
  tenantSlug: string;
  locale: 'fr' | 'ar';
  redirectTo?: string;
}

export function SignInForm({ tenantSlug, locale, redirectTo }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const isRTL = locale === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Redirect to intended page or store home
        const destination = redirectTo || `/stores/${tenantSlug}?locale=${locale}`;
        router.push(destination);
        router.refresh(); // Refresh to update auth state
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = locale === 'ar' 
        ? 'حدث خطأ أثناء تسجيل الدخول' 
        : 'Erreur lors de la connexion';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = locale === 'ar' 
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
          : 'Email ou mot de passe incorrect';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = locale === 'ar' 
          ? 'يرجى تأكيد بريدك الإلكتروني أولاً' 
          : 'Veuillez confirmer votre email d\'abord';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className={`text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Email Field */}
        <div>
          <label 
            htmlFor="email" 
            className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
          </label>
          <div className="relative">
            <Mail className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={locale === 'ar' ? 'your@email.com' : 'votre@email.com'}
              className={`
                w-full h-12 bg-secondary rounded-lg border border-border
                ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              required
              disabled={isLoading}
              dir="ltr" // Email is always LTR
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label 
            htmlFor="password" 
            className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {locale === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
          </label>
          <div className="relative">
            <Lock className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={locale === 'ar' ? '••••••••' : '••••••••'}
              className={`
                w-full h-12 bg-secondary rounded-lg border border-border
                ${isRTL ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'}
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              required
              disabled={isLoading}
              minLength={6}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-2' : 'right-2'} h-8 w-8`}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
          <a 
            href={`/stores/${tenantSlug}/auth/forgot-password?locale=${locale}`}
            className="text-sm text-primary hover:underline"
          >
            {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12"
          disabled={isLoading || !email.trim() || !password}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {locale === 'ar' ? 'جاري تسجيل الدخول...' : 'Connexion en cours...'}
            </>
          ) : (
            locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter'
          )}
        </Button>
      </form>
    </div>
  );
}