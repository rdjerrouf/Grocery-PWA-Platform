import { create } from 'zustand'

interface CartItem {
  id: string
  productId: string
  name: string
  nameAr: string
  price: number
  salePrice?: number
  quantity: number
  unit: string
}

interface CartStore {
  items: CartItem[]
  addItem: (product: any) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  getItem: (productId: string) => CartItem | undefined
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product) => {
    const items = get().items
    const existingItem = items.find(i => i.productId === product.id)

    if (existingItem) {
      set({
        items: items.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      })
    } else {
      set({
        items: [...items, {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          nameAr: product.name_ar,
          price: product.price,
          salePrice: product.sale_price,
          quantity: 1,
          unit: product.unit
        }]
      })
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter(i => i.productId !== productId)
    })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    set({
      items: get().items.map(i =>
        i.productId === productId ? { ...i, quantity } : i
      )
    })
  },

  clearCart: () => set({ items: [] }),

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => 
      sum + ((item.salePrice || item.price) * item.quantity), 0
    )
  },

  getItem: (productId) => {
    return get().items.find(i => i.productId === productId)
  }
}))