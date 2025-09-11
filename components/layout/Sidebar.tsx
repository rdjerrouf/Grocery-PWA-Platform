'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ShoppingCart, 
  User, 
  Search,
  Menu,
  X,
  LogIn,
  UserPlus,
  Heart,
  Package,
  Settings
} from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import type { Category, Tenant } from '@/lib/supabase/types';

interface SidebarProps {
  tenant: Tenant;
  categories: Category[];
  locale: 'fr' | 'ar';
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ tenant, categories, locale, isOpen, onToggle }: SidebarProps) {
  const { items } = useCartStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Mock user state - will be replaced with real auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const isRTL = locale === 'ar';

  const navigationItems = [
    {
      icon: Home,
      label: locale === 'ar' ? 'الرئيسية' : 'Accueil',
      href: `/stores/${tenant.slug}?locale=${locale}`,
    },
    {
      icon: Search,
      label: locale === 'ar' ? 'البحث' : 'Recherche',
      href: `/stores/${tenant.slug}/search?locale=${locale}`,
    },
    {
      icon: ShoppingCart,
      label: locale === 'ar' ? 'السلة' : 'Panier',
      href: `/stores/${tenant.slug}/cart?locale=${locale}`,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
  ];

  const userItems = isAuthenticated ? [
    {
      icon: User,
      label: locale === 'ar' ? 'الملف الشخصي' : 'Profil',
      href: `/stores/${tenant.slug}/profile?locale=${locale}`,
    },
    {
      icon: Package,
      label: locale === 'ar' ? 'طلباتي' : 'Mes commandes',
      href: `/stores/${tenant.slug}/orders?locale=${locale}`,
    },
    {
      icon: Heart,
      label: locale === 'ar' ? 'المفضلة' : 'Favoris',
      href: `/stores/${tenant.slug}/wishlist?locale=${locale}`,
    },
    {
      icon: Settings,
      label: locale === 'ar' ? 'الإعدادات' : 'Paramètres',
      href: `/stores/${tenant.slug}/settings?locale=${locale}`,
    },
  ] : [
    {
      icon: LogIn,
      label: locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter',
      href: `/stores/${tenant.slug}/auth/signin?locale=${locale}`,
    },
    {
      icon: UserPlus,
      label: locale === 'ar' ? 'إنشاء حساب' : 'Créer un compte',
      href: `/stores/${tenant.slug}/auth/signup?locale=${locale}`,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full bg-card border-r border-border
          w-80 transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
          md:${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
        `}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {tenant.logo_url && (
                <img 
                  src={tenant.logo_url} 
                  alt={locale === 'ar' ? (tenant.name_ar || tenant.name) : tenant.name}
                  className="w-8 h-8 rounded object-cover"
                />
              )}
              <h2 className="font-semibold text-lg truncate">
                {locale === 'ar' ? (tenant.name_ar || tenant.name) : tenant.name}
              </h2>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggle}
              className="md:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            {/* Main Navigation */}
            <div className="p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onToggle}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                        hover:bg-secondary transition-colors w-full
                        ${isRTL ? 'text-right' : 'text-left'}
                      `}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="px-4 pb-4">
                <h3 className={`font-medium text-sm text-muted-foreground mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {locale === 'ar' ? 'الفئات' : 'Catégories'}
                </h3>
                <ul className="space-y-1">
                  {categories.map((category) => {
                    const categoryName = locale === 'ar' ? 
                      (category.name_ar || category.name) : 
                      category.name;
                    
                    return (
                      <li key={category.id}>
                        <Link
                          href={`/stores/${tenant.slug}/category/${category.id}?locale=${locale}`}
                          onClick={onToggle}
                          className={`
                            block px-3 py-2 text-sm rounded-lg
                            hover:bg-secondary transition-colors
                            ${isRTL ? 'text-right' : 'text-left'}
                          `}
                        >
                          {categoryName}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* User Section */}
            <div className="border-t border-border p-4">
              <h3 className={`font-medium text-sm text-muted-foreground mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {locale === 'ar' ? 'الحساب' : 'Compte'}
              </h3>
              <ul className="space-y-2">
                {userItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onToggle}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                        hover:bg-secondary transition-colors w-full
                        ${isRTL ? 'text-right' : 'text-left'}
                      `}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Info (if authenticated) */}
            {isAuthenticated && user && (
              <div className="border-t border-border p-4">
                <div className={`flex items-center gap-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => {
                    setIsAuthenticated(false);
                    setUser(null);
                  }}
                >
                  {locale === 'ar' ? 'تسجيل الخروج' : 'Se déconnecter'}
                </Button>
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}