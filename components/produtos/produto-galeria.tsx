"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { isValidImageUrl } from "@/lib/image-utils";

interface ProdutoGaleriaProps {
  images: string[];
  alt: string;
}

/**
 * Galeria da PDP (Fase 10) — imagem grande + tira de miniaturas clicável.
 * Layout diferente do carrossel do card (components/produtos/product-image-carousel.tsx):
 * ali o espaço é pequeno e o carrossel precisa ser compacto; aqui é a
 * coluna inteira da página, então um "imagem grande + thumbnails" no
 * estilo Mercado Livre/Amazon aproveita melhor o espaço.
 */
export function ProdutoGaleria({ images, alt }: ProdutoGaleriaProps) {
  const imagensValidas = images.filter(isValidImageUrl);
  const [indiceAtivo, setIndiceAtivo] = useState(0);

  if (imagensValidas.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <ImageOff className="h-10 w-10 text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={imagensValidas[indiceAtivo]}
          alt={`${alt} — foto ${indiceAtivo + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {imagensValidas.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imagensValidas.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndiceAtivo(index)}
              aria-label={`Ver foto ${index + 1}`}
              aria-current={index === indiceAtivo}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                index === indiceAtivo
                  ? "border-primary"
                  : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
