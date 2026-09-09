// Antes vivia em data/products.ts como `export type Product = (typeof products)[number]`.
// Agora os dados vêm da tabela `produtos` no Supabase (sqls/02_create_produtos_table.sql),
// então o tipo precisa ser declarado explicitamente.

export interface ProdutoDimensoesSimples {
  diametro?: string;
  comprimento?: string;
  largura?: string;
  altura?: string;
  profundidade?: string;
}

export interface ProdutoDimensoesMesaCadeira {
  mesa: { comprimento: string; largura: string; altura: string };
  cadeira: { altura: string; largura: string; profundidade: string };
}

export interface ProductDetails {
  cores?: string[];
  dimensoes?: ProdutoDimensoesSimples | ProdutoDimensoesMesaCadeira;
  material?: string;
  acabamento?: string;
  capacidade?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  /**
   * Retrocompat (Fase 9): sempre igual a `images[0]`. Todo o código que
   * já existia antes do carrossel (pedidos, PDF, e-mail, listagem do
   * admin) continua funcionando sem alteração usando este campo — só o
   * card da vitrine (product-card.tsx) usa `images` de verdade.
   */
  image: string;
  /** Todas as fotos do produto (ex: uma por cor). Sempre tem pelo menos 1 item. */
  images: string[];
  details: ProductDetails;
}

/**
 * Versão do produto usada só no admin (CRUD) — inclui `ativo`, que o
 * catálogo público não precisa saber (a query pública já filtra
 * `ativo = true` no banco).
 */
export interface ProdutoAdmin extends Product {
  ativo: boolean;
}
