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
    <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 text-white">
      <div className="container mx-auto px-4 py-4">
        {/* Top Row: Language Toggle and Actions */}
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Language Toggle */}
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link
              href={`/stores/${tenant.slug}?locale=fr`}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                locale === 'fr'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Français
            </Link>
            <Link
              href={`/stores/${tenant.slug}?locale=ar`}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                locale === 'ar'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              العربية
            </Link>
          </div>

          {/* Arabic Branding */}
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold">
              {locale === 'ar' ? 'سوبرماركت الجزائر' : 'Supermarché Algérie'}
            </h1>
          </div>

          {/* Right Actions */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="text-white hover:bg-white/20"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Cart Button */}
            <Link
              href={`/stores/${tenant.slug}/cart?locale=${locale}`}
              className="relative inline-flex items-center justify-center rounded-lg h-10 w-10 hover:bg-white/20 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <Link
                href={`/stores/${tenant.slug}/profile?locale=${locale}`}
                className="inline-flex items-center justify-center rounded-lg h-10 w-10 hover:bg-white/20 transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href={`/stores/${tenant.slug}/auth/signin?locale=${locale}`}
                className="bg-white/20 hover:bg-white/30 inline-flex items-center justify-center rounded-lg h-10 px-4 text-sm font-medium transition-colors"
              >
                {locale === 'ar' ? 'دخول' : 'Connexion'}
              </Link>
            )}
          </div>
        </div>

        {/* Large Central Search Bar */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث عن منتجات...' : 'Rechercher des produits...'}
              className={`
                w-full h-14 bg-white rounded-full shadow-lg border-0
                ${isRTL ? 'pr-12 pl-6 text-right' : 'pl-12 pr-6 text-left'}
                text-gray-800 text-lg
                focus:outline-none focus:ring-4 focus:ring-white/30
                placeholder-gray-400
              `}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </div>
      </div>
    </header>
  );
}