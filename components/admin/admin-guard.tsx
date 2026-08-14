"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Camada extra de proteção, client-side. A barreira de verdade é o
 * middleware.ts da raiz — ele já bloqueia acesso não autenticado a
 * qualquer /admin/* antes mesmo da página carregar, checando sessão
 * do Supabase Auth + allow-list em public.admins.
 *
 * Este componente cobre um caso que o middleware não cobre sozinho:
 * a sessão expirar (ou o admin deslogar em outra aba) enquanto ele já
 * está com uma página /admin/* aberta, sem navegar de novo — o que
 * não dispara o middleware. Sem isso, a tela ficaria exibindo dados
 * vazios (a RLS passaria a barrar as queries) em vez de mandar o
 * admin de volta pro login.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const verificarSessao = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
        return;
      }

      setIsAuthorized(true);
    };

    verificarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
