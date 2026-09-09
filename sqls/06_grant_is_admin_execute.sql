-- =====================================================================
-- 06_grant_is_admin_execute.sql
--
-- `public.is_admin(uuid)` (criada em 01_create_pedidos_table.sql) até
-- agora só era chamada implicitamente de dentro das políticas de RLS.
-- A Etapa 4 passa a chamá-la diretamente via `.rpc('is_admin', ...)`,
-- tanto no login (/admin/login) quanto no middleware — então precisa
-- de EXECUTE explícito pro role "authenticated".
--
-- (Postgres já concede EXECUTE em novas funções para PUBLIC por
-- padrão, então isso provavelmente já funcionaria mesmo sem este
-- arquivo — mas prefiro deixar explícito a confiar nesse default.)
-- =====================================================================

grant execute on function public.is_admin(uuid) to authenticated;