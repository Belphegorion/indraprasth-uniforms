import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  mrp?: number;
  size: string;
  color?: string;
  qty: number;
  image: string;
  schoolCode?: string;
  schoolName?: string;
  category?: string;
}

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  removeItem: (productId: string, size: string, color?: string) => void;
  updateQty: (productId: string, size: string, qty: number, color?: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const isSameItem = (i: CartItem, productId: string, size: string, color?: string) =>
  i.productId === productId && i.size === size && (i.color || '') === (color || '');

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item) => {
        const qtyToAdd = item.qty || 1;
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => isSameItem(i, item.productId, item.size, item.color)
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].qty += qtyToAdd;
            return { items: updated, isDrawerOpen: true };
          } else {
            return {
              items: [...state.items, { ...item, qty: qtyToAdd }],
              isDrawerOpen: true,
            };
          }
        });
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !isSameItem(i, productId, size, color)
          ),
        }));
      },

      updateQty: (productId, size, qty, color) => {
        if (qty <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            isSameItem(i, productId, size, color) ? { ...i, qty } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.qty, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.qty,
          0
        );
      },
    }),
    {
      name: 'iu_cart_storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
