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
}

export function ProductCard({ product, locale = 'fr' }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  
  // Get current quantity from cart
  const cartItem = items.find(item => item.productId === product.id);
  const quantity = cartItem?.quantity || 0; 
  
  const displayName = locale === 'ar' ? product.nameAr || product.name : product.name;
  const displayDescription = locale === 'ar' ? product.descriptionAr || product.description : product.description;
  const finalPrice = product.salePrice || product.price; // Prices already in cents
  const hasDiscount = !!product.salePrice && product.salePrice < product.price;
  const isOutOfStock = product.stockQuantity <= 0;

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
      className="bg-card border border-secondary/50 rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      data-testid="product-card"
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-secondary/30">
        <Image
          src={product.imageUrl || '/images/product-placeholder.png'}
          alt={displayName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
            SALE
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {locale === 'ar' ? 'نفد المخزون' : 'Rupture de stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col">
        <h3 className={`text-base font-semibold text-foreground mb-1.5 truncate h-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`} title={displayName}>
          {displayName}
        </h3>
        
        <p className={`text-sm text-foreground/70 mb-3 h-10 flex-grow ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
          {displayDescription}
        </p>

        {/* Price */}
        <div className={`flex items-baseline gap-2 mb-4 ${locale === 'ar' ? 'justify-end' : ''}`}>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-foreground/50 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
        </div>

        {/* Add to Cart Controls */}
        <div className="mt-auto">
          {quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'أضف للسلة' : 'Ajouter au panier'}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={handleDecrement}
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>

              <span className="font-bold text-lg w-10 text-center">{quantity}</span>

              <Button
                onClick={handleIncrement}
                variant="outline"
                size="icon"
                disabled={quantity >= product.stockQuantity}
                className="h-9 w-9 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
