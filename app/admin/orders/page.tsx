import { createServerClient } from '@/lib/supabase/server'
import { AdminOrdersList } from '@/components/admin/AdminOrdersList'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default async function AdminOrdersPage() {
  const supabase = createServerClient()

  // Get all orders with related data
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        product_name,
        products (
          id,
          name,
          name_ar,
          name_fr,
          image_url
        )
      ),
      tenants (
        id,
        name,
        name_ar,
        name_fr,
        slug
      ),
      profiles (
        id,
        name,
        phone,
        email
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-600">
            Manage customer orders and track delivery status
          </p>
        </div>

        <AdminOrdersList orders={orders || []} />
      </div>
    </AdminLayout>
  )
}

export const metadata = {
  title: 'Order Management - Admin Panel',
  description: 'Manage customer orders and delivery status',
}