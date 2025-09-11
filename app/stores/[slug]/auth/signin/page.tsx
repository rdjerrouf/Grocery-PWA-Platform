import { notFound } from 'next/navigation';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { SignInForm } from '@/components/auth/SignInForm';
import { getTenantBySlug, getCategoriesByTenant } from '@/lib/supabase/queries';

interface SignInPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    locale?: 'fr' | 'ar';
    redirect?: string;
  };
}

export default async function SignInPage({ params, searchParams }: SignInPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolvedSearchParams.locale || 'fr';
  const redirectTo = resolvedSearchParams.redirect;

  // Get tenant and validate
  const tenant = await getTenantBySlug(slug);
  if (!tenant) {
    notFound();
  }

  // Get categories for sidebar
  const categories = await getCategoriesByTenant(tenant.id);

  return (
    <StoreLayout tenant={tenant} categories={categories} locale={locale}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className={`text-center mb-8 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            <h1 className="text-2xl font-bold mb-2">
              {locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ar' 
                ? 'ادخل إلى حسابك للمتابعة' 
                : 'Connectez-vous à votre compte pour continuer'}
            </p>
          </div>

          <SignInForm 
            tenantSlug={slug}
            locale={locale}
            redirectTo={redirectTo}
          />

          <div className={`text-center mt-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-sm text-muted-foreground">
              {locale === 'ar' ? 'ليس لديك حساب؟' : 'Pas encore de compte ?'}{' '}
              <a 
                href={`/stores/${slug}/auth/signup?locale=${locale}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="text-primary hover:underline font-medium"
              >
                {locale === 'ar' ? 'إنشاء حساب' : 'Créer un compte'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}