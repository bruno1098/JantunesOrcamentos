-- =====================================================================
-- 09_create_buscar_orcamento_by_pedido_function.sql
--
-- Fase 6 (continuação) — /meus-pedidos passa a mostrar os valores do
-- orçamento (quando o admin já precificou), não só status/itens sem preço.
--
-- `orcamentos` tem RLS admin-only de propósito (03_create_orcamentos_table.sql:
-- "orçamento com preço é informação sensível — só admin acessa"). Essa
-- função SECURITY DEFINER abre uma porta pública bem estreita: só
-- devolve o orçamento de UM pedido, buscado pelo `pedido_id` (uuid
-- interno, aleatório de 128 bits — nunca exibido/usado como o "número
-- do pedido" público, que é a sequence curta). Só é alcançável na
-- prática por quem já obteve esse uuid de dentro de
-- search_pedidos_by_email/search_pedido_by_numero (ou seja, quem já
-- provou conhecer o e-mail ou o número do próprio pedido) — chutar um
-- uuid aleatório não é uma superfície de ataque prática, o mesmo
-- raciocínio de segurança de um link com token do Stripe/Notion.
-- =====================================================================

create or replace function public.buscar_orcamento_por_pedido(p_pedido_id uuid)
returns setof public.orcamentos
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.orcamentos
  where pedido_id = p_pedido_id
$$;

comment on function public.buscar_orcamento_por_pedido(uuid) is 'Leitura pública do orçamento (valores) de um pedido específico — usada em /meus-pedidos depois que o cliente já encontrou o pedido via e-mail/número, pra mostrar o valor quando o admin já precificou.';

grant execute on function public.buscar_orcamento_por_pedido(uuid) to anon, authenticated;
