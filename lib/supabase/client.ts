"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client do Supabase para uso em Client Components ("use client").
 * Gerencia a sessão via cookies do navegador automaticamente.
 *
 * Uso:
 *   const supabase = createClient();
 *   const { data } = await supabase.from("produtos").select("*");
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
