'use client'

import { useState } from 'react'
import { ArrowLeft, Heart, Share2, Star, Plus, Minus, ShoppingCart, Check, Truck, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FrontendProduct, getDisplayName, getDisplayDescription, formatPrice } from '@/lib/utils/product'
import { useCartStore } from '@/lib/stores/cart'
import { ProductCard } from './ProductCard'
import { Button } from '@/components/ui/button'
import { Database } from '@/lib/supabase/types'

type DbTenant = Database['public']['Tables']['tenants']['Row']

interface ProductDetailViewProps {
  product: FrontendProduct
  relatedProducts: FrontendProduct[]
  tenant: DbTenant
  locale: 'fr' | 'ar'
}

export function ProductDetailView({ product, relatedProducts, tenant, locale }: ProductDetailViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const { addItem, getItemQuantity, updateQuantity } = useCartStore()
  const cartQuantity = getItemQuantity(product.id)

  const isRTL = locale === 'ar'
  const name = getDisplayName(product, locale)
  const description = getDisplayDescription(product, locale)

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder-product.jpg']

  const handleAddToCart = () => {
    addItem(product, tenant.id, quantity)
    setQuantity(1) // Reset quantity after adding
  }

  const handleCartQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      updateQuantity(product.id, 0)
    } else {
      updateQuantity(product.id, newQuantity)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: description || name,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share was cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert(locale === 'ar' ? 'تم نسخ الرابط' : 'Lien copié')
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with back button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link
              href={`/stores/${tenant.slug}?locale=${locale}`}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className={`w-5 h-5 text-gray-600 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
            <h1 className={`text-lg font-semibold text-gray-900 truncate ${isRTL ? 'text-right' : 'text-left'}`}>
              {name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${isRTL ? 'lg:grid-flow-col-dense' : ''}`}>
          {/* Product Images */}
          <div className={`space-y-4 ${isRTL ? 'lg:order-2' : ''}`}>
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <Image
                src={images[selectedImageIndex]}
                alt={name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className={`flex gap-2 overflow-x-auto pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-green-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={`space-y-6 ${isRTL ? 'lg:order-1 text-right' : 'text-left'}`}>
            {/* Title and Actions */}
            <div>
              <div className={`flex items-start justify-between gap-4 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Rating - placeholder */}
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  4.8 (127 {locale === 'ar' ? 'تقييم' : 'avis'})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {product.salePrice ? (
                  <>
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded">
                      {locale === 'ar' ? 'تخفيض' : 'Promo'}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                {locale === 'ar' ? `للوحدة الواحدة (${product.unit})` : `par ${product.unit}`}
              </p>
            </div>

            {/* Stock Status */}
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {product.isAvailable && product.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {product.stock} {locale === 'ar' ? 'متوفر في المخزن' : 'en stock'}
                  </span>
                </>
              ) : (
                <span className="text-red-600 font-medium">
                  {locale === 'ar' ? 'غير متوفر' : 'Rupture de stock'}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'ar' ? 'الوصف' : 'Description'}
                </h3>
                <p className="text-gray-700 leading-relaxed">{description}</p>
              </div>
            )}

            {/* Nutritional Info - if available */}
            {product.nutritionalInfo && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'ar' ? 'المعلومات الغذائية' : 'Informations nutritionnelles'}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    {locale === 'ar' ? 'معلومات غذائية مفصلة متاحة' : 'Informations détaillées disponibles'}
                  </p>
                </div>
              </div>
            )}

            {/* Add to Cart Section */}
            <div className="border-t pt-6">
              {cartQuantity > 0 ? (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between bg-green-50 border-2 border-green-600 rounded-lg p-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={() => handleCartQuantityChange(cartQuantity - 1)}
                      className="p-2 hover:bg-green-100 rounded-full transition-colors"
                    >
                      <Minus className="w-5 h-5 text-green-600" />
                    </button>
                    <span className="font-bold text-green-700 text-lg">
                      {cartQuantity} {locale === 'ar' ? 'في السلة' : 'dans le panier'}
                    </span>
                    <button
                      onClick={() => handleCartQuantityChange(cartQuantity + 1)}
                      disabled={!product.isAvailable}
                      className="p-2 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5 text-green-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'الكمية' : 'Quantité'}
                    </label>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-lg min-w-[3rem] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.isAvailable}
                    className="w-full h-12 text-lg font-semibold"
                    size="lg"
                  >
                    <div className={`flex items-center justify-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <ShoppingCart className="w-5 h-5" />
                      <span>
                        {product.isAvailable
                          ? (locale === 'ar' ? 'إضافة للسلة' : 'Ajouter au panier')
                          : (locale === 'ar' ? 'غير متوفر' : 'Non disponible')
                        }
                      </span>
                    </div>
                  </Button>
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {locale === 'ar' ? 'التوصيل المجاني' : 'Livraison gratuite'}
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  {locale === 'ar'
                    ? `للطلبات فوق ${tenant.minimum_order / 100} دج`
                    : `pour les commandes supérieures à ${tenant.minimum_order / 100} DZD`
                  }
                </p>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {locale === 'ar' ? 'ضمان الجودة' : 'Garantie de qualité'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className={`text-2xl font-bold text-gray-900 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {locale === 'ar' ? 'منتجات مشابهة' : 'Produits similaires'}
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isRTL ? 'direction-rtl' : ''}`}>
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  locale={locale}
                  gradientIndex={index}
                  tenantId={tenant.id}
                  tenantSlug={tenant.slug}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}