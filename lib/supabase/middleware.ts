import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Helper chamado pelo middleware.ts da raiz do projeto (Etapa 4).
 *
 * Duas responsabilidades:
 * 1. Renovar o token de sessão do Supabase se estiver expirado,
 *    reescrevendo o cookie atualizado na response.
 * 2. Devolver o usuário autenticado (se houver) para quem chamou,
 *    para decidir se libera ou redireciona a requisição — sem
 *    precisar chamar `getUser()` de novo.
 *
 * Este arquivo sozinho não protege nada — ele só existe pra ser usado
 * dentro de middleware.ts. Ainda não há middleware.ts na raiz do
 * projeto; ele é criado na Etapa 4.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: não remover esta chamada. É ela que dispara o refresh
  // do token quando necessário e escreve o cookie atualizado via o
  // `setAll` acima — sem isso, sessões expiram silenciosamente.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Devolve `supabase` também: quem chamar (middleware.ts da raiz)
  // precisa fazer mais uma consulta (checar is_admin) e reaproveitar
  // o mesmo client evita reprocessar os cookies da requisição de novo.
  return { supabaseResponse, supabase, user };
}
