import { notFound } from 'next/navigation';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { getTenantBySlug, getCategoriesByTenant } from '@/lib/supabase/queries';

interface ConfirmEmailPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    locale?: 'fr' | 'ar';
  };
}

export default async function ConfirmEmailPage({ params, searchParams }: ConfirmEmailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolvedSearchParams.locale || 'fr';

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
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {locale === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Vérifiez votre e-mail'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ar'
                ? 'لقد أرسلنا رابط تأكيد إلى بريدك الإلكتروني'
                : 'Nous avons envoyé un lien de confirmation à votre adresse e-mail'}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-800">
              {locale === 'ar'
                ? 'يرجى فتح بريدك الإلكتروني والنقر على رابط التأكيد لإكمال إنشاء حسابك.'
                : 'Veuillez ouvrir votre boîte e-mail et cliquer sur le lien de confirmation pour terminer la création de votre compte.'
              }
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {locale === 'ar' ? 'لم تتلق الرسالة؟' : 'Vous n\'avez pas reçu l\'e-mail ?'}
            </p>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                {locale === 'ar'
                  ? '• تحقق من مجلد الرسائل غير المرغوب فيها'
                  : '• Vérifiez votre dossier spam'
                }
              </p>
              <p className="text-xs text-gray-500">
                {locale === 'ar'
                  ? '• تأكد من صحة عنوان البريد الإلكتروني'
                  : '• Vérifiez que l\'adresse e-mail est correcte'
                }
              </p>
            </div>

            <div className="pt-4">
              <a
                href={`/stores/${slug}/auth/signin?locale=${locale}`}
                className="text-blue-600 hover:text-blue-500 hover:underline text-sm font-medium"
              >
                {locale === 'ar' ? 'العودة إلى صفحة تسجيل الدخول' : 'Retour à la connexion'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}