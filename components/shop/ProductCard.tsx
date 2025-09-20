'use client'

import { ShoppingCart, Heart, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { FrontendProduct, getDisplayName, getDisplayDescription, formatPrice } from '@/lib/utils/product'
import { useCartStore } from '@/lib/stores/cart'
import { ProductImage } from '@/components/ui/optimized-image'

interface ProductCardProps {
  product: FrontendProduct
  locale?: 'fr' | 'ar'
  gradientIndex?: number
  tenantId?: string
  tenantSlug?: string
}

export function ProductCard({ product, locale = 'fr', gradientIndex = 0, tenantId, tenantSlug }: ProductCardProps) {
  const name = getDisplayName(product, locale)
  const description = getDisplayDescription(product, locale)
  const isRTL = locale === 'ar'

  const { addItem, getItemQuantity, updateQuantity } = useCartStore()
  const quantity = getItemQuantity(product.id)

  const handleAddToCart = () => {
    if (tenantId && product.isAvailable) {
      addItem(product, tenantId, 1)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      updateQuantity(product.id, 0)
    } else {
      updateQuantity(product.id, newQuantity)
    }
  }

  // Gradient colors for product cards
  const gradients = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-red-400 to-red-600',
    'from-yellow-400 to-yellow-600',
    'from-indigo-400 to-indigo-600'
  ]

  const gradient = gradients[gradientIndex % gradients.length]

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Product Image */}
      <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {product.imageUrl ? (
          <ProductImage
            src={product.imageUrl}
            alt={name}
            size="medium"
            priority={gradientIndex < 4} // Prioritize first 4 images
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            containerClassName="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-white" />
            </div>
          </div>
        )}

        {/* Wishlist button */}
        <button
          className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} p-2 bg-white/90 hover:bg-white rounded-full transition-colors group-hover:scale-110 duration-200`}
          aria-label={locale === 'ar' ? 'إضافة للمفضلة' : 'Ajouter aux favoris'}
        >
          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
        </button>

        {/* Sale badge */}
        {product.salePrice && (
          <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold`}>
            {locale === 'ar' ? 'تخفيض' : 'Promo'}
          </div>
        )}

        {/* Stock indicator */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {locale === 'ar' ? 'غير متوفر' : 'Rupture de stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Clickable product info section */}
        {tenantSlug ? (
          <Link href={`/stores/${tenantSlug}/product/${product.id}?locale=${locale}`} className="block">
            <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}>
              {name}
            </h3>

            {description && (
              <p className={`text-sm text-gray-600 mb-3 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {description}
              </p>
            )}
          </Link>
        ) : (
          <>
            <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {name}
            </h3>

            {description && (
              <p className={`text-sm text-gray-600 mb-3 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {description}
              </p>
            )}
          </>
        )}

        {/* Price and unit */}
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="flex items-center gap-2">
              {product.salePrice ? (
                <>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {locale === 'ar' ? `للوحدة الواحدة (${product.unit})` : `par ${product.unit}`}
            </p>
          </div>

          {/* Stock count */}
          <div className={`text-xs text-gray-500 ${isRTL ? 'text-left' : 'text-right'}`}>
            {product.stock > 0 ? (
              <span>
                {product.stock} {locale === 'ar' ? 'متوفر' : 'en stock'}
              </span>
            ) : (
              <span className="text-red-500">
                {locale === 'ar' ? 'غير متوفر' : 'Épuisé'}
              </span>
            )}
          </div>
        </div>

        {/* Add to cart button or quantity controls */}
        {quantity > 0 ? (
          <div className={`flex items-center justify-between bg-green-50 border-2 border-green-600 rounded-lg p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className="p-1 hover:bg-green-100 rounded-full transition-colors"
            >
              <Minus className="w-4 h-4 text-green-600" />
            </button>
            <span className="font-semibold text-green-700 min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={!product.isAvailable}
              className="p-1 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-green-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable || !tenantId}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
              product.isAvailable && tenantId
                ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <ShoppingCart className="w-4 h-4" />
              <span>
                {product.isAvailable
                  ? (locale === 'ar' ? 'إضافة للسلة' : 'Ajouter au panier')
                  : (locale === 'ar' ? 'غير متوفر' : 'Non disponible')
                }
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
