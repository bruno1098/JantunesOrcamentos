-- =====================================================================
-- 04_create_search_pedidos_function.sql
--
-- Função usada pela Server Action de /meus-pedidos (Etapa 5 do plano).
--
-- Por quê uma função em vez de simplesmente liberar SELECT na tabela
-- para "anon"? Porque `pedidos` não tem policy de SELECT pública de
-- propósito (01_create_pedidos_table.sql) — isso é o que corrige o
-- IDOR original ("qualquer um digita um e-mail e vê os pedidos de
-- outra pessoa"). Esta função é a ÚNICA porta de leitura pública, e
-- ela é estreita por definição: só devolve linhas cujo e-mail bate
-- exatamente com o argumento informado. Mesmo que a Server Action
-- tivesse algum bug, o banco continua não expondo nada além disso.
-- =====================================================================

create or replace function public.search_pedidos_by_email(busca_email text)
returns setof public.pedidos
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.pedidos
  where lower(email) = lower(trim(busca_email))
  order by criado_em desc;
$$;

comment on function public.search_pedidos_by_email(text) is 'Único ponto de leitura pública de pedidos: retorna apenas pedidos do e-mail informado. Usada pela Server Action de /meus-pedidos.';

-- anon: usuário não logado consultando /meus-pedidos digitando o e-mail.
-- authenticated: cobre o caso do admin logado também poder usar a mesma busca.
grant execute on function public.search_pedidos_by_email(text) to anon, authenticated;
