"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

export function CartHydration({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const state = useCartStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
} 