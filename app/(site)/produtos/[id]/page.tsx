import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { produtoRowToProduct, type ProdutoRow } from "@/lib/supabase/mappers";
import type { Product } from "@/types/product";
import { ProdutoGaleria } from "@/components/produtos/produto-galeria";
import { ProdutoDetalhesPainel } from "@/components/produtos/produto-detalhes-painel";

interface PageProps {
  params: { id: string };
}

// Server Component de propósito (não client-fetch como /produtos) —
// PDP é exatamente o tipo de página que se beneficia de SSR de verdade:
// título/descrição por produto pro Google, e uma prévia com imagem real
// quando o link é compartilhado no WhatsApp (o principal canal de venda
// deste negócio). generateMetadata roda no servidor e não depende de
// nenhum client component pra existir.
async function buscarProdutoPublico(id: string): Promise<Product | null> {
  const idNumero = Number(id);
  if (!Number.isFinite(idNumero)) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("id", idNumero)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
  if (!data) return null;

  return produtoRowToProduct(data as ProdutoRow);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const produto = await buscarProdutoPublico(params.id);

  if (!produto) {
    return { title: "Produto não encontrado" };
  }

  const imagemPrincipal = produto.images.filter(Boolean)[0];

  return {
    title: produto.name,
    description: produto.description,
    openGraph: {
      title: produto.name,
      description: produto.description,
      images: imagemPrincipal ? [{ url: imagemPrincipal }] : undefined,
    },
  };
}

export default async function ProdutoPage({ params }: PageProps) {
  const produto = await buscarProdutoPublico(params.id);

  if (!produto) {
    notFound();
  }

  return (
    // pt-24: a Navigation é `fixed` (h-16) e fica por cima do conteúdo,
    // não empurra ele — mesmo valor já usado em /about e /orcamento
    // pra compensar isso.
    <div className="container mx-auto px-4 pb-8 pt-24 md:pb-12 md:pt-28">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <ProdutoGaleria images={produto.images} alt={produto.name} />
        <ProdutoDetalhesPainel produto={produto} />
      </div>
    </div>
  );
}
