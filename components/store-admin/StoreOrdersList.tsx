'use client'

import { useState } from 'react'
import {
  ShoppingCart,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase/types'

type DbTenant = Database['public']['Tables']['tenants']['Row']
type DbOrder = Database['public']['Tables']['orders']['Row']

interface OrderWithItems extends DbOrder {
  order_items: {
    id: string
    quantity: number
    unit_price: number
    total_price: number
    product_name: string
  }[]
}

interface StoreOrdersListProps {
  orders: OrderWithItems[]
  tenant: DbTenant
  locale?: 'fr' | 'ar'
  statusFilter?: string
}

export function StoreOrdersList({ orders, tenant, locale = 'ar', statusFilter }: StoreOrdersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(statusFilter || 'all')
  const isRTL = locale === 'ar'

  const statusOptions = [
    { value: 'all', label: locale === 'ar' ? 'كل الطلبات' : 'Toutes les commandes' },
    { value: 'pending', label: locale === 'ar' ? 'معلق' : 'En attente' },
    { value: 'confirmed', label: locale === 'ar' ? 'مؤكد' : 'Confirmé' },
    { value: 'processing', label: locale === 'ar' ? 'قيد التحضير' : 'En préparation' },
    { value: 'out_for_delivery', label: locale === 'ar' ? 'في الطريق' : 'En livraison' },
    { value: 'delivered', label: locale === 'ar' ? 'تم التوصيل' : 'Livré' },
    { value: 'cancelled', label: locale === 'ar' ? 'ملغي' : 'Annulé' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Package className="w-4 h-4" />
      case 'out_for_delivery': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_phone.includes(searchTerm)

    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  return (
    <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'ar' ? 'إدارة الطلبات' : 'Gestion des commandes'}
        </h1>
        <p className="text-gray-600 mt-2">
          {locale === 'ar'
            ? `إدارة طلبات العملاء في متجر ${tenant.name_ar || tenant.name}`
            : `Gérez les commandes des clients du magasin ${tenant.name_fr || tenant.name}`
          }
        </p>
      </div>

      {/* Filters */}
      <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={locale === 'ar' ? 'البحث في الطلبات...' : 'Rechercher des commandes...'}
            className={`w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ${isRTL ? 'right-3' : 'left-3'}`} />
          <select
            className={`py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {locale === 'ar'
            ? `عرض ${filteredOrders.length} من أصل ${orders.length} طلب`
            : `Affichage de ${filteredOrders.length} sur ${orders.length} commandes`
          }
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h3 className="text-lg font-semibold text-gray-900">#{order.order_number}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {statusOptions.find(s => s.value === order.status)?.label || order.status}
                    </span>
                  </div>
                  <p className="text-gray-600">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">{order.customer_phone}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                  <p className="text-2xl font-bold text-gray-900">
                    {order.total} {tenant.currency}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                    {locale === 'ar' ? 'عنصر' : 'articles'}
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="border-t pt-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {locale === 'ar' ? 'محتويات الطلب:' : 'Contenu de la commande:'}
                </h4>
                <div className="space-y-1">
                  {order.order_items.slice(0, 3).map((item, index) => (
                    <div key={index} className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-gray-600">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {item.total_price} {tenant.currency}
                      </span>
                    </div>
                  ))}
                  {order.order_items.length > 3 && (
                    <p className="text-xs text-gray-500">
                      {locale === 'ar'
                        ? `و ${order.order_items.length - 3} عناصر أخرى...`
                        : `et ${order.order_items.length - 3} autres articles...`
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Information */}
              {order.delivery_address && (
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {locale === 'ar' ? 'عنوان التوصيل:' : 'Adresse de livraison:'}
                  </h4>
                  <p className="text-sm text-gray-600">{order.delivery_address}</p>
                </div>
              )}

              {/* Actions */}
              <div className={`flex justify-between items-center border-t pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Link
                  href={`/stores/${tenant.slug}/admin/orders/${order.id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {locale === 'ar' ? 'عرض التفاصيل' : 'Voir les détails'}
                </Link>

                {order.notes && (
                  <p className="text-xs text-gray-500 max-w-md truncate">
                    <span className="font-medium">
                      {locale === 'ar' ? 'ملاحظات:' : 'Notes:'}{' '}
                    </span>
                    {order.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {locale === 'ar' ? 'لا توجد طلبات' : 'Aucune commande'}
            </h3>
            <p className="text-gray-500">
              {locale === 'ar'
                ? 'لا توجد طلبات تطابق معايير البحث الحالية'
                : 'Aucune commande ne correspond aux critères de recherche actuels'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}