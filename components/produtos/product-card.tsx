"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { ProductImageCarousel } from "@/components/produtos/product-image-carousel";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index: number;
}

/**
 * Card da vitrine (Fase 10) — o card inteiro agora é um Link pra PDP
 * (app/(site)/produtos/[id]/page.tsx). Toda a lógica de adicionar ao
 * orçamento (seleção de cor, quantidade, Zustand, toast) saiu daqui —
 * mora em components/produtos/produto-detalhes-painel.tsx agora. O
 * botão "Orçar" abaixo é só visual: não é um <button> de verdade
 * (aninhar um <button> dentro do <a> que o <Link> renderiza é HTML
 * inválido e quebra navegação por teclado/leitor de tela) — é um <span>
 * estilizado com o mesmo buttonVariants do componente Button real, e o
 * clique nele já é capturado pelo Link que envolve o card inteiro.
 */
export function ProductCard({ product, index }: ProductCardProps) {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        delay: index * 0.1, // Efeito cascata
        ease: [0.23, 1, 0.32, 1],
        scale: {
          type: "spring",
          damping: 15,
          stiffness: 100,
        },
      },
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <Link href={`/produtos/${product.id}`} className="block h-full">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-neutral-800"
      >
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <ProductImageCarousel
            images={product.images}
            alt={product.name}
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <CardContent className="p-3 sm:p-6 flex-grow">
          <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base line-clamp-3">
            {product.description}
          </p>
        </CardContent>
        <CardFooter className="p-3 sm:p-6 pt-0">
          <span
            className={cn(
              buttonVariants({ size: "default" }),
              "w-full min-h-[44px] py-3 text-sm sm:py-2 sm:text-base pointer-events-none"
            )}
          >
            <ShoppingCart className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Orçar</span>
          </span>
        </CardFooter>
      </motion.div>
    </Link>
  );
}
