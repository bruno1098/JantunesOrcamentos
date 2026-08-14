import { Pedido } from "@/types/pedido";
import { Orcamento } from "@/types/orcamento";
import { createClient } from "./supabase/client";
import {
  PedidoRow,
  OrcamentoRow,
  pedidoRowToPedido,
  novoPedidoToRpcParams,
  pedidoUpdateToRow,
  orcamentoRowToOrcamento,
  orcamentoToRow,
} from "./supabase/mappers";

// Todas as funções aqui usam o client "browser" do Supabase (RLS +
// sessão do usuário logado decidem o que cada chamada pode ver/fazer —
// ver sqls/01_create_pedidos_table.sql). Isso é intencional: hoje este
// arquivo é importado só por Client Components ("use client"), o mesmo
// padrão de antes com o Firebase SDK. Operações de admin (listar todos
// os pedidos, atualizar status) só vão funcionar de fato depois que a
// Etapa 4 (login real do admin) estiver no ar — até lá, RLS bloqueia
// essas leituras/escritas para quem não está autenticado como admin.

export async function salvarPedido(pedido: Omit<Pedido, "id">): Promise<string> {
  const supabase = createClient();

  try {
    // Não é um .insert() direto na tabela de propósito: a policy de
    // RLS de "pedidos" não libera SELECT para "anon", e o Supabase
    // tenta ler a linha de volta (RETURNING) depois de um insert via
    // REST. A RPC `criar_pedido` (SECURITY DEFINER) contorna isso sem
    // precisar abrir leitura pública na tabela inteira.
    const { data, error } = await supabase
      .rpc("criar_pedido", novoPedidoToRpcParams(pedido))
      .single();

    if (error) throw error;
    if (!data) throw new Error("A criação do pedido não retornou dados.");

    return (data as { numero_pedido: string }).numero_pedido;
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    throw error;
  }
}

// Não há mais uma `buscarPedidoPorEmail` client-side aqui de propósito:
// a busca pública por e-mail (e por número) agora só acontece via Route
// Handler (app/api/meus-pedidos/email|numero/route.ts — era Server
// Action até a Fase 6, ver comentário lá do porquê da troca), que chama
// a mesma RPC `search_pedidos_by_email`/`search_pedido_by_numero` a
// partir do servidor — nunca do browser.
// Isso evita reabrir o caminho antigo (e-mail exposto em query string).

export async function buscarPedidoPorId(id: string): Promise<Pedido | null> {
  const supabase = createClient();

  try {
    // Uso admin-only (painel /admin) — RLS exige sessão de admin
    // autenticado para retornar qualquer linha aqui.
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("numero_pedido", id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      console.log(`Nenhum pedido encontrado com o ID: ${id}`);
      return null;
    }

    return pedidoRowToPedido(data as PedidoRow);
  } catch (error) {
    console.error("Erro ao buscar pedido por ID:", error);
    throw error;
  }
}

export async function buscarTodosPedidos(): Promise<Pedido[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return (data as PedidoRow[]).map(pedidoRowToPedido);
  } catch (error) {
    console.error("Erro ao buscar todos os pedidos:", error);
    throw error;
  }
}

export async function atualizarStatusPedido(pedidoId: string, novoStatus: string): Promise<void> {
  const supabase = createClient();

  try {
    // `data_atualizacao` não é passado — o trigger set_data_atualizacao()
    // (01_create_pedidos_table.sql) cuida disso sozinho a cada UPDATE.
    const { error } = await supabase
      .from("pedidos")
      .update({ status: novoStatus })
      .eq("numero_pedido", pedidoId);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
}

export async function atualizarPedido(id: string, dados: Partial<Pedido>): Promise<void> {
  const supabase = createClient();

  try {
    const row = pedidoUpdateToRow(dados);

    const { error } = await supabase
      .from("pedidos")
      .update(row)
      .eq("numero_pedido", id);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    throw error;
  }
}

// ---------------------------------------------------------------------
// Orçamentos
//
// Novo nesta migração: antes, o orçamento com valores preenchido pelo
// admin em /admin/pedidos/[id]/orcamento só existia em memória na tela
// e virava PDF — se a aba fechasse antes do PDF ser salvo, o trabalho
// de precificação se perdia. Agora fica persistido em `orcamentos`,
// um por pedido (upsert por pedido_id).
// ---------------------------------------------------------------------

export async function salvarOrcamento(pedidoUuid: string, orcamento: Orcamento): Promise<void> {
  const supabase = createClient();

  try {
    const row = orcamentoToRow(orcamento, pedidoUuid);

    const { error } = await supabase
      .from("orcamentos")
      .upsert(row, { onConflict: "pedido_id" });

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao salvar orçamento:", error);
    throw error;
  }
}

export async function buscarOrcamentoPorPedido(
  pedidoUuid: string,
  numeroPedido: string
): Promise<Orcamento | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("orcamentos")
      .select("*")
      .eq("pedido_id", pedidoUuid)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return orcamentoRowToOrcamento(data as OrcamentoRow, numeroPedido);
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    throw error;
  }
}
