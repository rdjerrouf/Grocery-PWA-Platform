import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { SearchBar } from '@/components/shop/SearchBar';
import { ProductCard } from '@/components/shop/ProductCard';
import { getTenantBySlug, getCategoriesByTenant, searchProducts } from '@/lib/supabase/queries';
import { dbProductsToFrontend } from '@/lib/utils/product';

interface SearchPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    q?: string;
    locale?: 'fr' | 'ar';
  };
}

async function SearchResults({ tenantId, query, locale }: { tenantId: string; query: string; locale: 'fr' | 'ar' }) {
  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {locale === 'ar' 
            ? 'ابدأ بكتابة ما تبحث عنه...' 
            : 'Commencez à taper pour rechercher des produits...'}
        </p>
      </div>
    );
  }

  const searchResults = await searchProducts(tenantId, query, locale);
  const products = dbProductsToFrontend(searchResults);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">
          {locale === 'ar' 
            ? `لم يتم العثور على نتائج لـ "${query}"` 
            : `Aucun résultat trouvé pour "${query}"`}
        </p>
        <p className="text-sm text-muted-foreground">
          {locale === 'ar' 
            ? 'جرب كلمات مختلفة أو تصفح الفئات' 
            : 'Essayez avec d\'autres mots-clés ou parcourez les catégories'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className={`mb-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
        <p className="text-sm text-muted-foreground">
          {locale === 'ar' 
            ? `${products.length} منتج موجود لـ "${query}"` 
            : `${products.length} produit(s) trouvé(s) pour "${query}"`}
        </p>
      </div>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        data-testid="search-results"
      >
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolvedSearchParams.locale || 'fr';
  const query = resolvedSearchParams.q || '';

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
        {/* Page Header */}
        <div className={`mb-8 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
          <h1 className="text-2xl font-bold mb-4">
            {locale === 'ar' ? 'البحث عن المنتجات' : 'Recherche de produits'}
          </h1>
          
          {/* Search Bar */}
          <SearchBar 
            tenantSlug={slug}
            locale={locale}
            initialQuery={query}
            className="max-w-2xl"
          />
        </div>

        {/* Search Results */}
        <Suspense fallback={
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'جاري البحث...' : 'Recherche en cours...'}
            </p>
          </div>
        }>
          <SearchResults tenantId={tenant.id} query={query} locale={locale} />
        </Suspense>

        {/* Popular Categories */}
        {categories.length > 0 && (
          <section className="mt-16">
            <h2 className={`text-xl font-semibold mb-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
              {locale === 'ar' ? 'تصفح حسب الفئة' : 'Parcourir par catégorie'}
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const categoryName = locale === 'ar' ? 
                  (category.name_ar || category.name) : 
                  category.name;
                
                return (
                  <a
                    key={category.id}
                    href={`/stores/${slug}/category/${category.id}?locale=${locale}`}
                    className={`
                      bg-card border border-border rounded-lg p-4 text-center
                      hover:bg-secondary transition-colors
                      ${locale === 'ar' ? 'text-right' : 'text-left'}
                    `}
                  >
                    <span className="text-sm font-medium">{categoryName}</span>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </StoreLayout>
  );
}