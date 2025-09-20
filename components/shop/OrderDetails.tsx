'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ar, fr } from 'date-fns/locale'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ChefHat,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cancelOrder } from '@/app/actions/orders'

interface OrderDetailsProps {
  order: any
  tenant: any
  locale: 'fr' | 'ar'
}

const ORDER_STATUS_CONFIG = {
  pending: {
    icon: Clock,
    colorClass: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    ar: 'في الانتظار',
    fr: 'En attente'
  },
  confirmed: {
    icon: CheckCircle,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    ar: 'مؤكد',
    fr: 'Confirmé'
  },
  preparing: {
    icon: ChefHat,
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
    ar: 'قيد التحضير',
    fr: 'En préparation'
  },
  out_for_delivery: {
    icon: Truck,
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    ar: 'في الطريق',
    fr: 'En livraison'
  },
  delivered: {
    icon: Package,
    colorClass: 'text-green-600 bg-green-50 border-green-200',
    ar: 'تم التوصيل',
    fr: 'Livré'
  },
  cancelled: {
    icon: XCircle,
    colorClass: 'text-red-600 bg-red-50 border-red-200',
    ar: 'ملغي',
    fr: 'Annulé'
  }
}

export function OrderDetails({ order, tenant, locale }: OrderDetailsProps) {
  const [cancelingOrder, setCancelingOrder] = useState(false)
  const isRTL = locale === 'ar'

  const formatPrice = (price: number) => `${price.toFixed(2)} DZD`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'PPPp', { locale: locale === 'ar' ? ar : fr })
  }

  const getStatusDisplay = (status: string) => {
    const config = ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG]
    if (!config) return { icon: Clock, colorClass: 'text-gray-600 bg-gray-50 border-gray-200', label: status }
    
    return {
      icon: config.icon,
      colorClass: config.colorClass,
      label: locale === 'ar' ? config.ar : config.fr
    }
  }

  const canCancelOrder = () => {
    return ['pending', 'confirmed'].includes(order.status)
  }

  const handleCancelOrder = async () => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من إلغاء الطلب؟' : 'Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return
    }

    setCancelingOrder(true)
    try {
      const result = await cancelOrder(order.id)
      if (result.success) {
        window.location.reload()
      } else {
        alert(result.error || 'Failed to cancel order')
      }
    } catch (error) {
      alert('An error occurred while canceling the order')
    } finally {
      setCancelingOrder(false)
    }
  }

  const statusDisplay = getStatusDisplay(order.status)
  const StatusIcon = statusDisplay.icon
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
          <Link 
            href={`/stores/${tenant.slug}/orders?locale=${locale}`}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <BackIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {locale === 'ar' ? 'طلب رقم' : 'Commande'} #{order.order_number}
            </h1>
            <p className="text-sm text-gray-500">
              {locale === 'ar' ? 'تم الطلب في' : 'Commandé le'} {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        {canCancelOrder() && (
          <Button
            variant="outline"
            onClick={handleCancelOrder}
            disabled={cancelingOrder}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            {cancelingOrder
              ? (locale === 'ar' ? 'جاري الإلغاء...' : 'Annulation...')
              : (locale === 'ar' ? 'إلغاء الطلب' : 'Annuler la commande')
            }
          </Button>
        )}
      </div>

      {/* Status */}
      <div className={`border rounded-lg p-6 ${statusDisplay.colorClass}`}>
        <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
          <StatusIcon className="h-8 w-8" />
          <div>
            <h2 className="text-lg font-semibold">
              {statusDisplay.label}
            </h2>
            <p className="text-sm opacity-75">
              {order.status === 'pending' && (locale === 'ar' 
                ? 'سيتم الاتصال بك قريباً لتأكيد الطلب' 
                : 'Vous serez contacté prochainement pour confirmer la commande'
              )}
              {order.status === 'confirmed' && (locale === 'ar' 
                ? 'تم تأكيد طلبك وجاري التحضير' 
                : 'Votre commande est confirmée et en cours de préparation'
              )}
              {order.status === 'preparing' && (locale === 'ar' 
                ? 'يتم تحضير طلبك حالياً' 
                : 'Votre commande est en cours de préparation'
              )}
              {order.status === 'out_for_delivery' && (locale === 'ar' 
                ? 'طلبك في الطريق إليك' 
                : 'Votre commande est en cours de livraison'
              )}
              {order.status === 'delivered' && (locale === 'ar' 
                ? 'تم توصيل طلبك بنجاح' 
                : 'Votre commande a été livrée avec succès'
              )}
              {order.status === 'cancelled' && (locale === 'ar' 
                ? 'تم إلغاء الطلب' 
                : 'La commande a été annulée'
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                {locale === 'ar' ? 'تفاصيل الطلب' : 'Détails de la commande'}
              </h3>
            </div>

            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-6 divide-y divide-gray-200">
                  {order.order_items.map((item: any) => {
                    const product = item.products
                    return (
                      <li key={item.id} className="flex py-6">
                        <div className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 ${isRTL ? 'ml-4' : 'mr-4'}`}>
                          {product?.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={locale === 'ar' ? product.name_ar || product.name || item.product_name : product.name || item.product_name}
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

                        <div className="flex flex-1 flex-col">
                          <div>
                            <div className={`flex justify-between text-base font-medium text-gray-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <h3>
                                {product ? (
                                  locale === 'ar' ? product.name_ar || product.name || item.product_name : product.name || item.product_name
                                ) : item.product_name}
                              </h3>
                              <p className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                                {formatPrice(item.total_price)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {formatPrice(item.unit_price)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Customer Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {locale === 'ar' ? 'ملخص الطلب' : 'Résumé de la commande'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className={`flex justify-between text-base text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <p>{locale === 'ar' ? 'المجموع الفرعي' : 'Sous-total'}</p>
                <p>{formatPrice(order.subtotal)}</p>
              </div>
              
              <div className={`flex justify-between text-base text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <p>{locale === 'ar' ? 'رسوم التوصيل' : 'Frais de livraison'}</p>
                <p>{formatPrice(order.delivery_fee)}</p>
              </div>

              <div className={`flex justify-between text-base font-medium text-gray-900 pt-4 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
                <p>{locale === 'ar' ? 'المجموع الكلي' : 'Total'}</p>
                <p>{formatPrice(order.total)}</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">
                    {locale === 'ar' ? 'حالة الدفع:' : 'Statut du paiement:'}
                  </span>{' '}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status === 'paid' 
                      ? (locale === 'ar' ? 'مدفوع' : 'Payé')
                      : (locale === 'ar' ? 'في الانتظار' : 'En attente')
                    }
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                {locale === 'ar' ? 'معلومات العميل' : 'Informations client'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{order.customer_name}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900" dir="ltr">{order.customer_phone}</span>
              </div>

              {order.customer_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900" dir="ltr">{order.customer_email}</span>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-900">
                  <p className="font-medium mb-1">
                    {locale === 'ar' ? 'عنوان التوصيل:' : 'Adresse de livraison:'}
                  </p>
                  <p className="text-gray-600">{order.delivery_address}</p>
                </div>
              </div>

              {order.notes && (
                <div className="pt-4 border-t">
                  <p className="font-medium text-sm text-gray-900 mb-2">
                    {locale === 'ar' ? 'ملاحظات:' : 'Notes:'}
                  </p>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}