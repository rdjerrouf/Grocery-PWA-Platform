'use server'

import { createServerActionClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
})

export async function addToCart(input: z.infer<typeof cartItemSchema>) {
  try {
    const validated = cartItemSchema.parse(input)
    const supabase = createServerActionClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if product is available and in stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock, is_active')
      .eq('id', validated.product_id)
      .single()

    if (productError || !product) {
      return { success: false, error: 'Product not found' }
    }

    if (!product.is_active) {
      return { success: false, error: 'Product is not available' }
    }

    if (product.stock < validated.quantity) {
      return { success: false, error: 'Insufficient stock' }
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', validated.product_id)
      .single()

    if (existingItem) {
      // Update existing cart item
      const newQuantity = existingItem.quantity + validated.quantity

      if (newQuantity > product.stock) {
        return { success: false, error: 'Insufficient stock for requested quantity' }
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)

      if (error) {
        return { success: false, error: 'Failed to update cart' }
      }
    } else {
      // Create new cart item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: validated.product_id,
          quantity: validated.quantity,
        })

      if (error) {
        return { success: false, error: 'Failed to add to cart' }
      }
    }

    revalidatePath('/cart')
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

export async function updateCartItem(itemId: string, quantity: number) {
  try {
    const supabase = createServerActionClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: 'Failed to remove item' }
      }
    } else {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: 'Failed to update quantity' }
      }
    }

    revalidatePath('/cart')
    return { success: true }

  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function removeFromCart(itemId: string) {
  try {
    const supabase = createServerActionClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: 'Failed to remove item' }
    }

    revalidatePath('/cart')
    return { success: true }

  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function clearCart() {
  try {
    const supabase = createServerActionClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: 'Failed to clear cart' }
    }

    revalidatePath('/cart')
    return { success: true }

  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' }
  }
}