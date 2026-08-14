-- =====================================================================
-- 01_create_pedidos_table.sql
--
-- Recria a coleção "pedidos" do Firestore como tabela relacional.
-- Inferido de: types/pedido.ts, types/orcamento.ts, lib/pedidos-service.ts
--
-- Decisão de modelagem: `endereco` e `itens` ficam em JSONB, no mesmo
-- formato que a aplicação já usa hoje (ver sqls/README.md para o porquê).
-- =====================================================================

create extension if not exists pgcrypto; -- necessário para gen_random_uuid()


-- ---------------------------------------------------------------------
-- Tabela auxiliar mínima de admins (allow-list).
-- Usada pelas políticas de RLS desta tabela e das demais (produtos,
-- orcamentos). Ver sqls/README.md para como adicionar o primeiro admin.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);

comment on table public.admins is 'Allow-list de usuários do Supabase Auth com acesso ao painel /admin. Um usuário só é admin se o seu auth.uid() estiver aqui.';

-- Função helper reutilizada em todas as políticas de RLS do projeto.
-- SECURITY DEFINER + search_path fixo evitam que RLS da própria tabela
-- "admins" trave essa checagem (a função "enxerga" a tabela mesmo que
-- o chamador não tenha policy de SELECT nela).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = uid);
$$;


-- ---------------------------------------------------------------------
-- Número de pedido público (equivalente ao antigo id de 4-5 dígitos
-- gerado no client por tentativa-e-erro em lib/pedidos-service.ts —
-- `gerarIdUnico()`/`verificarIdUnico()`). Uma sequence resolve isso
-- de forma atômica e sem condição de corrida, sem precisar de retry.
-- ---------------------------------------------------------------------
create sequence if not exists public.pedidos_numero_seq
  start with 10000
  increment by 1;

create or replace function public.gerar_numero_pedido()
returns text
language sql
as $$
  select nextval('public.pedidos_numero_seq')::text;
$$;


-- ---------------------------------------------------------------------
-- Tabela principal
-- ---------------------------------------------------------------------
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),

  -- código curto e público mostrado ao cliente/admin (ex: "10042"),
  -- equivalente ao antigo `Pedido.id` do Firestore. É o que a UI usa
  -- em /meus-pedidos, /admin/pedidos/[id] etc.
  numero_pedido text not null unique default public.gerar_numero_pedido(),

  nome_evento text not null,
  email text not null,

  data_entrega date not null,
  data_retirada date not null,
  constraint retirada_apos_entrega check (data_retirada >= data_entrega),

  status text not null default 'Pendente'
    check (status in ('Pendente', 'Em Análise', 'Aprovado', 'Entregue', 'Finalizado', 'Cancelado')),

  -- { rua, numero, complemento?, bairro, cidade, estado, cep, latitude?, longitude? }
  endereco jsonb not null,

  -- [{ id, name, quantity, observation?, image?, adminResponse? }, ...]
  itens jsonb not null default '[]'::jsonb,
  constraint itens_deve_ser_array check (jsonb_typeof(itens) = 'array'),

  mensagem text,

  criado_em timestamptz not null default now(),      -- era `Pedido.data` (string ISO) no Firestore
  data_atualizacao timestamptz not null default now() -- era `serverTimestamp()` no Firestore
);

comment on table public.pedidos is 'Pedidos de orçamento feitos pelos clientes. Substitui a coleção "pedidos" do Firestore.';
comment on column public.pedidos.numero_pedido is 'Código curto exibido na UI (ex: "10042"). NÃO é o id interno (uuid).';

create index if not exists idx_pedidos_email on public.pedidos (lower(email));
create index if not exists idx_pedidos_numero_pedido on public.pedidos (numero_pedido);
create index if not exists idx_pedidos_status on public.pedidos (status);
create index if not exists idx_pedidos_itens_gin on public.pedidos using gin (itens);


-- ---------------------------------------------------------------------
-- Trigger: mantém `data_atualizacao` sempre em dia em qualquer UPDATE
-- (equivalente ao `serverTimestamp()` que era passado manualmente em
-- toda chamada de updateDoc() em lib/pedidos-service.ts).
-- ---------------------------------------------------------------------
create or replace function public.set_data_atualizacao()
returns trigger
language plpgsql
as $$
begin
  new.data_atualizacao = now();
  return new;
end;
$$;

drop trigger if exists trg_pedidos_data_atualizacao on public.pedidos;
create trigger trg_pedidos_data_atualizacao
before update on public.pedidos
for each row
execute function public.set_data_atualizacao();


-- ---------------------------------------------------------------------
-- Row Level Security
--
-- Regras:
-- - Qualquer visitante (anon) pode CRIAR um pedido (é o form público
--   de orçamento) — mas não pode ler nada de volta por essa policy.
-- - Ninguém (nem anon nem authenticated comum) pode fazer SELECT
--   direto na tabela. A consulta do cliente em /meus-pedidos passa
--   pela função `search_pedidos_by_email` (04_create_search_pedidos_function.sql),
--   que é a única porta de entrada de leitura pública — e só devolve
--   pedidos que batem com o e-mail informado.
-- - Só admin (is_admin(auth.uid())) pode listar/ler todos os pedidos
--   e atualizar status.
-- ---------------------------------------------------------------------
alter table public.pedidos enable row level security;

drop policy if exists "Qualquer um pode criar pedido" on public.pedidos;
create policy "Qualquer um pode criar pedido"
  on public.pedidos
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admin le todos os pedidos" on public.pedidos;
create policy "Admin le todos os pedidos"
  on public.pedidos
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "Admin atualiza pedidos" on public.pedidos;
create policy "Admin atualiza pedidos"
  on public.pedidos
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Sem policy de DELETE de propósito: a aplicação nunca apagou pedidos,
-- só mudava status para "Cancelado". Se precisar apagar de verdade,
-- use a service role key (que ignora RLS) direto no painel.
