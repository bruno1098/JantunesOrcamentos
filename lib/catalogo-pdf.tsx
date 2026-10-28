import { format } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import { CatalogoPDF, type GrupoCatalogo } from "@/components/admin/catalogo-pdf";
import { CATEGORIAS_PRODUTO } from "@/lib/constants";
import { carregarLogo, prepararFotos } from "@/lib/catalogo-imagens";
import type { ProdutoAdmin } from "@/types/product";

/**
 * Esta função fica num módulo próprio porque puxa @react-pdf/renderer
 * (pesado) e o componente do PDF, que lê `window` ao carregar: a tela de
 * pré-visualização (app/admin/produtos/catalogo) só a importa
 * dinamicamente, dentro de um efeito (nunca no render, que também roda no servidor).
 */

/** Slug sem rótulo cadastrado (categoria nova) → "toalhas-novas" vira "Toalhas Novas". */
function rotuloDaCategoria(slug: string): string {
  const cadastrada = CATEGORIAS_PRODUTO.find((c) => c.value === slug);
  if (cadastrada) return cadastrada.label;
  return slug
    .split("-")
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
}

/** Mantém a ordem do site público: produtos por id, categorias na ordem em que aparecem. */
function agruparPorCategoria(produtos: ProdutoAdmin[]): GrupoCatalogo[] {
  const grupos: GrupoCatalogo[] = [];
  produtos.forEach((produto) => {
    let grupo = grupos.find((g) => g.slug === produto.category);
    if (!grupo) {
      grupo = { slug: produto.category, nome: rotuloDaCategoria(produto.category), produtos: [] };
      grupos.push(grupo);
    }
    grupo.produtos.push(produto);
  });
  return grupos;
}

export interface CatalogoGerado {
  blob: Blob;
  nomeArquivo: string;
  produtos: number;
  /** Produtos cuja foto não pôde ser usada (saem com o quadro "Sem foto"). */
  semFoto: number;
}

/** Gera o catálogo com os produtos ATIVOS. Quem chama decide se mostra ou baixa o PDF. */
export async function gerarCatalogoPDF(
  todosProdutos: ProdutoAdmin[],
  onProgressoFotos?: (feitas: number, total: number) => void
): Promise<CatalogoGerado> {
  const produtos = todosProdutos.filter((p) => p.ativo);
  if (produtos.length === 0) {
    throw new Error("Nenhum produto ativo para o catálogo.");
  }

  const [fotos, logo] = await Promise.all([
    prepararFotos(
      produtos.map((p) => p.image),
      onProgressoFotos
    ),
    carregarLogo(),
  ]);

  const geradoEm = new Date();
  const blob = await pdf(
    <CatalogoPDF grupos={agruparPorCategoria(produtos)} fotos={fotos} logo={logo} geradoEm={geradoEm} />
  ).toBlob();

  return {
    blob,
    nomeArquivo: `catalogo-j-antunes-${format(geradoEm, "yyyy-MM-dd")}.pdf`,
    produtos: produtos.length,
    semFoto: produtos.filter((p) => !fotos[p.image]).length,
  };
}
