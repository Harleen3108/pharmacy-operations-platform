import { create } from 'zustand';

export interface CartItem {
  id: number;
  batch_id: number;
  name: string;
  price: number;
  quantity: number;
  batch_number: string;
  requiresPrescription: boolean;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (newItem) => {
    const items = get().items;
    const existing = items.find(i => i.id === newItem.id);
    if (existing) {
      set({
        items: items.map(i => 
          i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        )
      });
    } else {
      set({ items: [...items, newItem] });
    }
  },
  removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
  updateQuantity: (id, quantity) => set({
    items: get().items.map(i => i.id === id ? { ...i, quantity } : i)
  }),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((acc, i) => acc + (i.price * i.quantity), 0),
}));
