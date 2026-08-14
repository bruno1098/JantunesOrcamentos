-- =====================================================================
-- 08_create_search_pedido_by_numero_function.sql
--
-- Fase 6 — nova opção em /meus-pedidos: buscar pelo número curto do
-- pedido (numero_pedido, ex: "10042") em vez de e-mail.
--
-- Mesmo raciocínio de segurança do 04_create_search_pedidos_function.sql:
-- `pedidos` não tem policy de SELECT pública (de propósito, é o que
-- fecha o IDOR original), então esta função SECURITY DEFINER é a única
-- porta de leitura pública por número — e ela só devolve a linha cujo
-- numero_pedido bate exatamente com o argumento informado.
-- =====================================================================

create or replace function public.search_pedido_by_numero(p_numero text)
returns setof public.pedidos
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.pedidos
  where numero_pedido = trim(p_numero)
$$;

comment on function public.search_pedido_by_numero(text) is 'Leitura pública de um pedido por numero_pedido exato. Usada pela Server Action de /meus-pedidos (busca por número).';

-- anon: cliente não logado consultando /meus-pedidos pelo número do pedido.
-- authenticated: cobre o caso do admin logado também poder usar a mesma busca.
grant execute on function public.search_pedido_by_numero(text) to anon, authenticated;
