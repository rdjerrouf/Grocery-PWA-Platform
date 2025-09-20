'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar, fr } from 'date-fns/locale'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ChefHat,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cancelOrder } from '@/app/actions/orders'

interface OrdersListProps {
  orders: any[]
  tenantSlug: string
  locale: 'fr' | 'ar'
}

const ORDER_STATUS_CONFIG = {
  pending: {
    icon: Clock,
    colorClass: 'text-yellow-600 bg-yellow-50',
    ar: 'في الانتظار',
    fr: 'En attente'
  },
  confirmed: {
    icon: CheckCircle,
    colorClass: 'text-blue-600 bg-blue-50',
    ar: 'مؤكد',
    fr: 'Confirmé'
  },
  preparing: {
    icon: ChefHat,
    colorClass: 'text-purple-600 bg-purple-50',
    ar: 'قيد التحضير',
    fr: 'En préparation'
  },
  out_for_delivery: {
    icon: Truck,
    colorClass: 'text-indigo-600 bg-indigo-50',
    ar: 'في الطريق',
    fr: 'En livraison'
  },
  delivered: {
    icon: Package,
    colorClass: 'text-green-600 bg-green-50',
    ar: 'تم التوصيل',
    fr: 'Livré'
  },
  cancelled: {
    icon: XCircle,
    colorClass: 'text-red-600 bg-red-50',
    ar: 'ملغي',
    fr: 'Annulé'
  }
}

export function OrdersList({ orders, tenantSlug, locale }: OrdersListProps) {
  const [cancelingOrder, setCancelingOrder] = useState<string | null>(null)
  const isRTL = locale === 'ar'

  const formatPrice = (price: number) => `${price.toFixed(2)} DZD`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'PPP', { locale: locale === 'ar' ? ar : fr })
  }

  const getStatusDisplay = (status: string) => {
    const config = ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG]
    if (!config) return { icon: Clock, colorClass: 'text-gray-600 bg-gray-50', label: status }
    
    return {
      icon: config.icon,
      colorClass: config.colorClass,
      label: locale === 'ar' ? config.ar : config.fr
    }
  }

  const canCancelOrder = (order: any) => {
    return ['pending', 'confirmed'].includes(order.status)
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من إلغاء الطلب؟' : 'Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return
    }

    setCancelingOrder(orderId)
    try {
      const result = await cancelOrder(orderId)
      if (result.success) {
        window.location.reload()
      } else {
        alert(result.error || 'Failed to cancel order')
      }
    } catch (error) {
      alert('An error occurred while canceling the order')
    } finally {
      setCancelingOrder(null)
    }
  }

  const getItemCount = (orderItems: any[]) => {
    return orderItems.reduce((count, item) => count + item.quantity, 0)
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {locale === 'ar' ? 'لا توجد طلبات' : 'Aucune commande'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {locale === 'ar' 
            ? 'لم تقم بأي طلبات حتى الآن'
            : 'Vous n\'avez pas encore passé de commandes'
          }
        </p>
        <div className="mt-6">
          <Link href={`/stores/${tenantSlug}?locale=${locale}`}>
            <Button>
              {locale === 'ar' ? 'ابدأ التسوق' : 'Commencer les achats'}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const statusDisplay = getStatusDisplay(order.status)
        const StatusIcon = statusDisplay.icon
        const itemCount = getItemCount(order.order_items)

        return (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.colorClass} ${isRTL ? 'space-x-reverse' : ''}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span>{statusDisplay.label}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {locale === 'ar' ? 'طلب رقم' : 'Commande'} #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>

                <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                  <p className="text-lg font-medium text-gray-900">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {itemCount} {locale === 'ar' ? 'عنصر' : 'article'}{itemCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className={`mt-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <Link href={`/stores/${tenantSlug}/orders/${order.id}?locale=${locale}`}>
                    <Button variant="outline" size="sm" className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                      <Eye className="h-4 w-4" />
                      <span>{locale === 'ar' ? 'عرض التفاصيل' : 'Voir détails'}</span>
                    </Button>
                  </Link>

                  {canCancelOrder(order) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancelingOrder === order.id}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      {cancelingOrder === order.id
                        ? (locale === 'ar' ? 'جاري الإلغاء...' : 'Annulation...')
                        : (locale === 'ar' ? 'إلغاء الطلب' : 'Annuler')
                      }
                    </Button>
                  )}
                </div>

                {order.payment_status === 'pending' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {locale === 'ar' ? 'دفع معلق' : 'Paiement en attente'}
                  </span>
                )}
              </div>

              {/* Order Items Preview */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">
                    {locale === 'ar' ? 'المنتجات:' : 'Produits:'}
                  </p>
                  <div className="space-y-1">
                    {order.order_items.slice(0, 3).map((item: any, index: number) => (
                      <p key={index} className="text-gray-500">
                        {item.quantity}× {item.product_name}
                      </p>
                    ))}
                    {order.order_items.length > 3 && (
                      <p className="text-gray-400 italic">
                        {locale === 'ar' 
                          ? `و ${order.order_items.length - 3} منتجات أخرى...`
                          : `et ${order.order_items.length - 3} autre${order.order_items.length - 3 > 1 ? 's' : ''}...`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}