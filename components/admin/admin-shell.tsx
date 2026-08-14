"use client";

import { usePathname } from "next/navigation";
import AdminGuard from "./admin-guard";
import { AdminSidebar } from "./admin-sidebar";

/**
 * Shell visual + de autenticação de todo o painel admin. Fica aqui (e
 * não direto no layout, que é Server Component) porque precisa de
 * usePathname() pra saber se é a tela de login — a única rota /admin/*
 * que não deve ter sidebar nem exigir sessão.
 *
 * AdminGuard passa a envolver TODAS as páginas admin uma única vez
 * aqui, em vez de cada página se proteger individualmente (como só o
 * dashboard fazia antes — pedidos/[id] e pedidos/[id]/orcamento não
 * tinham essa camada extra client-side, só a proteção do middleware).
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-neutral-50">
        <AdminSidebar />
        <main className="md:pl-64">{children}</main>
      </div>
    </AdminGuard>
  );
}
