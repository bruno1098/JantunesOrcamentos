import { Product, ProdutoAdmin } from "@/types/product";
import { createClient } from "./supabase/client";
import { ProdutoRow, produtoRowToProduct, produtoRowToProdutoAdmin } from "./supabase/mappers";

/**
 * Catálogo de produtos — antes era o array estático em data/products.ts,
 * agora vem da tabela `produtos` (sqls/02_create_produtos_table.sql).
 * RLS: leitura pública para produtos com `ativo = true`, sem precisar
 * de sessão — por isso o client "browser" simples já basta aqui.
 */
export async function buscarProdutos(): Promise<Product[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("id", { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return (data as ProdutoRow[]).map(produtoRowToProduct);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
}

/**
 * Usado só pelo admin: traz TODOS os produtos (ativos e inativos),
 * com o campo `ativo` visível. A RLS já libera isso pra quem está
 * autenticado como admin (sqls/02_create_produtos_table.sql).
 */
export async function buscarProdutosAdmin(): Promise<ProdutoAdmin[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return (data as ProdutoRow[]).map(produtoRowToProdutoAdmin);
  } catch (error) {
    console.error("Erro ao buscar produtos (admin):", error);
    throw error;
  }
}
