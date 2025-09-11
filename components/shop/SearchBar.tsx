'use client';

import { useState, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

// Simple debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

interface SearchBarProps {
  tenantSlug: string;
  locale: 'fr' | 'ar';
  initialQuery?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({ 
  tenantSlug, 
  locale, 
  initialQuery = '', 
  onSearch,
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isRTL = locale === 'ar';

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        // Navigate to search page with query
        const params = new URLSearchParams(searchParams);
        if (searchQuery.trim()) {
          params.set('q', searchQuery.trim());
        } else {
          params.delete('q');
        }
        params.set('locale', locale);
        
        router.push(`/stores/${tenantSlug}/search?${params.toString()}`);
      }
    }, 300),
    [tenantSlug, locale, onSearch, router, searchParams]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch.cancel(); // Cancel debounced call
    
    if (onSearch) {
      onSearch(query);
    } else {
      const params = new URLSearchParams(searchParams);
      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }
      params.set('locale', locale);
      
      router.push(`/stores/${tenantSlug}/search?${params.toString()}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    debouncedSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search 
          className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground ${
            isRTL ? 'right-3' : 'left-3'
          }`} 
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={
            locale === 'ar' 
              ? 'البحث عن منتجات...' 
              : 'Rechercher des produits...'
          }
          className={`
            w-full h-12 bg-secondary rounded-lg border border-border
            ${isRTL ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'}
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all duration-200
          `}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className={`absolute top-1/2 transform -translate-y-1/2 ${
              isRTL ? 'left-2' : 'right-2'
            } h-8 w-8`}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </form>
  );
}