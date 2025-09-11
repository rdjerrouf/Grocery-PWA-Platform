'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import type { Tenant } from '@/lib/supabase/types';

interface HeaderProps {
  tenant: Tenant;
  locale: 'fr' | 'ar';
  onMenuToggle: () => void;
}

export function Header({ tenant, locale, onMenuToggle }: HeaderProps) {
  const { items } = useCartStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Mock user state - will be replaced with real auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const isRTL = locale === 'ar';
  const storeName = locale === 'ar' ? (tenant.name_ar || tenant.name) : tenant.name;

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Store Logo & Name */}
          <Link 
            href={`/stores/${tenant.slug}?locale=${locale}`}
            className="flex items-center gap-3 flex-shrink-0"
          >
            {tenant.logo_url && (
              <img 
                src={tenant.logo_url} 
                alt={storeName}
                className="w-8 h-8 rounded object-cover"
              />
            )}
            <h1 className="font-bold text-lg truncate hidden sm:block">
              {storeName}
            </h1>
          </Link>

          {/* Search Bar - Hidden on mobile, shown on larger screens */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={locale === 'ar' ? 'البحث عن منتجات...' : 'Rechercher des produits...'}
                className={`
                  w-full h-10 bg-secondary rounded-lg border border-border
                  ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                `}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Mobile Search Button */}
            <Link 
              href={`/stores/${tenant.slug}/search?locale=${locale}`}
              className="md:hidden inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Cart Button */}
            <Link 
              href={`/stores/${tenant.slug}/cart?locale=${locale}`}
              className="relative inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <Link 
                href={`/stores/${tenant.slug}/profile?locale=${locale}`}
                className="inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link 
                href={`/stores/${tenant.slug}/auth/signin?locale=${locale}`}
                className="hidden sm:flex border border-gray-300 hover:bg-gray-50 inline-flex items-center justify-center rounded-md h-9 px-3 text-sm font-medium transition-colors"
              >
                {locale === 'ar' ? 'دخول' : 'Connexion'}
              </Link>
            )}
          </div>
        </div>

        {/* Language Toggle */}
        <div className="mt-3 flex justify-between items-center" dir="ltr">
          <Link 
            href={`/stores/${tenant.slug}?locale=fr`}
            className={`px-3 py-1 rounded text-sm ${locale === 'fr' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
          >
            Français
          </Link>
          <Link 
            href={`/stores/${tenant.slug}?locale=ar`}
            className={`px-3 py-1 rounded text-sm ${locale === 'ar' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
          >
            العربية
          </Link>
        </div>
      </div>
    </header>
  );
}