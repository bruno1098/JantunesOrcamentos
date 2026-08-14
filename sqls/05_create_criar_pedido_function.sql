-- =====================================================================
-- 05_create_criar_pedido_function.sql
--
-- Função usada por lib/pedidos-service.ts::salvarPedido() (Etapa 3).
--
-- Por quê: a policy de INSERT em `pedidos` (01_create_pedidos_table.sql)
-- libera criar pedido pra "anon", mas NÃO existe policy de SELECT pra
-- "anon" (de propósito — é o que fecha o IDOR original). O problema é
-- que um INSERT feito via PostgREST tenta devolver a linha inserida
-- (`RETURNING`), e essa leitura de volta também passa pela RLS de
-- SELECT — que bloqueia. Sem esta função, o pedido seria criado no
-- banco só que a aplicação nunca receberia o `numero_pedido` de volta.
--
-- Esta função roda como SECURITY DEFINER (bypassa RLS internamente,
-- de forma controlada) e devolve só os 3 campos que a aplicação
-- precisa pra montar o e-mail de confirmação e redirecionar o cliente.
-- =====================================================================

create or replace function public.criar_pedido(
  p_nome_evento text,
  p_email text,
  p_data_entrega date,
  p_data_retirada date,
  p_endereco jsonb,
  p_itens jsonb,
  p_mensagem text default null
)
returns table (numero_pedido text, id uuid, criado_em timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_numero_pedido text;
  v_criado_em timestamptz;
begin
  if p_data_retirada < p_data_entrega then
    raise exception 'Data de retirada não pode ser anterior à data de entrega';
  end if;

  insert into public.pedidos (nome_evento, email, data_entrega, data_retirada, endereco, itens, mensagem)
  values (
    p_nome_evento,
    lower(trim(p_email)),
    p_data_entrega,
    p_data_retirada,
    p_endereco,
    p_itens,
    p_mensagem
  )
  returning pedidos.id, pedidos.numero_pedido, pedidos.criado_em
    into v_id, v_numero_pedido, v_criado_em;

  return query select v_numero_pedido, v_id, v_criado_em;
end;
$$;

comment on function public.criar_pedido is 'Único ponto de criação pública de pedido. Contorna o fato de "pedidos" não ter policy de SELECT pública, devolvendo apenas numero_pedido/id/criado_em da linha recém-criada.';

grant execute on function public.criar_pedido(text, text, date, date, jsonb, jsonb, text) to anon, authenticated;
