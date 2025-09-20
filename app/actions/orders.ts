'use server'

import { createServerActionClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const checkoutSchema = z.object({
  tenant_id: z.string().uuid(),
  tenant_slug: z.string(),
  customer_name: z.string().min(1, 'Name is required'),
  customer_phone: z.string().min(8, 'Valid phone number is required'),
  customer_email: z.string().email().optional(),
  delivery_address: z.string().min(10, 'Delivery address is required'),
  wilaya: z.string().min(1, 'Wilaya is required'),
  commune: z.string().min(1, 'Commune is required'),
  notes: z.string().optional(),
  payment_method: z.enum(['cash', 'card']).default('cash'),
})

const orderStatusSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
})

export async function createOrder(input: z.infer<typeof checkoutSchema>) {
  try {
    const validated = checkoutSchema.parse(input)
    const supabase = createServerActionClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get user's cart items for this tenant
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        products (
          id,
          name,
          name_ar,
          name_fr,
          price,
          stock_quantity,
          is_active
        )
      `)
      .eq('user_id', user.id)
      .eq('tenant_id', validated.tenant_id)

    if (cartError || !cartItems || cartItems.length === 0) {
      return { success: false, error: 'Cart is empty or could not be retrieved' }
    }

    // Validate cart items and calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of cartItems) {
      const product = item.products as any

      if (!product || !product.is_active) {
        return { success: false, error: `Product ${product?.name || 'unknown'} is no longer available` }
      }

      if (product.stock_quantity < item.quantity) {
        return { success: false, error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}` }
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
        product_name: product.name,
      })
    }

    // Get tenant delivery fee
    const { data: tenant } = await supabase
      .from('tenants')
      .select('delivery_fee, minimum_order')
      .eq('id', validated.tenant_id)
      .single()

    if (!tenant) {
      return { success: false, error: 'Store not found' }
    }

    if (subtotal < tenant.minimum_order) {
      return { success: false, error: `Minimum order amount is ${tenant.minimum_order} DZD` }
    }

    const deliveryFee = tenant.delivery_fee || 0
    const total = subtotal + deliveryFee

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create order in a transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        tenant_id: validated.tenant_id,
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        payment_status: validated.payment_method === 'cash' ? 'pending' : 'pending',
        customer_name: validated.customer_name,
        customer_phone: validated.customer_phone,
        customer_email: validated.customer_email,
        delivery_address: `${validated.delivery_address}, ${validated.commune}, ${validated.wilaya}`,
        delivery_fee: deliveryFee,
        subtotal: subtotal,
        total: total,
        notes: validated.notes,
      })
      .select()
      .single()

    if (orderError) {
      return { success: false, error: 'Failed to create order' }
    }

    // Add order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        orderItems.map(item => ({
          ...item,
          order_id: order.id,
        }))
      )

    if (itemsError) {
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      return { success: false, error: 'Failed to add order items' }
    }

    // Update product stock
    for (const item of cartItems) {
      const product = item.products as any
      await supabase
        .from('products')
        .update({ 
          stock_quantity: product.stock_quantity - item.quantity 
        })
        .eq('id', product.id)
    }

    // Clear user's cart for this tenant
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('tenant_id', validated.tenant_id)

    revalidatePath(`/stores/${validated.tenant_slug}`)
    revalidatePath(`/stores/${validated.tenant_slug}/orders`)

    return { 
      success: true, 
      order: {
        id: order.id,
        order_number: order.order_number,
        total: total
      }
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        errors: error.errors
      }
    }

    console.error('Order creation error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateOrderStatus(input: z.infer<typeof orderStatusSchema>) {
  try {
    const validated = orderStatusSchema.parse(input)
    const supabase = createServerActionClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Authentication required' }
    }

    // Check if user has permission to update this order (admin check could be added here)
    const { data: order } = await supabase
      .from('orders')
      .select('user_id, tenant_id')
      .eq('id', validated.order_id)
      .single()

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // For now, only allow users to cancel their own orders
    if (validated.status === 'cancelled' && order.user_id !== user.id) {
      return { success: false, error: 'Not authorized to cancel this order' }
    }

    const { error } = await supabase
      .from('orders')
      .update({ 
        status: validated.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', validated.order_id)

    if (error) {
      return { success: false, error: 'Failed to update order status' }
    }

    revalidatePath('/admin/orders')
    revalidatePath('/orders')

    return { success: true }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        errors: error.errors
      }
    }

    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function cancelOrder(orderId: string) {
  return updateOrderStatus({ order_id: orderId, status: 'cancelled' })
}

export async function getOrder(orderId: string) {
  const supabase = createServerActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const { data: order, error } = await supabase
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
        name,
        name_ar,
        name_fr,
        slug
      )
    `)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { success: false, error: 'Order not found' }
  }

  return { success: true, order }
}

export async function getUserOrders(tenantSlug?: string) {
  const supabase = createServerActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      payment_status,
      total,
      created_at,
      tenants (
        name,
        name_ar,
        name_fr,
        slug
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (tenantSlug) {
    // Filter by tenant slug
    query = query.eq('tenants.slug', tenantSlug)
  }

  const { data: orders, error } = await query

  if (error) {
    return { success: false, error: 'Failed to retrieve orders' }
  }

  return { success: true, orders }
}