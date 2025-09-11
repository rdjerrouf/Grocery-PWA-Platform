'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { Tenant, Category } from '@/lib/supabase/types';

interface StoreLayoutProps {
  tenant: Tenant;
  categories: Category[];
  locale: 'fr' | 'ar';
  children: React.ReactNode;
}

export function StoreLayout({ tenant, categories, locale, children }: StoreLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`min-h-screen bg-background ${locale === 'ar' ? 'rtl' : 'ltr'}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header 
        tenant={tenant}
        locale={locale}
        onMenuToggle={toggleSidebar}
      />
      
      <Sidebar
        tenant={tenant}
        categories={categories}
        locale={locale}
        isOpen={sidebarOpen}
        onToggle={closeSidebar}
      />
      
      <main 
        className={`transition-all duration-300 ${
          sidebarOpen ? 'md:ml-80' : ''
        }`}
        onClick={sidebarOpen ? closeSidebar : undefined}
      >
        {children}
      </main>
    </div>
  );
}