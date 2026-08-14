import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const LOGIN_PATH = "/admin/login";

/**
 * Redireciona preservando os cookies de `base` (a response que veio de
 * updateSession()). Isso importa porque, se o token de sessão acabou
 * de ser renovado nesta mesma requisição, o cookie atualizado está em
 * `base` — um NextResponse.redirect() novo, sem esses cookies, jogaria
 * fora esse refresh e forçaria mais um logout/relogin desnecessário.
 */
function redirectTo(request: NextRequest, path: string, base: NextResponse) {
  const url = new URL(path, request.url);
  const response = NextResponse.redirect(url);
  base.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const { supabaseResponse, supabase, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return supabaseResponse;
  }

  const isLoginRoute = pathname === LOGIN_PATH;

  // Já logado como admin de verdade tentando acessar a tela de login:
  // não faz sentido, manda direto pro dashboard.
  if (isLoginRoute) {
    if (user) {
      const { data: isAdmin } = await supabase.rpc("is_admin", { uid: user.id });
      if (isAdmin) {
        return redirectTo(request, "/admin/dashboard", supabaseResponse);
      }
    }
    return supabaseResponse;
  }

  // Qualquer outra rota /admin/*: exige sessão válida do Supabase Auth...
  if (!user) {
    return redirectTo(request, LOGIN_PATH, supabaseResponse);
  }

  // ...E que o usuário esteja na allow-list de admins (public.admins).
  // Ter uma sessão válida não basta — qualquer conta do Supabase Auth
  // teria sessão válida, só quem está em public.admins é admin de fato.
  const { data: isAdmin, error } = await supabase.rpc("is_admin", { uid: user.id });

  if (error || !isAdmin) {
    return redirectTo(request, LOGIN_PATH, supabaseResponse);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
