"use client";

import dynamic from "next/dynamic";

/**
 * Wrapper de import dinâmico do MapaEndereco (Leaflet precisa de
 * window/document, então não pode ser renderizado no servidor).
 * Usar este componente nas páginas em vez de importar mapa-endereco.tsx
 * diretamente.
 */
export const MapaEnderecoLazy = dynamic(
  () => import("./mapa-endereco").then((mod) => mod.MapaEndereco),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Carregando mapa...
      </div>
    ),
  }
);
