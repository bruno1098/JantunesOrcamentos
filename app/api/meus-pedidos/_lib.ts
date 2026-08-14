// Helper compartilhado entre os dois Route Handlers de /meus-pedidos
// (email/route.ts, numero/route.ts). Não é uma rota — Next só trata
// como rota arquivos `route.ts`/`page.tsx` etc., então isto é só um
// módulo comum de verdade.
import { createClient } from "@/lib/supabase/server";
import { orcamentoRowToOrcamento, type OrcamentoRow } from "@/lib/supabase/mappers";
import type { Orcamento } from "@/types/orcamento";
import type { Pedido } from "@/types/pedido";

export interface PedidoComOrcamento extends Pedido {
  /** `null` = admin ainda não precificou este pedido. */
  orcamento: Orcamento | null;
}

/**
 * Busca o orçamento (valores) de cada pedido via a função pública
 * `buscar_orcamento_por_pedido` (sqls/09_create_buscar_orcamento_by_pedido_function.sql)
 * e anexa ao pedido correspondente. Pedidos ainda não precificados
 * (nenhuma linha em `orcamentos`) voltam com `orcamento: null` — a UI
 * trata isso mostrando "aguardando precificação" em vez de valores.
 */
export async function anexarOrcamentos(
  supabase: ReturnType<typeof createClient>,
  pedidos: Pedido[]
): Promise<PedidoComOrcamento[]> {
  return Promise.all(
    pedidos.map(async (pedido): Promise<PedidoComOrcamento> => {
      if (!pedido.pedidoUuid) {
        return { ...pedido, orcamento: null };
      }

      const { data, error } = await supabase.rpc("buscar_orcamento_por_pedido", {
        p_pedido_id: pedido.pedidoUuid,
      });

      if (error) {
        console.error(`Erro ao buscar orçamento do pedido #${pedido.id}:`, error);
        return { ...pedido, orcamento: null };
      }

      const linha = ((data ?? []) as OrcamentoRow[])[0];
      if (!linha) {
        return { ...pedido, orcamento: null };
      }

      return { ...pedido, orcamento: orcamentoRowToOrcamento(linha, pedido.id) };
    })
  );
}
