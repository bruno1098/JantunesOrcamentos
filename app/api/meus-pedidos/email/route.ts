// Busca pública de pedidos por e-mail (tela /meus-pedidos).
//
// Por quê Route Handler e não Server Action: era uma Server Action
// (app/(site)/meus-pedidos/actions.ts) até a Fase 6, mas isolei um bug
// nas Server Actions experimentais do Next 13.5 — o mesmíssimo código
// (createClient + supabase.rpc + mapper) devolvia os dados certos
// quando testado direto (confirmado com curl contra este Route
// Handler), mas a Server Action resolvia como `undefined` no client,
// mesmo depois de hard refresh, restart do dev server e outro
// navegador. Suspeita: falha de serialização do payload (array de
// pedidos com itens/endereço aninhados) no transporte experimental de
// Server Actions dessa versão. Route Handler é uma API estável (não
// experimental) no Next 13.5, então tira essa variável da equação.
//
// O e-mail buscado continua nunca aparecendo em URL/query string — vai
// só no corpo do POST, mesma garantia de antes contra o IDOR original.
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { pedidoRowToPedido, type PedidoRow } from "@/lib/supabase/mappers";
import { anexarOrcamentos, type PedidoComOrcamento } from "../_lib";

export interface BuscarPedidosResult {
  success: boolean;
  pedidos: PedidoComOrcamento[];
  message?: string;
}

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Digite um e-mail.")
  .email("Digite um e-mail válido.");

export async function POST(request: Request) {
  let emailBruto: unknown;
  try {
    const body = await request.json();
    emailBruto = body?.email;
  } catch {
    return NextResponse.json<BuscarPedidosResult>(
      { success: false, pedidos: [], message: "Requisição inválida." },
      { status: 400 }
    );
  }

  const parsed = emailSchema.safeParse(emailBruto);
  if (!parsed.success) {
    return NextResponse.json<BuscarPedidosResult>({
      success: false,
      pedidos: [],
      message: parsed.error.issues[0]?.message ?? "Digite um e-mail válido.",
    });
  }

  const email = parsed.data;

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("search_pedidos_by_email", {
      busca_email: email,
    });

    if (error) {
      console.error("Erro ao buscar pedidos por e-mail:", error);
      return NextResponse.json<BuscarPedidosResult>({
        success: false,
        pedidos: [],
        message: "Não foi possível buscar seus pedidos agora. Tente novamente em instantes.",
      });
    }

    const pedidosBase = ((data ?? []) as PedidoRow[]).map(pedidoRowToPedido);

    if (pedidosBase.length === 0) {
      return NextResponse.json<BuscarPedidosResult>({
        success: true,
        pedidos: [],
        message: "Nenhum pedido encontrado para este e-mail.",
      });
    }

    const pedidos = await anexarOrcamentos(supabase, pedidosBase);

    return NextResponse.json<BuscarPedidosResult>({ success: true, pedidos });
  } catch (error) {
    console.error("Erro inesperado ao buscar pedidos:", error);
    return NextResponse.json<BuscarPedidosResult>({
      success: false,
      pedidos: [],
      message: "Não foi possível buscar seus pedidos agora. Tente novamente em instantes.",
    });
  }
}
