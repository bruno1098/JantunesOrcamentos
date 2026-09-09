-- =====================================================================
-- 10_add_multiple_images_to_produtos.sql
--
-- Fase 9 — múltiplas fotos por produto (ex: uma por cor), exibidas
-- como carrossel na vitrine (/produtos e Home).
--
-- Decisão: coluna nova `imagens text[]`, NÃO dentro de `detalhes`
-- (JSONB). `imagem_url` já é uma coluna própria hoje — não vive dentro
-- de `detalhes` — porque é dado central do produto, não um atributo
-- que varia por categoria (isso é o que `detalhes` foi desenhado pra
-- guardar: dimensões, material — ver comentário no topo de
-- 02_create_produtos_table.sql). `imagens` é o mesmo tipo de dado que
-- `imagem_url`, só que em lista; enfiar isso dentro do JSONB seria
-- inconsistente com o que já existe.
--
-- `imagem_url` continua existindo (não foi removida) — a partir de
-- agora a Server Action (app/admin/produtos/actions.ts) sempre grava
-- `imagem_url = imagens[1]` em toda criação/edição, então qualquer
-- código que ainda leia só `imagem_url` (ex: listagem do admin,
-- ProdutoPicker) continua funcionando sem nenhuma alteração.
--
-- Sem CHECK constraint exigindo pelo menos 1 imagem de propósito: a
-- validação de "produto precisa de ao menos 1 foto" já acontece na
-- Server Action antes de qualquer INSERT/UPDATE chegar aqui — manter
-- o banco sem essa trava evita risco de migração falhar por causa de
-- alguma linha antiga/manual fora do padrão.
-- =====================================================================

alter table public.produtos
  add column if not exists imagens text[] not null default '{}'::text[];

comment on column public.produtos.imagens is 'Todas as fotos do produto (ex: uma por cor). imagens[1] é sempre espelhada em imagem_url para retrocompatibilidade.';

-- Backfill: todo produto existente ganha sua imagem_url atual como a
-- primeira (e por ora única) foto do array.
update public.produtos
set imagens = array[imagem_url]
where (imagens is null or array_length(imagens, 1) is null)
  and imagem_url is not null
  and imagem_url <> '';
