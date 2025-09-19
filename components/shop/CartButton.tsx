'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'

interface CartButtonProps {
  tenantId: string
  locale: 'fr' | 'ar'
  className?: string
}

export function CartButton({ tenantId, locale, className = '' }: CartButtonProps) {
  const { openCart, getTenantItems } = useCartStore()

  const items = getTenantItems(tenantId)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <button
      onClick={openCart}
      className={`p-2 hover:bg-gray-100 rounded-full transition-colors relative ${className}`}
      aria-label={locale === 'ar' ? 'سلة التسوق' : 'Panier'}
    >
      <ShoppingCart className="w-5 h-5 text-gray-600" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  )
}