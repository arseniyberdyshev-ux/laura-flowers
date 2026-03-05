// src/store/useCart.ts
import { create } from 'zustand';

interface CartItem {
  id: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (id: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  addItem: (id) => set((state) => {
    const existing = state.items.find(i => i.id === id);
    if (existing) {
      return { items: state.items.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i) };
    }
    return { items: [...state.items, { id, quantity: 1 }] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  clearCart: () => set({ items: [] }),
}));