"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

// Rotas onde a barra não deve aparecer: /orcamento já é o próprio
// destino que ela indica (redundante), e as rotas de admin têm seu
// próprio layout isolado (não usam este componente de qualquer forma).
const ROTAS_OCULTAS = ["/orcamento"];

/**
 * Barra fixa no rodapé (só mobile) que aparece quando há itens no
 * carrinho, guiando direto para `/orcamento` — fecha o "dead end" de
 * quem adiciona um item e não sabe mais como continuar (Fase 7).
 */
export function StickyCartBar() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);

  const totalItens = items.reduce((soma, item) => soma + item.quantity, 0);
  const oculta = ROTAS_OCULTAS.some((rota) => pathname?.startsWith(rota));

  const visivel = totalItens > 0 && !oculta;

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 md:hidden"
        >
          <Link
            href="/orcamento"
            className="flex items-center justify-between gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground"
          >
            <span className="flex items-center gap-2 font-medium">
              <ShoppingCart className="h-5 w-5" />
              {totalItens} {totalItens === 1 ? "item" : "itens"} no orçamento
            </span>
            <span className="text-sm font-semibold underline underline-offset-2">
              Ver Orçamento
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
