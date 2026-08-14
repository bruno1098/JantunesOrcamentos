# J.Antunes Locação — Visão Geral do Projeto

> Documento gerado para dar contexto completo a uma IA sobre este projeto. Projeto de ~2 anos atrás, feito via "vibe coding" com IA (Bolt.new, template `nextjs-shadcn` — ver `.bolt/prompt`), nunca formalmente documentado.

## 1. O que é o projeto

Site institucional + **catálogo de locação de toalhas/artigos para festas e eventos** ("J.Antunes Locação"), com um fluxo de **pedido de orçamento** (não é e-commerce com pagamento — é só solicitação de orçamento) e um **painel administrativo** simples para o dono gerenciar os pedidos recebidos e gerar um PDF de orçamento com valores.

Não tem carrinho de compra "de verdade" com checkout/pagamento: o cliente monta uma lista de produtos que quer alugar, preenche dados do evento e envia. Isso vira um "Pedido" no Firestore. O admin acessa esse pedido, preenche os valores de cada item + frete, e gera um PDF de orçamento para mandar ao cliente manualmente (fora do sistema — o PDF só é baixado, não é enviado automaticamente por e-mail).

- **Deploy:** Vercel. Existem **dois domínios diferentes referenciados no código** (ver seção 11): `locacaodetoalhas.vercel.app` (usado em metadata/SEO) e `jantunes.vercel.app` (usado como origem das imagens do logo nos e-mails/PDF). Repositório GitHub: `bruno1098/JantunesOrcamentos`.
- **Banco de dados:** Firebase Firestore (uma única coleção relevante: `pedidos`). Não usa Firebase Auth.
- **E-mail transacional:** SendGrid (via API route própria).
- **Não há backend "de verdade"**: tudo é Next.js (App Router) rodando client-side + 2 API routes (`pages/api`) que só fazem de proxy para SendGrid e para uma API de validação de e-mail.

## 2. Stack técnica

| Item | Tecnologia |
|---|---|
| Framework | Next.js 13.5 (App Router, com 2 rotas legadas em `pages/api`) |
| Linguagem | TypeScript |
| UI Kit | shadcn/ui (Radix UI + Tailwind), gerado via Bolt.new |
| Estilo | Tailwind CSS + `styled-components` (usado só para SSR registry, ver `lib/registry.tsx`) |
| Estado global (carrinho) | Zustand (`zustand/middleware persist`, salva no `localStorage`) |
| Banco de dados | Firebase Firestore (client SDK, sem Firebase Auth) |
| E-mail | SendGrid (`@sendgrid/mail`) via API route `pages/api/send-email.ts` |
| Validação de e-mail | AbstractAPI (`emailvalidation.abstractapi.com`) via `pages/api/verify-email.ts` |
| Geocodificação/CEP | ViaCEP (busca por CEP) + Nominatim/OpenStreetMap (busca por endereço e geocoding) |
| Mapa nos e-mails/admin | `staticmap.openstreetmap.de` (imagem estática) + iframe embed do OpenStreetMap |
| Geração de PDF | `@react-pdf/renderer` |
| Animação da hero da home | Remotion (`@remotion/player`) — renderiza uma composição animada customizada (`components/hero-animation.tsx`) |
| Gráficos do dashboard admin | Recharts |
| Toasts | `react-hot-toast` (principal) + `sonner` (componente shadcn, parece não usado ativamente) |
| Formulários/datas | `react-day-picker`, `date-fns`, `react-datepicker` (duas libs de data coexistindo) |

Dependências de mais peso que aparecem no `package.json` mas **não têm uso aparente no código** (candidatas a remover, ver seção 12): `@remix-run/react`, `gsap`, `d3-interpolate`/`d3-scale`/`d3-shape` (soltos, fora do Recharts), `@react-google-maps/api` (o projeto usa OpenStreetMap, não Google Maps), `input-otp`/`cmdk`/`vaul`/etc. (vieram todos junto do template shadcn e boa parte dos componentes em `components/ui/` nunca é importada).

## 3. Variáveis de ambiente necessárias

Não há `.env.example` no repo. Pelo uso em código, as variáveis necessárias são:

```
# Firebase (lib/firebase.ts) — todas NEXT_PUBLIC_ pois é usado no client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# SendGrid (pages/api/send-email.ts) — só no servidor
SENDGRID_API_KEY=

# AbstractAPI - validação de e-mail (pages/api/verify-email.ts) — só no servidor
ABSTRACT_API_KEY=
```

## 4. Estrutura de pastas (completa)

```
JantunesOrcamentos/
├── app/                          # Next.js App Router (site público + admin)
│   ├── layout.tsx                # Layout raiz: nav, footer, toaster, cookie banner, theme
│   ├── page.tsx                  # Home ("/")
│   ├── sitemap.ts                # Sitemap dinâmico para SEO
│   ├── not-found.tsx             # Página 404 customizada
│   ├── globals.css               # CSS global (tokens Tailwind/shadcn)
│   ├── produtos/page.tsx         # Catálogo de produtos (client-side, filtra data/products.ts)
│   ├── orcamento/page.tsx        # Formulário de solicitação de orçamento (fluxo do cliente)
│   ├── meus-pedidos/page.tsx     # Cliente consulta pedidos pelo e-mail
│   ├── about/page.tsx            # Página institucional "Sobre"
│   ├── contato/page.tsx          # Página de contato (form próprio, além do da home)
│   ├── duvidas-frequentes/page.tsx
│   ├── politica-privacidade/page.tsx
│   ├── termos-condicoes/page.tsx
│   └── admin/                    # Área administrativa
│       ├── layout.tsx            # Layout do admin (esconde nav/footer, exceto no login)
│       ├── login/page.tsx        # Login admin (usuário/senha fixos no client!)
│       ├── dashboard/page.tsx    # Dashboard com métricas, gráficos e lista de pedidos
│       └── pedidos/[id]/
│           ├── page.tsx          # Detalhe de um pedido + trocar status
│           └── orcamento/page.tsx# Preencher valores do orçamento e gerar PDF
│
├── pages/api/                    # 2 API routes legadas (Pages Router, convivendo com o App Router)
│   ├── send-email.ts             # Envia e-mail via SendGrid
│   └── verify-email.ts           # Valida e-mail via AbstractAPI
│
├── components/
│   ├── navigation.tsx            # Header/nav fixo, tema claro/escuro, ícone do carrinho
│   ├── footer.tsx                # Rodapé (links, contato, redes sociais)
│   ├── cart.tsx                  # Drawer (Sheet) do carrinho, botão "Solicitar Orçamento"
│   ├── admin-guard.tsx           # "Proteção" de rotas admin — só checa localStorage (ver seção 9)
│   ├── product-card.tsx          # Card de produto no catálogo + modal de "adicionar ao carrinho"
│   ├── product-filter.tsx        # Botões de filtro por categoria (desktop)
│   ├── product-showcase.tsx      # Seção de destaque de produtos na home
│   ├── product-skeleton.tsx      # Loading skeleton de card de produto
│   ├── pedido-card.tsx           # ⚠️ Componente órfão/incompleto, não usado em lugar nenhum
│   ├── orcamento-pdf.tsx         # Template do PDF de orçamento (react-pdf), usado pelo admin
│   ├── hero-animation.tsx        # Composição Remotion usada na animação da hero da home
│   ├── features.tsx              # Seção "diferenciais" da home
│   ├── testimonials.tsx          # Seção de depoimentos da home
│   ├── contact.tsx               # Seção de contato da home (formulário que dispara e-mail)
│   ├── breadcrumbs.tsx           # Migalhas de pão (usado em algumas páginas institucionais)
│   ├── CookieConsent.tsx         # Banner de cookies
│   ├── WhatsAppButton.tsx        # Botão flutuante do WhatsApp
│   ├── zoom-image.tsx            # Utilitário de zoom em imagem
│   ├── loading-dots.tsx / loading-screen.tsx / progress-loading.tsx  # Variações de loading state
│   ├── modal-provider.tsx        # Configura `react-modal` (define #root como app element)
│   ├── theme-provider.tsx        # Wrapper do `next-themes`
│   ├── providers/cart-hydration.tsx  # Garante hydration do Zustand persist antes de renderizar
│   └── ui/                       # ~50 componentes shadcn/ui "de prateleira" (Radix + Tailwind).
│                                  # Boa parte não é usada — ver seção 12.
│
├── lib/
│   ├── firebase.ts                # Inicializa o app Firebase + exporta `db` (Firestore)
│   ├── auth-utils.ts              # ⚠️ Credenciais admin HARDCODED ("admin"/"admin") — ver seção 9
│   ├── pedidos-service.ts         # CRUD de pedidos no Firestore (salvar, buscar por id/email, listar, atualizar status)
│   ├── email-templates.ts         # Gera o HTML dos e-mails (cliente e admin) para novo pedido
│   ├── email-utils.ts             # Client-side: chama /api/verify-email e /api/send-email
│   ├── constants.ts               # STATUS_COLORS / STATUS_OPTIONS dos pedidos (deveria ser fonte única — ver seção 12)
│   ├── registry.tsx               # SSR registry do styled-components (infra do Next, não é lógica de negócio)
│   └── utils.ts                   # `cn()` helper (clsx + tailwind-merge), padrão shadcn
│
├── store/
│   └── cart-store.ts              # Zustand store do carrinho (persistido em localStorage)
│
├── types/
│   ├── pedido.ts                  # Tipos: Pedido, ItemPedido, Endereco
│   └── orcamento.ts                # Tipos: Orcamento, ItemOrcamento
│
├── data/
│   └── products.ts                 # Catálogo de produtos HARDCODED no código (37 itens, sem preço)
│
├── hooks/
│   └── use-toast.ts                # Hook do sistema de toast do shadcn (usado pouco; projeto usa react-hot-toast)
│
├── utils/
│   └── dom-utils.ts                # Helper pra pegar posição do ícone do carrinho (animação "voar pro carrinho")
│
├── public/                         # Assets estáticos (imagens, ícones)
├── .bolt/                          # Config do Bolt.new (confirma origem "vibe coded"): template + prompt de sistema usado
├── next.config.js                  # Config de imagens remotas (domains/remotePatterns) e API
├── tailwind.config.ts / components.json / postcss.config.js / .eslintrc.json / tsconfig.json
└── package.json
```

## 5. Modelo de dados

### `Pedido` (`types/pedido.ts`) — documento na coleção Firestore `pedidos`
```ts
{
  id: string;              // ID customizado de 4-5 dígitos, gerado manualmente (NÃO é o doc.id do Firestore)
  nomeEvento: string;
  data: string;             // data de criação do pedido (ISO string)
  dataEntrega: string;
  dataRetirada: string;
  status: string;           // "Pendente" | "Em Análise" | "Aprovado" | "Entregue" | "Finalizado" | "Cancelado"
  email: string;            // usado como "identidade" do cliente (não há login/senha de cliente)
  endereco: { rua, numero, complemento?, bairro, cidade, estado, cep, latitude?, longitude? };
  itens: ItemPedido[];      // { id, name, quantity, observation?, image?, adminResponse? }
  mensagem?: string;
  dataAtualizacao?: any;    // Firestore serverTimestamp
}
```

### `Orcamento` (`types/orcamento.ts`) — não persistido, existe só em memória na tela do admin ao gerar o PDF
```ts
{
  pedidoId, itens: ItemOrcamento[] (ItemPedido + valorUnitario), valorFrete, valorTotal, observacoes, dataValidade, formaPagamento
}
```
Importante: **o orçamento com valores nunca é salvo no Firestore nem enviado por e-mail** — o admin só gera um PDF que baixa/abre localmente. O "envio" ao cliente é manual (fora do sistema).

### `CartItem` (`store/cart-store.ts`)
Item do carrinho no client, deriva de `Product` (`data/products.ts`) + `quantity` + `observation`. Sem preço (não há preço público nos produtos — só o admin define valor depois, no orçamento).

### `Product` (`data/products.ts`)
Array estático com 37 produtos (toalhas, guardanapos, trilhos, mobiliário). Sem preço, sem estoque, sem CMS — para adicionar/editar produto é preciso editar este arquivo e fazer deploy.

## 6. Como funciona o SaaS — fluxo do usuário comum (cliente)

1. Cliente navega o catálogo em `/produtos` (dados vêm de `data/products.ts`, filtro por categoria em `product-filter.tsx`).
2. Clica em "Orçar" → abre modal (`product-card.tsx`) pedindo quantidade + observação → item vai para o carrinho (Zustand, `store/cart-store.ts`, persistido em `localStorage`).
3. Abre o carrinho (`components/cart.tsx`, ícone no header) → clica "Solicitar Orçamento" → vai para `/orcamento`.
4. Em `/orcamento` (`app/orcamento/page.tsx`) preenche: e-mail (validado via `/api/verify-email` → AbstractAPI, com debounce), nome do evento, endereço (por CEP via ViaCEP, ou manual, ou por busca livre via Nominatim, com confirmação num mapa embutido), datas de entrega/retirada, mensagem.
5. Ao enviar: `salvarPedido()` (`lib/pedidos-service.ts`) grava no Firestore com status `"Pendente"` e um ID numérico curto único gerado por tentativa-e-erro (`gerarIdUnico`). Em seguida dispara 2 e-mails via `/api/send-email` (SendGrid): um de confirmação pro cliente e **um para o admin — que na prática vai para um endereço fictício `'seu-email@exemplo.com'` nunca substituído (ver bug crítico na seção 11)**.
6. Cliente é redirecionado para `/meus-pedidos?email=...`, que busca automaticamente (`buscarPedidoPorEmail`) todos os pedidos daquele e-mail no Firestore e lista status/itens. **Não há senha nem verificação de posse do e-mail** — qualquer pessoa que souber (ou adivinhar/testar) o e-mail de outra pessoa consegue ver os pedidos dela ali, só digitando o e-mail em `/meus-pedidos`.

## 7. Como funciona o SaaS — fluxo do admin

1. `/admin/login` — formulário usuário/senha. Validado por `validateCredentials()` em `lib/auth-utils.ts`.
2. Se válido, grava `localStorage.setItem("adminAuth", "true")` e navega para `/admin/dashboard`.
3. `AdminGuard` (`components/admin-guard.tsx`), usado em todas as páginas `/admin/*` (exceto login), apenas verifica se existe algo em `localStorage.adminAuth` — **não valida nada no servidor**.
4. `/admin/dashboard`: busca todos os pedidos (`buscarTodosPedidos()`), monta métricas (total, pendentes, hoje, crescimento mensal, produtos totais), 2 gráficos (Recharts: pedidos por período e pizza de status), tabela com filtro por status/ordenação/paginação simples, botão para abrir cada pedido.
5. `/admin/pedidos/[id]`: detalhe completo do pedido (evento, endereço com mapa embutido, itens), e um `Select` para trocar o `status` do pedido (grava direto no Firestore via `atualizarPedido`). Botão "Gerar Orçamento" leva para a tela de precificação.
6. `/admin/pedidos/[id]/orcamento`: admin define valor unitário de cada item, frete, forma de pagamento, observações, e pode responder às observações do cliente por item. Botão "Gerar PDF" monta o componente `OrcamentoPDF` (react-pdf) e força download/abertura em nova aba. **Esse orçamento não é salvo em lugar nenhum e não é enviado automaticamente** — o admin precisa mandar o PDF pro cliente manualmente (WhatsApp/e-mail).
7. Logout: apenas remove a chave do `localStorage`.

## 8. Integrações externas usadas

| Serviço | Onde | Para quê |
|---|---|---|
| Firebase Firestore | `lib/firebase.ts`, `lib/pedidos-service.ts` | Único banco de dados: coleção `pedidos` |
| SendGrid | `pages/api/send-email.ts` | Envio de e-mails transacionais (confirmação de pedido, notificação admin, form de contato) |
| AbstractAPI | `pages/api/verify-email.ts` | Validação de formato/deliverability de e-mail no form de orçamento |
| ViaCEP | `app/orcamento/page.tsx` (`buscarCep`, `buscarEndereco`) | Autopreenchimento de endereço por CEP |
| Nominatim (OpenStreetMap) | `app/orcamento/page.tsx` (`buscarEndereco`, `buscarCoordenadas`) | Busca de endereço livre + geocoding (lat/long) |
| staticmap.openstreetmap.de | `lib/email-templates.ts` | Imagem estática do mapa embutida nos e-mails |
| OpenStreetMap embed (iframe) | `app/orcamento/page.tsx`, `app/admin/pedidos/[id]/page.tsx` | Mapa interativo de confirmação/visualização de endereço |
| wa.me (WhatsApp) | `WhatsAppButton.tsx`, `contact.tsx`, `produtos/page.tsx` | Links diretos de WhatsApp |

Não há: gateway de pagamento, autenticação real de usuários, CMS de produtos, banco relacional, testes automatizados, CI/CD configurado, nem `middleware.ts` de proteção de rotas.

## 9. ⚠️ Problemas críticos de segurança (leia antes de "só arrumar visual")

1. **Login de admin é 100% falso.** `lib/auth-utils.ts` tem `username: "admin", password: "admin"` **hardcoded no bundle do client** (qualquer um vê isso no código-fonte JS servido ao navegador, sem precisar nem inspecionar o repo). O "guard" (`admin-guard.tsx`) só olha `localStorage.getItem("adminAuth")` — **basta abrir o console do navegador em qualquer `/admin/*` e rodar `localStorage.setItem("adminAuth","true")`** para entrar sem senha nenhuma. Não existe verificação no servidor (nenhum `middleware.ts`, nenhuma sessão, nenhum token).
2. **Firestore é acessado direto do client sem Firebase Auth.** Isso só é seguro se as *Security Rules* do projeto Firebase (configuradas no console, não estão no repo) exigirem autenticação — o que aparentemente não é o caso, já que não existe nenhum fluxo de login de Firebase em nenhum lugar do código. Ou seja: **provavelmente qualquer pessoa consegue ler/escrever a coleção `pedidos` inteira direto pela API do Firestore**, incluindo trocar status de pedidos de outras pessoas, sem passar pelo site.
3. **`/meus-pedidos` não verifica posse do e-mail.** Qualquer visitante que digite (ou adivinhe) o e-mail de um cliente vê todos os pedidos, endereço completo e itens dele.
4. Nenhuma variável de ambiente sensível está exposta no repo (bom sinal), mas como não há `.env.example`, quem for rodar o projeto do zero precisa descobrir as chaves na mão (Firebase, SendGrid, AbstractAPI).

**Recomendação de prioridade #1 numa limpeza:** decidir entre (a) implementar autenticação real (Firebase Auth com custom claims de admin, checada nas Firestore Rules e opcionalmente num `middleware.ts`), ou (b) se o projeto for baixo risco/uso pessoal, pelo menos mover a validação de login para uma API route server-side com uma senha em variável de ambiente, e travar as Firestore Rules para escrita/leitura só autenticada.

## 10. Bugs / inconsistências encontradas (não é só estética)

- **E-mail de notificação do admin nunca chega.** Em `app/orcamento/page.tsx`, dentro de `handleSubmit`, o segundo e-mail é enviado para o literal `'seu-email@exemplo.com'` — placeholder que nunca foi trocado pelo e-mail real do admin. **Todo pedido novo, o admin não é avisado por e-mail; só descobre entrando manualmente no dashboard.**
- **Números de telefone/WhatsApp divergentes entre partes do site:**
  - `Footer` e `WhatsAppButton` usam `(11) 94022-4459` / `5511940224459`.
  - `Contact` (seção da home) e os templates de e-mail/PDF (`email-templates.ts`, `orcamento-pdf.tsx`) mostram `(11) 94252-1204`.
  - São números diferentes — vale confirmar qual é o correto e unificar.
- **E-mails de contato divergentes:** `j.antunes@gmail.com` (footer/contact.tsx) vs `j.antuness@gmail.com` (com "s" extra, em `email-templates.ts`) vs `jovi.antunes@gmail.com` (no PDF, `orcamento-pdf.tsx`) vs remetente real do SendGrid `bruno.saantunes1@gmail.com` (`pages/api/send-email.ts`). Vale unificar num único e-mail oficial.
- **Dois domínios Vercel diferentes no código:** `locacaodetoalhas.vercel.app` (metadata, OG, sitemap) e `jantunes.vercel.app` (logo usado nos e-mails e no PDF). Se só um domínio está de pé hoje, os logos nos e-mails/PDF podem estar quebrados.
- **`sitemap.ts` referencia rotas que não existem**: `/sobre` (a rota real é `/about`) e `/produtos/[id]` para cada produto (não existe página de produto individual — `app/produtos/` só tem a listagem). O sitemap está mentindo pro Google.
- **`components/pedido-card.tsx` é código morto/incompleto** — não é importado em lugar nenhum, e o `CardContent` está vazio (`{/* ... resto do conteúdo ... */}`). `meus-pedidos/page.tsx` e `lib/constants.ts` reimplementam o mesmo `STATUS_COLORS` que já existe em `lib/constants.ts`, cada um com sua própria cópia local em vez de importar (duplicação em `app/meus-pedidos/page.tsx` e `app/admin/pedidos/[id]/page.tsx`).
- **Duas bibliotecas de seleção de data coexistindo** (`react-day-picker` usado em `/orcamento`, `react-datepicker` instalado mas só o `registerLocale` é chamado — parece resquício de refatoração incompleta).
- **Duas bibliotecas de toast** (`react-hot-toast`, usado ativamente, e `sonner`/`hooks/use-toast.ts`, do template shadcn, praticamente não usado).

## 11. Estrutura de "vibe coding" (contexto do histórico)

- Projeto começou no **Bolt.new**, template `nextjs-shadcn` (ver `.bolt/config.json` e `.bolt/prompt` — o prompt de sistema do Bolt está literalmente salvo no repo).
- Isso explica: a pasta `components/ui/` inteira (shadcn "de fábrica", com muitos componentes nunca usados), a mistura de libs redundantes, e a falta de padronização de nomenclatura (mistura de português/inglês, ex.: `pedidos-service.ts` com funções em português mas tipos em português também, mas nomes de rotas em inglês como `/admin`).
- Histórico do git (`git log`) mostra muitos commits do tipo "Mudanças testes" seguidos, típico de iteração rápida guiada por IA sem revisão manual profunda.

## 12. Sugestões de limpeza, em ordem de prioridade

1. **Segurança do admin** (seção 9) — prioridade máxima antes de qualquer outra coisa, especialmente se o site está em produção recebendo pedidos reais.
2. **Corrigir o e-mail de notificação do admin** (`'seu-email@exemplo.com'` → e-mail real via variável de ambiente).
3. **Unificar contatos** (telefone e e-mail) num único lugar (`lib/constants.ts`, por exemplo) e importar em todo lugar, em vez de strings soltas espalhadas em 5+ arquivos.
4. **Unificar o domínio** de produção e usar variável de ambiente (`NEXT_PUBLIC_SITE_URL`) em vez de hardcode em `layout.tsx`, `email-templates.ts`, `orcamento-pdf.tsx`, `sitemap.ts`.
5. **Remover código morto**: `components/pedido-card.tsx`, componentes `ui/*` não usados, dependências não usadas no `package.json` (checar com uma ferramenta tipo `depcheck` antes de remover).
6. **Consertar o `sitemap.ts`** (rota `/sobre` → `/about`; remover ou implementar de verdade as páginas de produto individual).
7. **Adicionar `.env.example`** documentando as 9 variáveis necessárias.
8. **Padronizar cores de status** (`STATUS_COLORS`) e opções (`STATUS_OPTIONS`) usando só `lib/constants.ts` em todo lugar (hoje há cópias duplicadas em pelo menos 2 páginas).
9. Avaliar se vale migrar preço/produto de `data/products.ts` (hardcoded) para o Firestore, se a ideia é o dono conseguir editar catálogo sem precisar de deploy.

---
*Gerado por análise estática do código-fonte em 2026-08-13. Não foi executado nenhum código nem acessado o Firebase/Vercel reais — algumas afirmações (ex. estado atual das Firestore Rules, qual domínio está realmente no ar) precisam ser confirmadas manualmente.*
