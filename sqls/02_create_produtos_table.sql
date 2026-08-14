-- =====================================================================
-- 02_create_produtos_table.sql
--
-- Substitui o catálogo hardcoded em data/products.ts por uma tabela
-- de verdade. IDs originais (1–37) preservados de propósito.
--
-- `detalhes` fica em JSONB porque o shape varia por categoria de
-- produto (toalha tem `diametro` OU `comprimento`+`largura`; o
-- conjunto de mesa+cadeira tem uma estrutura aninhada própria;
-- cadeiras têm `capacidade`; alguns itens têm `acabamento`). Forçar
-- isso em colunas fixas geraria uma tabela cheia de NULL.
-- =====================================================================

create table if not exists public.produtos (
  id integer primary key,
  nome text not null,
  categoria text not null,
  descricao text not null,
  imagem_url text not null,
  detalhes jsonb not null default '{}'::jsonb,

  -- soft-delete: permite descontinuar um produto sem quebrar pedidos
  -- antigos que ainda referenciam esse id em `pedidos.itens`.
  ativo boolean not null default true,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.produtos is 'Catálogo de produtos. Substitui o array hardcoded em data/products.ts.';

create index if not exists idx_produtos_categoria on public.produtos (categoria);
create index if not exists idx_produtos_ativo on public.produtos (ativo);

create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_produtos_atualizado_em on public.produtos;
create trigger trg_produtos_atualizado_em
before update on public.produtos
for each row
execute function public.set_atualizado_em();


-- ---------------------------------------------------------------------
-- RLS: catálogo é público para leitura (qualquer visitante navega
-- /produtos sem estar logado). Escrita só para admin.
-- ---------------------------------------------------------------------
alter table public.produtos enable row level security;

drop policy if exists "Catalogo e publico" on public.produtos;
create policy "Catalogo e publico"
  on public.produtos
  for select
  to anon, authenticated
  using (ativo = true or public.is_admin(auth.uid()));

drop policy if exists "Admin gerencia produtos" on public.produtos;
create policy "Admin gerencia produtos"
  on public.produtos
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- ---------------------------------------------------------------------
-- Seed: os 37 produtos que hoje estão em data/products.ts, 1:1.
-- ---------------------------------------------------------------------
insert into public.produtos (id, nome, categoria, descricao, imagem_url, detalhes) values
(1, 'Toalha de Mesa Clássica 280cm/300cm', 'toalhas', 'Toalha de mesa em tecido premium com acabamento refinado. Disponível nos diâmetros 280cm e 300cm. Ideal para decorações elegantes e sofisticadas.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5690+%281%29-1920w.JPG', '{"cores": ["Branco", "Preto", "Creme"], "dimensoes": {"diametro": "280cm ou 300cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(2, 'Guardanapo de Linho 40cm x 40cm', 'guardanapos', 'Guardanapos em linho puro com bordas delicadas na cor vinho. Medida padrão 40cm x 40cm. Elegância e sofisticação para sua mesa.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5654-1920w.JPG', '{"cores": ["Vinho"], "dimensoes": {"comprimento": "40cm", "largura": "40cm"}, "material": "Linho Puro"}'::jsonb),
(3, 'Trilho de Mesa Bordado 220cm x 45cm', 'trilhos', 'Trilho de mesa em tecido bordado artesanalmente. Medidas 220cm x 45cm, disponível em bege e branco.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5607-a3c2d77d-1920w.JPG', '{"cores": ["Bege", "Branco"], "dimensoes": {"comprimento": "220cm", "largura": "45cm"}, "material": "Tecido Bordado"}'::jsonb),
(4, 'Toalha Adamascada Redonda Tiffany 280cm', 'toalhas', 'Toalha de mesa redonda em tecido adamascado na cor Tiffany. Medida padrão 280cm de diâmetro, ideal para eventos sofisticados.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5843-1920w.JPG', '{"cores": ["Tiffany"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Adamascado"}'::jsonb),
(5, 'Toalha Adamascada Dupla Face Dourado/Creme 280cm', 'toalhas', 'Toalha de mesa redonda dupla face em tecido adamascado. Disponível na combinação de cores dourado e creme, com diâmetro de 280cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_58641-1920w.JPG', '{"cores": ["Dourado/Creme"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Adamascado Dupla Face"}'::jsonb),
(6, 'Trilho de Mesa Bordado Bege/Branco 220cm x 45cm', 'trilhos', 'Trilho de mesa com bordados artesanais exclusivos, disponível nas cores bege e branco. Dimensões 220cm x 45cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5629-1920w.JPG', '{"cores": ["Bege", "Branco"], "dimensoes": {"comprimento": "220cm", "largura": "45cm"}, "material": "Tecido Bordado"}'::jsonb),
(7, 'Toalha Redonda Creme 300cm', 'toalhas-redondas', 'Toalha de mesa redonda na cor creme, com 300cm de diâmetro. Ideal para composições clássicas e sofisticadas.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Creme"], "dimensoes": {"diametro": "300cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(8, 'Toalha Redonda Verde Adamascada 280cm', 'toalhas-redondas', 'Toalha de mesa redonda em tecido adamascado verde com 280cm de diâmetro. Perfeita para eventos sofisticados.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Verde"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Adamascado"}'::jsonb),
(9, 'Toalha Redonda Rosa Adamascada 280cm', 'toalhas-redondas', 'Toalha de mesa redonda em tecido adamascado rosa. Medida padrão 280cm de diâmetro, com padrões delicados.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Rosa"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Adamascado"}'::jsonb),
(10, 'Toalha Redonda Rosa Adamascada Cintia 280cm', 'toalhas-redondas', 'Toalha de mesa redonda modelo Cintia em tecido adamascado rosa. Diâmetro de 280cm e acabamento refinado.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Rosa"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Adamascado Premium", "acabamento": "Modelo Cintia"}'::jsonb),
(11, 'Toalha Redonda Marrom Rafia 280cm', 'toalhas-redondas', 'Toalha de mesa redonda em tecido tipo rafia na cor marrom. Textura diferenciada ideal para eventos com temática rústica. Medida padrão 280cm de diâmetro.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Marrom"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido tipo Rafia", "acabamento": "Texturizado"}'::jsonb),
(12, 'Toalha Redonda Vermelha 280cm', 'toalhas-redondas', 'Toalha de mesa redonda em vermelho vibrante. Ideal para eventos festivos e celebrações especiais. Diâmetro padrão de 280cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Vermelho"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(13, 'Toalha Redonda Azul Bic 280cm', 'toalhas-redondas', 'Toalha de mesa redonda em azul bic. Cor vibrante que adiciona um toque de alegria à sua decoração. Medida padrão de 280cm de diâmetro.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Azul Bic"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(14, 'Toalha Redonda Azul 280cm', 'toalhas-redondas', 'Toalha de mesa redonda em tom de azul clássico. Versátil e elegante para diversos tipos de eventos. Diâmetro de 280cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Azul"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(15, 'Toalha Redonda Preta 215cm', 'toalhas-redondas', 'Toalha de mesa redonda preta com diâmetro de 215cm. Ideal para mesas menores em eventos formais e sofisticados.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Preto"], "dimensoes": {"diametro": "215cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(16, 'Toalha Redonda Preta 240cm', 'toalhas-redondas', 'Toalha de mesa redonda preta com 240cm de diâmetro. Tamanho intermediário ideal para eventos médios.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Preto"], "dimensoes": {"diametro": "240cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(17, 'Toalha Retangular Preta 300x200cm', 'toalhas-retangulares', 'Toalha de mesa retangular preta, ideal para mesas de buffet e eventos corporativos. Dimensões 300cm x 200cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Preto"], "dimensoes": {"comprimento": "300cm", "largura": "200cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(18, 'Toalha Retangular Branca 300x200cm', 'toalhas-retangulares', 'Toalha de mesa retangular branca, perfeita para eventos formais e casamentos. Medidas 300cm x 200cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Branco"], "dimensoes": {"comprimento": "300cm", "largura": "200cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(19, 'Toalha Retangular Azul Bic 300x200cm', 'toalhas-retangulares', 'Toalha de mesa retangular azul bic, ideal para eventos vibrantes e alegres. Medidas 300cm x 200cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Azul Bic"], "dimensoes": {"comprimento": "300cm", "largura": "200cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(20, 'Toalha Retangular Preta 260x200cm', 'toalhas-retangulares', 'Toalha de mesa retangular preta com medidas de 260cm x 200cm. Versátil para eventos variados.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Preto"], "dimensoes": {"comprimento": "260cm", "largura": "200cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(21, 'Toalha Retangular Branca 260x200cm', 'toalhas-retangulares', 'Toalha de mesa retangular branca, elegante e versátil para qualquer ocasião. Dimensões de 260cm x 200cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Branco"], "dimensoes": {"comprimento": "260cm", "largura": "200cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(22, 'Toalha Quadrada Preta 140x140cm', 'toalhas-quadradas', 'Toalha de mesa quadrada preta, ideal para mesas de apoio e eventos menores. Dimensões de 140cm x 140cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Preto"], "dimensoes": {"comprimento": "140cm", "largura": "140cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(23, 'Toalha Quadrada Branca 140x140cm', 'toalhas-quadradas', 'Toalha de mesa quadrada branca, perfeita para mesas de café e sobremesas. Dimensões de 140cm x 140cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Branco"], "dimensoes": {"comprimento": "140cm", "largura": "140cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(24, 'Toalha Quadrada Vermelha 140x140cm', 'toalhas-quadradas', 'Toalha de mesa quadrada vermelha, cor vibrante ideal para eventos festivos. Dimensões de 140cm x 140cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Vermelho"], "dimensoes": {"comprimento": "140cm", "largura": "140cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(25, 'Toalha Quadrada Amarela 140x140cm', 'toalhas-quadradas', 'Toalha de mesa quadrada amarela, cor alegre perfeita para eventos descontraídos. Dimensões de 140cm x 140cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Amarelo"], "dimensoes": {"comprimento": "140cm", "largura": "140cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(26, 'Toalha Quadrada Verde 140x140cm', 'toalhas-quadradas', 'Toalha de mesa quadrada verde, ideal para eventos ao ar livre. Dimensões de 140cm x 140cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Verde"], "dimensoes": {"comprimento": "140cm", "largura": "140cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(27, 'Toalha Quadrada Azul Bic 140x140cm', 'toalhas-quadradas', 'Toalha de mesa quadrada azul bic, cor vibrante ideal para decorações modernas. Dimensões de 140cm x 140cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Azul Bic"], "dimensoes": {"comprimento": "140cm", "largura": "140cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(28, 'Toalha Quadrada Roxa 140x140cm', 'toalhas-quadradas', 'Toalha de mesa quadrada roxa, cor sofisticada perfeita para eventos especiais. Dimensões de 140cm x 140cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Roxo"], "dimensoes": {"comprimento": "140cm", "largura": "140cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(29, 'Toalha Redonda Preta 280/300cm', 'toalhas-redondas', 'Toalha de mesa redonda em tecido premium na cor preta. Disponível nos tamanhos 280cm ou 300cm de diâmetro. Ideal para eventos formais e celebrações.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Preto"], "dimensoes": {"diametro": "280cm ou 300cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(30, 'Toalha Redonda Preta Adamascada 280cm', 'toalhas-redondas', 'Toalha de mesa redonda em tecido adamascado preto com padrões elegantes em relevo. Dimensão padrão de 280cm.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Preto"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Adamascado"}'::jsonb),
(31, 'Toalha Redonda Dourada Adamascada 280cm', 'toalhas-redondas', 'Toalha de mesa redonda em tecido adamascado dourado com diâmetro de 280cm. Acabamento luxuoso com padrões em relevo, perfeita para eventos sofisticados.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Dourado"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Adamascado"}'::jsonb),
(32, 'Toalha Redonda Azul Escuro Adamascada 280cm', 'toalhas-redondas', 'Toalha de mesa redonda em tecido adamascado azul escuro com diâmetro de 280cm. Padrões elegantes em relevo que agregam sofisticação à sua decoração.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Azul Escuro"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Adamascado"}'::jsonb),
(33, 'Toalha Redonda Branca 280cm', 'toalhas-redondas', 'Toalha de mesa redonda branca com 280cm de diâmetro. Confeccionada em tecido premium, ideal para casamentos e eventos formais.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Branco"], "dimensoes": {"diametro": "280cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(34, 'Toalha Redonda Branca 300cm', 'toalhas-redondas', 'Toalha de mesa redonda branca com 300cm de diâmetro. Tecido de alta qualidade, perfeita para mesas maiores em eventos especiais.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5743-1920w.JPG', '{"cores": ["Branco"], "dimensoes": {"diametro": "300cm"}, "material": "Tecido Oxford Premium"}'::jsonb),
(35, 'Conjunto Mesa e Cadeira Plástica Quadrada Branca 70x70cm', 'mobiliario', 'Conjunto de mesa quadrada de 70cm x 70cm e cadeiras na cor branca. Estrutura resistente ideal para eventos e celebrações.', 'https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/jogo-de-mesas-plasticas-1920w.png', '{"cores": ["Branco"], "dimensoes": {"mesa": {"comprimento": "70cm", "largura": "70cm", "altura": "70cm"}, "cadeira": {"altura": "80cm", "largura": "40cm", "profundidade": "40cm"}}, "material": "Plástico Resistente", "capacidade": "Suporta até 120kg por cadeira"}'::jsonb),
(36, 'Cadeira Tiffany Transparente com Assento Branco', 'mobiliario', 'Cadeira Tiffany em acrílico transparente com assento almofadado branco. Altura de 91cm, ideal para eventos sofisticados, casamentos e celebrações especiais.', 'https://img-estoquenow.s3.amazonaws.com/items/2293/cadeira-tifanny-cristal-c-assento_6c9be48de5cf66dce409f17f7884f6bc.jpg', '{"cores": ["Transparente com assento branco"], "dimensoes": {"altura": "91cm", "largura": "41cm", "profundidade": "40cm"}, "material": "Acrílico e Estofado", "capacidade": "Suporta até 120kg"}'::jsonb),
(37, 'Cadeira Tiffany Transparente com Assento Preto', 'mobiliario', 'Cadeira Tiffany em acrílico transparente com assento almofadado preto. Altura de 91cm, combina elegância e conforto, perfeita para eventos formais e celebrações refinadas.', 'https://www.dipilatti.com.br/view/resize/1920x1080/produto/323/4a4bc2ebaeb371d1a79cbdae2d3eed32.jpg', '{"cores": ["Transparente com assento preto"], "dimensoes": {"altura": "91cm", "largura": "41cm", "profundidade": "40cm"}, "material": "Acrílico e Estofado", "capacidade": "Suporta até 120kg"}'::jsonb)
on conflict (id) do nothing;

-- A partir daqui, novos produtos inseridos sem `id` explícito continuam
-- a numeração a partir do 38 (evita colidir com os ids fixos acima).
create sequence if not exists public.produtos_id_seq owned by public.produtos.id;
select setval('public.produtos_id_seq', (select coalesce(max(id), 37) from public.produtos));
alter table public.produtos alter column id set default nextval('public.produtos_id_seq');
