# Payment Integration Templates (Chargily Pay)

## Payment Flow Setup

### 1. Environment Configuration
```env
# .env.local
CHARGILY_API_KEY=your_chargily_api_key
CHARGILY_SECRET_KEY=your_chargily_secret_key
CHARGILY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Payment Initiation Server Action
```tsx
// app/actions/payment.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

interface PaymentData {
  orderId: string
  amount: number
  customerEmail: string
  customerName: string
}

export async function initiatePayment(data: PaymentData) {
  const supabase = createServerActionClient({ cookies })

  try {
    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: data.orderId,
        amount: data.amount,
        status: 'pending',
        payment_method: 'chargily',
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Initialize Chargily payment
    const chargilyResponse = await fetch('https://pay.chargily.com/test/api/v2/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHARGILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: 'dzd',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?order_id=${data.orderId}`,
        failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure?order_id=${data.orderId}`,
        webhook_endpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/chargily`,
        description: `Order #${data.orderId}`,
        customer_email: data.customerEmail,
        customer_name: data.customerName,
        metadata: {
          order_id: data.orderId,
          payment_id: payment.id,
        },
      }),
    })

    if (!chargilyResponse.ok) {
      throw new Error('Failed to initialize payment')
    }

    const chargilyData = await chargilyResponse.json()

    // Update payment with Chargily checkout ID
    await supabase
      .from('payments')
      .update({
        external_id: chargilyData.id,
        checkout_url: chargilyData.checkout_url,
      })
      .eq('id', payment.id)

    // Redirect to Chargily checkout
    redirect(chargilyData.checkout_url)

  } catch (error) {
    console.error('Payment initiation error:', error)
    return {
      success: false,
      error: 'Failed to initialize payment. Please try again.',
    }
  }
}
```

### 3. Webhook Handler (Edge Function)
```typescript
// supabase/functions/chargily-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Verify webhook signature
    const signature = req.headers.get('signature')
    const payload = await req.text()

    if (!verifySignature(payload, signature, Deno.env.get('CHARGILY_WEBHOOK_SECRET')!)) {
      return new Response('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(payload)

    // Handle different event types
    switch (event.type) {
      case 'checkout.paid':
        await handlePaymentSuccess(event.data)
        break
      case 'checkout.failed':
        await handlePaymentFailure(event.data)
        break
      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal error', { status: 500 })
  }
})

async function handlePaymentSuccess(data: any) {
  const { metadata } = data

  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      external_data: data,
    })
    .eq('id', metadata.payment_id)

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', metadata.order_id)

  // Reduce product stock
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', metadata.order_id)

  if (orderItems) {
    for (const item of orderItems) {
      await supabase
        .rpc('reduce_product_stock', {
          product_id: item.product_id,
          quantity: item.quantity,
        })
    }
  }

  // Send confirmation email (optional)
  // await sendOrderConfirmationEmail(metadata.order_id)
}

async function handlePaymentFailure(data: any) {
  const { metadata } = data

  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      external_data: data,
    })
    .eq('id', metadata.payment_id)

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'payment_failed',
    })
    .eq('id', metadata.order_id)
}

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false

  const hmac = crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  // Implementation depends on Chargily's signature format
  // This is a simplified version
  return signature === `sha256=${payload}` // Adjust based on actual format
}
```

### 4. Payment Success Page
```tsx
// app/payment/success/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  searchParams: { order_id?: string }
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const supabase = createServerComponentClient({ cookies })

  if (!searchParams.order_id) {
    redirect('/')
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(name_fr, name_ar))')
    .eq('id', searchParams.order_id)
    .single()

  if (error || !order) {
    redirect('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mt-2">
            Thank you for your order. We'll start preparing it right away.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-left">
          <h2 className="font-semibold text-lg mb-4">Order Details</h2>
          <div className="space-y-2">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Total Amount:</strong> {formatPrice(order.total)} DZD</p>
            <p><strong>Status:</strong> {order.status}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Items:</h3>
            <ul className="space-y-1">
              {order.order_items.map((item: any) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.product.name_fr}</span>
                  <span>{item.quantity}x {formatPrice(item.price)} DZD</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/orders">View Orders</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
  }).format(price)
}
```

### 5. Payment Database Schema
```sql
-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'DZD',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  external_id TEXT, -- Chargily checkout ID
  checkout_url TEXT,
  external_data JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Tenant Isolation" ON payments
  FOR ALL USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

-- Indexes
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_external_id ON payments(external_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 6. Stock Reduction Function
```sql
-- Function to reduce product stock atomically
CREATE OR REPLACE FUNCTION reduce_product_stock(
  product_id UUID,
  quantity INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET
    stock = stock - quantity,
    updated_at = NOW()
  WHERE id = product_id;

  -- Check if stock went negative
  IF (SELECT stock FROM products WHERE id = product_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for product %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 7. Payment Status Component
```tsx
// components/payment/PaymentStatus.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'

interface PaymentStatusProps {
  orderId: string
}

export function PaymentStatus({ orderId }: PaymentStatusProps) {
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending')
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check initial status
    const checkStatus = async () => {
      const { data } = await supabase
        .from('payments')
        .select('status')
        .eq('order_id', orderId)
        .single()

      if (data) {
        setStatus(data.status)
      }
    }

    checkStatus()

    // Subscribe to status changes
    const channel = supabase
      .channel(`payment-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setStatus(payload.new.status)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  const statusConfig = {
    pending: {
      icon: <Loader2 className="h-6 w-6 animate-spin" />,
      text: 'Processing payment...',
      color: 'text-blue-600',
    },
    completed: {
      icon: <CheckCircle className="h-6 w-6" />,
      text: 'Payment successful!',
      color: 'text-green-600',
    },
    failed: {
      icon: <XCircle className="h-6 w-6" />,
      text: 'Payment failed',
      color: 'text-red-600',
    },
  }

  const config = statusConfig[status]

  return (
    <div className={`flex items-center gap-2 ${config.color}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  )
}
```