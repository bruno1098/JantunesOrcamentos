"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/produtos/product-card";
import { ProductSkeleton } from "@/components/produtos/product-skeleton";
import { buscarProdutos } from "@/lib/produtos-service";
import { Product } from "@/types/product";

// Versão simplificada das categorias de ProductFilter — pra uma prévia
// compacta na Home não faz sentido separar toalhas redondas/quadradas/
// retangulares em abas próprias como em /produtos.
const ABAS = [
  { id: "all", label: "Todos" },
  { id: "toalhas", label: "Toalhas" },
  { id: "guardanapos", label: "Guardanapos" },
  { id: "trilhos", label: "Trilhos" },
  { id: "mobiliario", label: "Mobiliário" },
] as const;

const LIMITE_ITENS = 8;

function pertenceAba(product: Product, aba: string) {
  if (aba === "all") return true;
  if (aba === "toalhas") return product.category.startsWith("toalhas");
  return product.category === aba;
}

/**
 * Substitui a antiga "Nossa Coleção Premium" (3 fotos hardcoded que não
 * vinham do catálogo real) — grid conectado ao Supabase, com o mesmo
 * ProductCard/fluxo de carrinho de /produtos, direto na Home (Fase 7).
 */
export function CatalogoPreview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<string>("all");
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const resultado = await buscarProdutos();
        if (!cancelado) setProducts(resultado);
      } catch (error) {
        console.error("Erro ao carregar produtos (Home):", error);
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  const produtosFiltrados = products.filter((p) => pertenceAba(p, abaAtiva)).slice(0, LIMITE_ITENS);

  return (
    <section id="catalogo" className="scroll-mt-20 bg-neutral-50 px-4 py-20 dark:bg-neutral-900 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center text-4xl font-bold md:text-5xl"
        >
          Monte seu Orçamento
        </motion.h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-neutral-600 dark:text-neutral-300">
          Escolha os produtos direto aqui e adicione ao seu orçamento — sem precisar sair da página.
        </p>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {ABAS.map((aba) => (
            <Button
              key={aba.id}
              variant={abaAtiva === aba.id ? "default" : "outline"}
              size="sm"
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {isLoading
            ? Array(LIMITE_ITENS)
                .fill(0)
                .map((_, index) => <ProductSkeleton key={index} />)
            : produtosFiltrados.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
        </div>

        {!isLoading && produtosFiltrados.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Nenhum produto nesta categoria no momento.
          </p>
        )}

        <div className="mt-12 text-center">
          <Link href="/produtos">
            <Button size="lg" className="group">
              Ver catálogo completo
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
