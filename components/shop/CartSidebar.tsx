'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface CartSidebarProps {
  tenantId: string
  tenantSlug: string
  locale: 'fr' | 'ar'
}

export function CartSidebar({ tenantId, tenantSlug, locale }: CartSidebarProps) {
  const {
    isOpen,
    closeCart,
    getTenantItems,
    getTenantTotal,
    updateQuantity,
    removeItem,
  } = useCartStore()

  const isRTL = locale === 'ar'
  const items = getTenantItems(tenantId)
  const total = getTenantTotal(tenantId)

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} DZD`
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className={`pointer-events-none fixed inset-y-0 ${isRTL ? 'left-0' : 'right-0'} flex max-w-full ${isRTL ? 'pl-10' : 'pr-10'}`}>
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom={isRTL ? '-translate-x-full' : 'translate-x-full'}
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo={isRTL ? '-translate-x-full' : 'translate-x-full'}
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className={`flex items-start justify-between p-4 border-b ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {locale === 'ar' ? 'سلة التسوق' : 'Panier'}
                      </Dialog.Title>
                      <div className={`${isRTL ? 'mr-3' : 'ml-3'} flex h-7 items-center`}>
                        <button
                          type="button"
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                          onClick={closeCart}
                        >
                          <span className="absolute -inset-0.5" />
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      {items.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {locale === 'ar' ? 'سلة التسوق فارغة' : 'Panier vide'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {locale === 'ar'
                              ? 'أضف بعض المنتجات لتبدأ التسوق'
                              : 'Ajoutez des produits pour commencer'
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="flow-root">
                          <ul className="-my-6 divide-y divide-gray-200">
                            {items.map((item) => (
                              <li key={item.id} className="flex py-6">
                                <div className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 ${isRTL ? 'ml-4' : 'mr-4'}`}>
                                  {item.product.images && item.product.images.length > 0 ? (
                                    <Image
                                      src={item.product.images[0]}
                                      alt={locale === 'ar' ? item.product.nameAr || item.product.name : item.product.name}
                                      width={96}
                                      height={96}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                <div className={`flex flex-1 flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
                                  <div>
                                    <div className={`flex justify-between text-base font-medium text-gray-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                      <h3>
                                        {locale === 'ar'
                                          ? item.product.nameAr || item.product.name
                                          : item.product.name
                                        }
                                      </h3>
                                      <p className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                                        {formatPrice(item.product.price * item.quantity)}
                                      </p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                      {formatPrice(item.product.price)} {locale === 'ar' ? 'للوحدة' : 'par unité'}
                                    </p>
                                  </div>
                                  <div className={`flex flex-1 items-end justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="font-medium min-w-[2rem] text-center">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.product.id)}
                                      className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      {locale === 'ar' ? 'إزالة' : 'Supprimer'}
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className={`flex justify-between text-base font-medium text-gray-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <p>{locale === 'ar' ? 'المجموع' : 'Total'}</p>
                          <p>{formatPrice(total)}</p>
                        </div>
                        <p className={`mt-0.5 text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {locale === 'ar'
                            ? 'رسوم التوصيل محسوبة عند الدفع'
                            : 'Frais de livraison calculés à la commande'
                          }
                        </p>
                        <div className="mt-6">
                          <Button
                            className="w-full"
                            onClick={() => {
                              // TODO: Navigate to checkout
                              console.log('Navigate to checkout')
                            }}
                          >
                            {locale === 'ar' ? 'الدفع' : 'Commander'}
                          </Button>
                        </div>
                        <div className={`mt-6 flex justify-center text-center text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <p>
                            {locale === 'ar' ? 'أو ' : 'ou '}
                            <button
                              type="button"
                              className="font-medium text-blue-600 hover:text-blue-500"
                              onClick={closeCart}
                            >
                              {locale === 'ar' ? 'تابع التسوق' : 'Continuer les achats'}
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}