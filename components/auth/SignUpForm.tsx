'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface SignUpFormProps {
  tenantSlug: string;
  locale: 'fr' | 'ar';
  redirectTo?: string;
}

export function SignUpForm({ tenantSlug, locale, redirectTo }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const isRTL = locale === 'ar';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      return locale === 'ar' ? 'الاسم الأول مطلوب' : 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      return locale === 'ar' ? 'اسم العائلة مطلوب' : 'Le nom de famille est requis';
    }
    if (!formData.email.trim()) {
      return locale === 'ar' ? 'البريد الإلكتروني مطلوب' : 'L\'email est requis';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return locale === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Email invalide';
    }
    if (formData.password.length < 6) {
      return locale === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      return locale === 'ar' ? 'كلمتا المرور غير متطابقتان' : 'Les mots de passe ne correspondent pas';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            phone: formData.phone.trim(),
            locale: locale,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setSuccess(true);
        // Note: User might need to confirm email before signing in
        if (data.user.email_confirmed_at) {
          // Auto sign in was successful
          const destination = redirectTo || `/stores/${tenantSlug}?locale=${locale}`;
          router.push(destination);
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = locale === 'ar' 
        ? 'حدث خطأ أثناء إنشاء الحساب' 
        : 'Erreur lors de la création du compte';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = locale === 'ar' 
          ? 'هذا البريد الإلكتروني مسجل بالفعل' 
          : 'Cet email est déjà enregistré';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = locale === 'ar' 
          ? 'كلمة المرور قصيرة جداً' 
          : 'Mot de passe trop court';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className={`text-green-700 ${isRTL ? 'text-right' : 'text-left'}`}>
            {locale === 'ar' 
              ? 'تم إنشاء حسابك بنجاح! تحقق من بريدك الإلكتروني للتأكيد.' 
              : 'Compte créé avec succès ! Vérifiez votre email pour confirmation.'}
          </p>
        </div>
        <Button
          onClick={() => router.push(`/stores/${tenantSlug}/auth/signin?locale=${locale}`)}
          className="w-full"
        >
          {locale === 'ar' ? 'الذهاب لتسجيل الدخول' : 'Aller à la connexion'}
        </Button>
      </div>
    );
  }

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
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="firstName" 
              className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {locale === 'ar' ? 'الاسم الأول' : 'Prénom'}
            </label>
            <div className="relative">
              <User className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder={locale === 'ar' ? 'أحمد' : 'Jean'}
                className={`
                  w-full h-12 bg-secondary rounded-lg border border-border
                  ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label 
              htmlFor="lastName" 
              className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {locale === 'ar' ? 'اسم العائلة' : 'Nom'}
            </label>
            <div className="relative">
              <User className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder={locale === 'ar' ? 'بن علي' : 'Dupont'}
                className={`
                  w-full h-12 bg-secondary rounded-lg border border-border
                  ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

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
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
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

        {/* Phone Field */}
        <div>
          <label 
            htmlFor="phone" 
            className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {locale === 'ar' ? 'رقم الهاتف (اختياري)' : 'Téléphone (optionnel)'}
          </label>
          <div className="relative">
            <Phone className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={locale === 'ar' ? '0555123456' : '0555123456'}
              className={`
                w-full h-12 bg-secondary rounded-lg border border-border
                ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'}
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              disabled={isLoading}
              dir="ltr" // Phone is always LTR
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
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
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

        {/* Confirm Password Field */}
        <div>
          <label 
            htmlFor="confirmPassword" 
            className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
          </label>
          <div className="relative">
            <Lock className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-2' : 'right-2'} h-8 w-8`}
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {locale === 'ar' ? 'جاري إنشاء الحساب...' : 'Création en cours...'}
            </>
          ) : (
            locale === 'ar' ? 'إنشاء حساب' : 'Créer un compte'
          )}
        </Button>
      </form>
    </div>
  );
}