import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: any[];
  addItem: (item: any) => void;
  removeItem: (id: number | string) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => String(item.id) === String(newItem.id));

        if (existingItem) {
          // Если букет уже есть — просто увеличиваем количество
          set({
            items: currentItems.map((item) =>
              String(item.id) === String(newItem.id)
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            ),
          });
        } else {
          // Если нет — добавляем как новый со всеми картинками и ценами
          set({ items: [...currentItems, { ...newItem, quantity: 1 }] });
        }
      },
      removeItem: (id) =>
        set({
          items: get().items.filter((item) => String(item.id) !== String(id)),
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      // МАГИЯ ЗДЕСЬ: Новое имя заставит браузер забыть старые ошибки
      name: 'laura-flowers-cart-v2', 
    }
  )
);