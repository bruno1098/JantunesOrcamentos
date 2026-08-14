// Busca pública de um pedido pelo número curto (tela /meus-pedidos).
// Ver app/api/meus-pedidos/email/route.ts para o porquê de ser Route
// Handler e não Server Action (bug isolado nas Server Actions
// experimentais do Next 13.5 ao devolver payloads como Pedido[]).
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { pedidoRowToPedido, type PedidoRow } from "@/lib/supabase/mappers";
import type { BuscarPedidosResult } from "../email/route";
import { anexarOrcamentos } from "../_lib";

const numeroSchema = z
  .string()
  .trim()
  // numero_pedido é gerado por uma sequence numérica
  // (sqls/01_create_pedidos_table.sql), mas aceita só dígitos aqui em
  // vez de casar exatamente com esse formato — não custa ser um pouco
  // mais tolerante na validação de entrada.
  .min(1, "Digite o número do pedido.")
  .regex(/^\d+$/, "Digite apenas os números do pedido (ex: 10042).");

export async function POST(request: Request) {
  let numeroBruto: unknown;
  try {
    const body = await request.json();
    numeroBruto = body?.numero;
  } catch {
    return NextResponse.json<BuscarPedidosResult>(
      { success: false, pedidos: [], message: "Requisição inválida." },
      { status: 400 }
    );
  }

  const parsed = numeroSchema.safeParse(numeroBruto);
  if (!parsed.success) {
    return NextResponse.json<BuscarPedidosResult>({
      success: false,
      pedidos: [],
      message: parsed.error.issues[0]?.message ?? "Digite um número de pedido válido.",
    });
  }

  const numero = parsed.data;

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("search_pedido_by_numero", {
      p_numero: numero,
    });

    if (error) {
      console.error("Erro ao buscar pedido por número:", error);
      return NextResponse.json<BuscarPedidosResult>({
        success: false,
        pedidos: [],
        message: "Não foi possível buscar o pedido agora. Tente novamente em instantes.",
      });
    }

    const pedidosBase = ((data ?? []) as PedidoRow[]).map(pedidoRowToPedido);

    if (pedidosBase.length === 0) {
      return NextResponse.json<BuscarPedidosResult>({
        success: true,
        pedidos: [],
        message: "Nenhum pedido encontrado com este número.",
      });
    }

    const pedidos = await anexarOrcamentos(supabase, pedidosBase);

    return NextResponse.json<BuscarPedidosResult>({ success: true, pedidos });
  } catch (error) {
    console.error("Erro inesperado ao buscar pedido por número:", error);
    return NextResponse.json<BuscarPedidosResult>({
      success: false,
      pedidos: [],
      message: "Não foi possível buscar o pedido agora. Tente novamente em instantes.",
    });
  }
}
