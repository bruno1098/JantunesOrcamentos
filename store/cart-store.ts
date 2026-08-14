"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  observation?: string;
  image: string;
  category: string;
  description: string;
}

const defaultImage = "https://via.placeholder.com/300";

interface CartState {
  items: CartItem[];
  // Estado do Sheet do carrinho, centralizado aqui (não mais local em
  // Navigation) — precisa ser acionável de qualquer lugar (ex: toast de
  // "Ir para o carrinho" em product-card.tsx, StickyCartBar), não só
  // pelo ícone no header.
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'> & { id: number | string }) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
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
            id: itemId,
            image: item.image || defaultImage
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
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
      // Só `items` precisa sobreviver a um reload — `isCartOpen` é
      // estado de UI efêmero; sem isso, o Sheet do carrinho reabriria
      // sozinho ao recarregar a página se tivesse ficado aberto.
      partialize: (state) => ({ items: state.items }),
    }
  )
);