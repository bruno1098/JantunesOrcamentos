# SQLs — migração Firebase → Supabase

Rode estes arquivos **nessa ordem**, no SQL Editor do painel do Supabase (Database → SQL Editor):

1. `01_create_pedidos_table.sql`
2. `02_create_produtos_table.sql`
3. `03_create_orcamentos_table.sql` *(opcional — ver nota no topo do arquivo)*
4. `04_create_search_pedidos_function.sql`

## Decisões tomadas (confirmadas com você em 2026-08-13)

- `endereco` e `itens` do pedido ficam como colunas **JSONB**, não normalizados em tabelas separadas — mantém o mesmo formato que a aplicação já usa hoje, e como não existia (e ainda não existirá até a Fase 3) uma FK real item→produto, normalizar agora não trazia benefício.
- **Não há migração de pedidos antigos** — o Firestore de produção só tinha dados de teste. O Supabase começa com a tabela `pedidos` vazia.
- **Catálogo de produtos (`data/products.ts`) é migrado** — os 37 produtos hardcoded no código viram linhas na tabela `produtos`, com os IDs originais (1–37) preservados para não quebrar nada que já referencie esses números (ex.: `itens` de pedidos antigos, se algum dia forem importados).

## Depois de rodar os scripts: criando o primeiro admin

RLS do projeto inteiro depende da tabela `public.admins` (allow-list de `user_id`s). Nenhum SQL aqui cria seu usuário admin automaticamente — isso é uma ação humana, de propósito (fora do código, não versionada, não pode ser feita por acidente por ninguém rodando um script):

1. No painel do Supabase → **Authentication → Users → Add user**, crie o usuário com o e-mail/senha que o admin vai usar pra logar em `/admin/login` (isso é feito na Etapa 4 do plano, mas o usuário Auth pode já ser criado agora).
2. Copie o `UID` desse usuário.
3. Rode no SQL Editor:
   ```sql
   insert into public.admins (user_id) values ('COLE_O_UID_AQUI');
   ```

Sem essa linha, mesmo logado, o usuário não passa nas políticas de RLS que exigem `is_admin(auth.uid())`.

## Variáveis de ambiente que você vai precisar (Etapa 2 em diante)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only, nunca prefixar com NEXT_PUBLIC_
```
