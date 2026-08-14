-- =====================================================================
-- 07_create_storage_bucket.sql
--
-- Bucket do Supabase Storage pra imagens de produtos, usado pelo CRUD
-- de produtos do admin (Etapa 4 da Fase 4 — ainda não implementada,
-- pode rodar este SQL desde já).
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('jantunes_midia', 'jantunes_midia', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- RLS em storage.objects, restrita a este bucket:
-- - Leitura pública (as imagens de produto aparecem pro site inteiro,
--   sem precisar de sessão).
-- - Escrita (upload/atualização/exclusão) só pra admin autenticado,
--   reaproveitando a mesma public.is_admin(auth.uid()) de sempre.
-- ---------------------------------------------------------------------

drop policy if exists "Leitura publica jantunes_midia" on storage.objects;
create policy "Leitura publica jantunes_midia"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'jantunes_midia');

drop policy if exists "Admin envia arquivos jantunes_midia" on storage.objects;
create policy "Admin envia arquivos jantunes_midia"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'jantunes_midia' and public.is_admin(auth.uid()));

drop policy if exists "Admin atualiza arquivos jantunes_midia" on storage.objects;
create policy "Admin atualiza arquivos jantunes_midia"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'jantunes_midia' and public.is_admin(auth.uid()));

drop policy if exists "Admin remove arquivos jantunes_midia" on storage.objects;
create policy "Admin remove arquivos jantunes_midia"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'jantunes_midia' and public.is_admin(auth.uid()));
