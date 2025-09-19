import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from '../utils/product'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  tenantId: string
  addedAt: Date
}

interface CartState {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (product: Product, tenantId: string, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  clearTenantCart: (tenantId: string) => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getTenantItems: (tenantId: string) => CartItem[]
  getTenantTotal: (tenantId: string) => number
  getItemQuantity: (productId: string) => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, tenantId: string, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.tenantId === tenantId
          )

          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.tenantId === tenantId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `${product.id}-${tenantId}`,
              product,
              quantity,
              tenantId,
              addedAt: new Date(),
            }
            return {
              items: [...state.items, newItem],
            }
          }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      clearTenantCart: (tenantId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.tenantId !== tenantId),
        }))
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product.price * item.quantity),
          0
        )
      },

      getTenantItems: (tenantId: string) => {
        return get().items.filter((item) => item.tenantId === tenantId)
      },

      getTenantTotal: (tenantId: string) => {
        return get().getTenantItems(tenantId).reduce(
          (total, item) => total + (item.product.price * item.quantity),
          0
        )
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find((item) => item.product.id === productId)
        return item ? item.quantity : 0
      },
    }),
    {
      name: 'grocery-cart-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist cart items, not UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
)