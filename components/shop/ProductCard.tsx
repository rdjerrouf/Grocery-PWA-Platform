'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { formatCurrency, type Product } from '@/lib/utils/product';
import { useCartStore } from '@/stores/useCartStore';

// Product interface now imported from utils

interface ProductCardProps {
  product: Product;
  locale?: 'fr' | 'ar';  // French or Arabic
  gradientIndex?: number; // Index for gradient selection
}

// Define gradient backgrounds EXACTLY matching the desired template
const getProductGradient = (productName: string, index: number) => {
  const gradients = [
    'bg-gradient-to-br from-orange-100 to-orange-300', // Apple (first) - Orange gradient
    'bg-gradient-to-br from-blue-50 to-blue-200',      // Milk (second) - Light blue gradient
    'bg-gradient-to-br from-yellow-100 to-yellow-300'  // Bread (third) - Yellow gradient
  ];
  return gradients[index % gradients.length];
};

export function ProductCard({ product, locale = 'fr', gradientIndex = 0 }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  // Get current quantity from cart
  const cartItem = items.find(item => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const displayName = locale === 'ar' ? product.nameAr || product.name : product.name;
  const displayDescription = locale === 'ar' ? product.descriptionAr || product.description : product.description;
  const finalPrice = product.salePrice || product.price;
  const hasDiscount = !!product.salePrice && product.salePrice < product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;
  const isOutOfStock = product.stockQuantity <= 0;

  // Get gradient based on product index
  const gradientClass = getProductGradient(displayName, gradientIndex);

  // Cart handlers
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addItem({
      productId: product.id,
      name: displayName,
      price: finalPrice,
      quantity: 1,
      imageUrl: product.imageUrl,
      maxQuantity: product.stockQuantity
    });
  };

  const handleIncrement = () => {
    if (quantity >= product.stockQuantity) return;
    
    if (quantity === 0) {
      handleAddToCart();
    } else {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 w-full max-w-sm mx-auto shadow-lg"
      data-testid="product-card"
    >
      {/* Product Image with Colorful Background */}
      <div className={`relative aspect-square w-full ${gradientClass} overflow-hidden flex items-center justify-center p-8`}>
        <Image
          src={product.imageUrl || '/images/product-placeholder.svg'}
          alt={displayName}
          width={200}
          height={200}
          className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
          priority={product.isFeatured}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/product-placeholder.svg';
          }}
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className={`absolute top-4 ${locale === 'ar' ? 'right-4' : 'left-4'} bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
            {locale === 'ar' ? `خصم ${discountPercentage}%` : `خصم ${discountPercentage}%`}
          </div>
        )}

        {/* New Badge for Featured Products */}
        {!hasDiscount && product.isFeatured && (
          <div className={`absolute top-4 ${locale === 'ar' ? 'right-4' : 'left-4'} bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
            {locale === 'ar' ? 'جديد' : 'جديد'}
          </div>
        )}

        {/* Heart/Bookmark Icon */}
        <div className={`absolute top-4 ${locale === 'ar' ? 'left-4' : 'right-4'} w-10 h-10 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg`}>
          <svg className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-lg bg-black/70 px-4 py-2 rounded-lg">
              {locale === 'ar' ? 'نفد المخزون' : 'Rupture de stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col">
        <h3 className={`text-lg font-bold text-gray-900 mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`} title={displayName}>
          {displayName}
        </h3>

        <p className={`text-sm text-gray-600 mb-4 ${locale === 'ar' ? 'text-right' : 'text-left'} line-clamp-2`}>
          {displayDescription || (locale === 'ar' ? 'منتج عالي الجودة' : 'Produit de haute qualité')}
        </p>

        {/* Price */}
        <div className={`flex items-baseline gap-3 mb-6 ${locale === 'ar' ? 'justify-end flex-row-reverse' : ''}`}>
            <span className="text-2xl font-bold text-green-600">
              {locale === 'ar' ? 'د.ج' : ''} {formatCurrency(finalPrice).replace(' DZD', '')}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">
                {locale === 'ar' ? 'د.ج' : ''} {formatCurrency(product.price).replace(' DZD', '')}
              </span>
            )}
        </div>

        {/* Add to Cart Controls */}
        <div className="mt-auto">
          {quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-green-500 text-white hover:bg-green-600 transition-all duration-200 rounded-xl font-bold text-lg py-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              {locale === 'ar' ? 'أضف للسلة' : 'أضف للسلة'}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleDecrement}
                variant="outline"
                size="lg"
                className="h-12 w-12 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Minus className="w-5 h-5" />
              </Button>

              <span className="font-bold text-2xl w-12 text-center text-green-600">{quantity}</span>

              <Button
                onClick={handleIncrement}
                variant="outline"
                size="lg"
                disabled={quantity >= product.stockQuantity}
                className="h-12 w-12 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
