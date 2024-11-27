"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/data/products';

export interface CartItem extends Omit<Product, 'id'> {
  id: string;
  quantity: number;
  observation?: string;
  image: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'> & { id: number | string }) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const itemId = String(item.id);
          const existingItem = state.items.find(i => i.id === itemId);
          
          if (existingItem) {
            return {
              items: state.items.map(i =>
                i.id === itemId
                  ? { ...i, quantity: i.quantity + item.quantity, observation: item.observation || i.observation }
                  : i
              ),
            };
          }
          
          const newItem: CartItem = {
            ...item,
            id: itemId
          };
          
          return { items: [...state.items, newItem] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter(item => item.id !== id),
        })),
      updateItemQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map(item =>
            item.id === id
              ? { ...item, quantity }
              : item
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
    }
  )
);