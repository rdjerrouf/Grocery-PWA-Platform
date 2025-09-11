import { notFound } from 'next/navigation';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { getTenantBySlug, getCategoriesByTenant } from '@/lib/supabase/queries';

interface SignUpPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    locale?: 'fr' | 'ar';
    redirect?: string;
  };
}

export default async function SignUpPage({ params, searchParams }: SignUpPageProps) {
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
              {locale === 'ar' ? 'إنشاء حساب' : 'Créer un compte'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ar' 
                ? 'أنشئ حسابك الجديد للبدء' 
                : 'Créez votre nouveau compte pour commencer'}
            </p>
          </div>

          <SignUpForm 
            tenantSlug={slug}
            locale={locale}
            redirectTo={redirectTo}
          />

          <div className={`text-center mt-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-sm text-muted-foreground">
              {locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Vous avez déjà un compte ?'}{' '}
              <a 
                href={`/stores/${slug}/auth/signin?locale=${locale}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="text-primary hover:underline font-medium"
              >
                {locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}