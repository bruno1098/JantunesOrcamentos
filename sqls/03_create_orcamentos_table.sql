-- =====================================================================
-- 03_create_orcamentos_table.sql   [OPCIONAL / BÔNUS]
--
-- Isto NÃO estava no escopo original do pedido de migração — é algo
-- que eu identifiquei no levantamento inicial do projeto (documento
-- PROJETO_VISAO_GERAL.md, seção 10): hoje, quando o admin preenche os
-- valores em /admin/pedidos/[id]/orcamento e clica em "Gerar PDF", o
-- orçamento com preços NUNCA é salvo em lugar nenhum — só vira um PDF
-- que é baixado e evapora. Se o navegador fechar antes do PDF ser
-- reaberto, o trabalho de precificação se perde e o admin refaz tudo.
--
-- Esta tabela persiste esse orçamento. Nada no restante da Fase 2
-- depende dela — se você preferir manter o comportamento atual
-- (orçamento só em memória → PDF), não rode este arquivo e me avise
-- que eu ajusto a Etapa 3 pra não referenciar `orcamentos`.
-- =====================================================================

create table if not exists public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,

  -- [{ ...ItemPedido, valorUnitario }, ...] — snapshot dos itens do
  -- pedido no momento da precificação, incluindo a resposta do admin
  -- a cada observação do cliente.
  itens jsonb not null default '[]'::jsonb,
  constraint itens_deve_ser_array check (jsonb_typeof(itens) = 'array'),

  valor_frete numeric(10, 2) not null default 0,
  valor_total numeric(10, 2) not null default 0,
  observacoes text,
  forma_pagamento text,
  data_validade date not null,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.orcamentos is 'Orçamento com valores preenchido pelo admin para um pedido. Hoje só existia em memória na tela /admin/pedidos/[id]/orcamento.';

-- Um pedido pode ter no máximo um orçamento "vigente" — mas o admin
-- pode reabrir a tela e regerar; nesse caso é um upsert por pedido_id.
create unique index if not exists idx_orcamentos_pedido_id on public.orcamentos (pedido_id);

drop trigger if exists trg_orcamentos_atualizado_em on public.orcamentos;
create trigger trg_orcamentos_atualizado_em
before update on public.orcamentos
for each row
execute function public.set_atualizado_em(); -- reaproveita a função criada em 02_create_produtos_table.sql


-- ---------------------------------------------------------------------
-- RLS: orçamento com preço é informação sensível — só admin acessa.
-- (O cliente recebe o PDF por fora do sistema, como já é hoje.)
-- ---------------------------------------------------------------------
alter table public.orcamentos enable row level security;

drop policy if exists "Admin gerencia orcamentos" on public.orcamentos;
create policy "Admin gerencia orcamentos"
  on public.orcamentos
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
