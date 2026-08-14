import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client do Supabase para uso em Server Components, Route Handlers
 * (pages/api ou app/**\/route.ts) e Server Actions.
 *
 * Nota sobre `cookies()`: no Next 13.5 (a versão deste projeto) essa
 * função é SÍNCRONA — não é `await cookies()` como seria a partir do
 * Next 15. Se o projeto for atualizado no futuro, isso precisa mudar.
 *
 * Uso:
 *   const supabase = createClient();
 *   const { data } = await supabase.from("pedidos").select("*");
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` foi chamado a partir de um Server Component (que não
            // pode escrever cookies). Pode ser ignorado com segurança desde
            // que o middleware (lib/supabase/middleware.ts + middleware.ts)
            // esteja renovando a sessão a cada requisição.
          }
        },
      },
      global: {
        // O App Router intercepta o `fetch` global e, por padrão, pode
        // colocar respostas em cache persistente (Data Cache) — inclusive
        // as chamadas que o supabase-js faz por baixo dos panos em
        // .rpc()/.from(). Pra buscas dinâmicas por usuário (e-mail, número
        // do pedido) isso é sempre errado: na melhor das hipóteses fica
        // "preso" numa resposta antiga; na pior, é um pedido de um cliente
        // vazando em cache pra outro. `cache: "no-store"` força toda
        // chamada feita por este client a ir sempre direto no banco.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
