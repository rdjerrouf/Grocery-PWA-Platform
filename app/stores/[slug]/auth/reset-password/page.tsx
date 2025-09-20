import { notFound } from 'next/navigation';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { getTenantBySlug, getCategoriesByTenant } from '@/lib/supabase/queries';

interface ResetPasswordPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    locale?: 'fr' | 'ar';
    redirect?: string;
  };
}

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
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
              {locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Réinitialiser le mot de passe'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ar'
                ? 'أدخل كلمة المرور الجديدة'
                : 'Entrez votre nouveau mot de passe'}
            </p>
          </div>

          <ResetPasswordForm
            tenantSlug={slug}
            locale={locale}
            redirectTo={redirectTo}
          />
        </div>
      </div>
    </StoreLayout>
  );
}