"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { isValidImageUrl } from "@/lib/image-utils";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

/**
 * Fotos do produto na vitrine (Fase 9). Usado dentro de
 * components/produtos/product-card.tsx — como esse mesmo componente já
 * é reaproveitado em /produtos e na Home (components/home/catalogo-preview.tsx),
 * os dois ganham o carrossel automaticamente, sem precisar mexer neles.
 *
 * Com 1 imagem só, cai pra um <Image> simples — sem dots à toa pra um
 * produto que só tem uma foto.
 *
 * Sem CarouselPrevious/CarouselNext de propósito (Fase 10): desde que
 * o card virou um <Link> pra PDP, esses botões ficariam aninhados
 * dentro do <a> que o Link renderiza — HTML inválido (interactive
 * content dentro de interactive content) e quebra teclado/leitor de
 * tela. Navegar entre fotos aqui é só swipe/drag (o Embla já trata
 * isso nativamente em cima de uma <div>, sem precisar de <button>); a
 * navegação com setas de verdade agora vive na PDP
 * (components/produtos/produto-galeria.tsx).
 */
export function ProductImageCarousel({ images, alt, className }: ProductImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [slideAtual, setSlideAtual] = useState(0);

  useEffect(() => {
    if (!api) return;
    setSlideAtual(api.selectedScrollSnap());
    api.on("select", () => setSlideAtual(api.selectedScrollSnap()));
  }, [api]);

  // Alguns produtos no banco hoje têm `imagem_url` vazio (confirmado
  // direto na base ao implementar isso, não é hipotético — pelo menos 6
  // produtos reais estão assim). Filtra pra nunca passar "" como src
  // pro <Image>, que quebra em vez de degradar graciosamente.
  const imagensValidas = images.filter(isValidImageUrl);

  if (imagensValidas.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
        <ImageOff className="h-8 w-8 text-neutral-400" />
      </div>
    );
  }

  if (imagensValidas.length === 1) {
    return <Image src={imagensValidas[0]} alt={alt} fill className={className ?? "object-cover"} />;
  }

  return (
    <Carousel setApi={setApi} opts={{ loop: true }} className="h-full w-full">
      <CarouselContent className="ml-0">
        {imagensValidas.map((src, index) => (
          <CarouselItem key={index} className="relative h-48 pl-0 sm:h-64">
            <Image src={src} alt={`${alt} — foto ${index + 1}`} fill className={className ?? "object-cover"} />
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Dots — só indicador visual (span, não button), navegação é por
          swipe/drag. Ver comentário acima sobre por que não tem setas. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
        {imagensValidas.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              index === slideAtual ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </Carousel>
  );
}
