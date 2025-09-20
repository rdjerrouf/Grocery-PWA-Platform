'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ChefHat,
  Eye,
  Filter,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateOrderStatus } from '@/app/actions/orders'

interface AdminOrdersListProps {
  orders: any[]
}

const ORDER_STATUS_CONFIG = {
  pending: {
    icon: Clock,
    colorClass: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    label: 'Pending'
  },
  confirmed: {
    icon: CheckCircle,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    label: 'Confirmed'
  },
  preparing: {
    icon: ChefHat,
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
    label: 'Preparing'
  },
  out_for_delivery: {
    icon: Truck,
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    label: 'Out for Delivery'
  },
  delivered: {
    icon: Package,
    colorClass: 'text-green-600 bg-green-50 border-green-200',
    label: 'Delivered'
  },
  cancelled: {
    icon: XCircle,
    colorClass: 'text-red-600 bg-red-50 border-red-200',
    label: 'Cancelled'
  }
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
]

export function AdminOrdersList({ orders }: AdminOrdersListProps) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const formatPrice = (price: number) => `${price.toFixed(2)} DZD`

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPp')
  }

  const getStatusDisplay = (status: string) => {
    const config = ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG]
    if (!config) return { icon: Clock, colorClass: 'text-gray-600 bg-gray-50 border-gray-200', label: status }
    return config
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      const result = await updateOrderStatus({ order_id: orderId, status: newStatus as any })
      if (result.success) {
        window.location.reload()
      } else {
        alert(result.error || 'Failed to update status')
      }
    } catch (error) {
      alert('An error occurred while updating status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getItemCount = (orderItems: any[]) => {
    return orderItems.reduce((count, item) => count + item.quantity, 0)
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter
    const matchesSearch = !searchTerm || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm)
    
    return matchesFilter && matchesSearch
  })

  // Group orders by status for stats
  const orderStats = orders.reduce((stats, order) => {
    stats[order.status] = (stats[order.status] || 0) + 1
    return stats
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATUS_OPTIONS.map(({ value, label }) => {
          const count = orderStats[value] || 0
          const config = getStatusDisplay(value)
          const StatusIcon = config.icon

          return (
            <div key={value} className={`p-4 rounded-lg border ${config.colorClass}`}>
              <div className="flex items-center space-x-2">
                <StatusIcon className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? 'No orders match your search criteria.'
                  : `No ${filter} orders found.`
                }
              </p>
            </li>
          ) : (
            filteredOrders.map((order) => {
              const statusDisplay = getStatusDisplay(order.status)
              const StatusIcon = statusDisplay.icon
              const itemCount = getItemCount(order.order_items)
              const tenant = order.tenants
              const customer = order.profiles

              return (
                <li key={order.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${statusDisplay.colorClass}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span>{statusDisplay.label}</span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer_name}
                        </p>
                        <p className="text-sm text-gray-500" dir="ltr">
                          {order.customer_phone}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {tenant?.name || 'Unknown Store'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </p>
                        <p className={`text-sm ${
                          order.payment_status === 'paid' 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }`}>
                          {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          disabled={updatingStatus === order.id}
                          className="text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          {STATUS_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Open order details modal or navigate to details page
                            window.open(`/admin/orders/${order.id}`, '_blank')
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Items:</p>
                      <div className="space-y-1">
                        {order.order_items.slice(0, 2).map((item: any, index: number) => (
                          <p key={index} className="text-gray-500">
                            {item.quantity}× {item.product_name} - {formatPrice(item.total_price)}
                          </p>
                        ))}
                        {order.order_items.length > 2 && (
                          <p className="text-gray-400 italic">
                            and {order.order_items.length - 2} more item{order.order_items.length - 2 !== 1 ? 's' : ''}...
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {order.delivery_address && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p className="font-medium">Delivery Address:</p>
                        <p className="text-gray-500">{order.delivery_address}</p>
                      </div>
                    )}

                    {order.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p className="font-medium">Notes:</p>
                        <p className="text-gray-500">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>
  )
}