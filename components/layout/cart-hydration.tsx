"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

// Fase 10 — antes este componente escondia TODO o conteúdo de
// `<main>` (retornava `null`) até o carrinho reidratar do
// localStorage, em toda rota pública — inclusive a PDP nova
// (app/(site)/produtos/[id]/page.tsx), cujo SSR só serve pra algo se o
// HTML de verdade chegar no crawler/preview do WhatsApp. Não tinha
// necessidade: o estado inicial do store no server (`items: []`,
// default) e no client antes de reidratar (idem, já que o store usa
// `skipHydration: true` — só carrega do localStorage quando
// `rehydrate()` roda, não sozinho ao montar) são idênticos, então não
// existe risco de mismatch de hidratação em renderizar os filhos na
// hora. `rehydrate()` continua rodando do mesmo jeito, só que como
// efeito colateral puro — os componentes inscritos no store (badge do
// carrinho, StickyCartBar etc.) atualizam sozinhos assim que os dados
// reais chegarem, o que leva bem menos que um frame.
export function CartHydration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}