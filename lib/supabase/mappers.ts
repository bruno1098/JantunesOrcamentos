import { Pedido, ItemPedido, Endereco } from "@/types/pedido";
import { Orcamento, ItemOrcamento } from "@/types/orcamento";
import { Product, ProductDetails, ProdutoAdmin } from "@/types/product";

/**
 * Mappers entre o formato das tabelas do Postgres (snake_case) e as
 * interfaces camelCase que o resto da aplicação já espera (types/).
 * Nenhum call site fora de lib/pedidos-service.ts deveria importar
 * este arquivo diretamente.
 */

// ---------------------------------------------------------------------
// pedidos
// ---------------------------------------------------------------------

/** Formato de uma linha da tabela `pedidos` (ou do retorno da RPC search_pedidos_by_email). */
export interface PedidoRow {
  id: string;
  numero_pedido: string;
  nome_evento: string;
  email: string;
  data_entrega: string; // date -> "YYYY-MM-DD"
  data_retirada: string; // date -> "YYYY-MM-DD"
  status: string;
  endereco: Endereco;
  itens: ItemPedido[];
  mensagem: string | null;
  criado_em: string; // timestamptz -> ISO string
  data_atualizacao: string; // timestamptz -> ISO string
}

/**
 * Converte uma data "pura" (YYYY-MM-DD, sem hora) vinda do Postgres em
 * uma string que `new Date(...)` interpreta como MEIA-NOITE LOCAL, não
 * UTC. Isso importa porque `new Date("2026-08-20")` (sem hora) é
 * interpretado pelo JS como UTC — em fusos negativos (Brasil, UTC-3)
 * isso exibe um dia a menos ao formatar de volta com toLocaleDateString.
 * Anexando "T00:00:00" (sem "Z"/offset) força interpretação local, que
 * é o comportamento que todo o resto do app (meus-pedidos, PDF, admin)
 * já espera desde a época do Firestore.
 */
function dateOnlyToLocalIso(dateOnly: string): string {
  return `${dateOnly}T00:00:00`;
}

/** Inverso: extrai só a parte de data de uma string ISO (local ou UTC). */
function isoToDateOnly(value: string): string {
  return value.slice(0, 10);
}

export function pedidoRowToPedido(row: PedidoRow): Pedido {
  return {
    id: row.numero_pedido,
    pedidoUuid: row.id,
    nomeEvento: row.nome_evento,
    data: row.criado_em,
    dataEntrega: dateOnlyToLocalIso(row.data_entrega),
    dataRetirada: dateOnlyToLocalIso(row.data_retirada),
    status: row.status,
    email: row.email,
    endereco: row.endereco,
    itens: row.itens,
    mensagem: row.mensagem ?? undefined,
    dataAtualizacao: row.data_atualizacao,
  };
}

/** Para criar um pedido novo — usado pelos parâmetros da RPC `criar_pedido`. */
export function novoPedidoToRpcParams(pedido: Omit<Pedido, "id" | "pedidoUuid">) {
  return {
    p_nome_evento: pedido.nomeEvento,
    p_email: pedido.email.toLowerCase().trim(),
    p_data_entrega: isoToDateOnly(pedido.dataEntrega),
    p_data_retirada: isoToDateOnly(pedido.dataRetirada),
    p_endereco: pedido.endereco,
    p_itens: pedido.itens,
    p_mensagem: pedido.mensagem || null,
  };
}

/** Para UPDATE parcial (atualizarPedido) — só mapeia os campos presentes. */
export function pedidoUpdateToRow(dados: Partial<Pedido>): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (dados.nomeEvento !== undefined) row.nome_evento = dados.nomeEvento;
  if (dados.email !== undefined) row.email = dados.email.toLowerCase().trim();
  if (dados.dataEntrega !== undefined) row.data_entrega = isoToDateOnly(dados.dataEntrega);
  if (dados.dataRetirada !== undefined) row.data_retirada = isoToDateOnly(dados.dataRetirada);
  if (dados.status !== undefined) row.status = dados.status;
  if (dados.endereco !== undefined) row.endereco = dados.endereco;
  if (dados.itens !== undefined) row.itens = dados.itens;
  if (dados.mensagem !== undefined) row.mensagem = dados.mensagem || null;
  // numero_pedido, criado_em e data_atualizacao nunca são setados pelo
  // client: o primeiro é gerado pela sequence, os outros dois são
  // gerenciados pelo Postgres (default/trigger). Se `dados` trouxer
  // `dataAtualizacao` (código legado), é ignorado de propósito.

  return row;
}

// ---------------------------------------------------------------------
// orcamentos
// ---------------------------------------------------------------------

export interface OrcamentoRow {
  id: string;
  pedido_id: string;
  itens: ItemOrcamento[];
  valor_frete: number | string; // PostgREST pode devolver `numeric` como string
  valor_total: number | string;
  observacoes: string | null;
  forma_pagamento: string | null;
  data_validade: string;
  criado_em: string;
  atualizado_em: string;
}

export function orcamentoRowToOrcamento(row: OrcamentoRow, numeroPedido: string): Orcamento {
  return {
    pedidoId: numeroPedido,
    itens: row.itens,
    valorFrete: Number(row.valor_frete),
    valorTotal: Number(row.valor_total),
    observacoes: row.observacoes ?? "",
    dataValidade: new Date(dateOnlyToLocalIso(row.data_validade)),
    formaPagamento: row.forma_pagamento ?? "",
  };
}

/** `pedidoUuid` (não `pedidoId`/numero_pedido!) — é o FK real da tabela. */
export function orcamentoToRow(orcamento: Orcamento, pedidoUuid: string) {
  return {
    pedido_id: pedidoUuid,
    itens: orcamento.itens,
    valor_frete: orcamento.valorFrete,
    valor_total: orcamento.valorTotal,
    observacoes: orcamento.observacoes || null,
    forma_pagamento: orcamento.formaPagamento || null,
    data_validade: isoToDateOnly(orcamento.dataValidade.toISOString()),
  };
}

// ---------------------------------------------------------------------
// produtos
// ---------------------------------------------------------------------

/** Formato de uma linha da tabela `produtos` (sqls/02_create_produtos_table.sql + 10_add_multiple_images_to_produtos.sql). */
export interface ProdutoRow {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
  imagem_url: string;
  /** Pode vir `null`/vazio em teoria (linha pré-migração sem backfill) — por isso o fallback abaixo. */
  imagens: string[] | null;
  detalhes: ProductDetails;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export function produtoRowToProduct(row: ProdutoRow): Product {
  const images = row.imagens && row.imagens.length > 0 ? row.imagens : [row.imagem_url];
  return {
    id: row.id,
    name: row.nome,
    category: row.categoria,
    description: row.descricao,
    image: images[0],
    images,
    details: row.detalhes,
  };
}

/** Versão admin do mapper — inclui `ativo` (ver types/product.ts). */
export function produtoRowToProdutoAdmin(row: ProdutoRow): ProdutoAdmin {
  return {
    ...produtoRowToProduct(row),
    ativo: row.ativo,
  };
}
