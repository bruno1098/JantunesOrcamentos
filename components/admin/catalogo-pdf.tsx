import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CONTATO } from "@/lib/constants";
import type { LogoCatalogo } from "@/lib/catalogo-imagens";
import type { ProdutoAdmin, ProductDetails, ProdutoDimensoesSimples } from "@/types/product";

// Este módulo só é carregado no browser (import dinâmico no clique do
// botão), então `window` existe. Fontes servidas de public/fonts.
const ORIGEM = window.location.origin;

Font.register({
  family: "Playfair Display",
  fonts: [
    { src: `${ORIGEM}/fonts/PlayfairDisplay-Regular.woff` },
    { src: `${ORIGEM}/fonts/PlayfairDisplay-Bold.woff`, fontWeight: 700 },
    { src: `${ORIGEM}/fonts/PlayfairDisplay-Italic.woff`, fontStyle: "italic" },
  ],
});

// Sem isso o react-pdf hifeniza palavras em inglês no meio da linha
// ("toa-lha"), o que fica feio em texto em português.
Font.registerHyphenationCallback((palavra) => [palavra]);

export interface GrupoCatalogo {
  slug: string;
  nome: string;
  produtos: ProdutoAdmin[];
}

interface CatalogoPDFProps {
  grupos: GrupoCatalogo[];
  /** Foto já preparada (data URL JPEG) por URL original; `null` = sem foto. */
  fotos: Record<string, string | null>;
  logo: LogoCatalogo | null;
  geradoEm: Date;
}

const COR = {
  marca: "#b91c1c",
  marcaSuave: "#fbeeee",
  tinta: "#1f1a17",
  texto: "#4a423d",
  apagado: "#8a8079",
  linha: "#ece5df",
  papel: "#faf6f2",
  zebra: "#fcfaf8",
  chip: "#f3ede8",
};

const LARGURA_FOTO = 72;
const COL_FOTO = LARGURA_FOTO + 14;
const COL_DETALHES = 150;
const COL_CORES = 96;
const ALTURA_LOGO_CABECALHO = 34;

const styles = StyleSheet.create({
  // ---- Capa ----------------------------------------------------------
  capa: {
    backgroundColor: COR.papel,
    fontFamily: "Helvetica",
  },
  capaFaixaTopo: {
    height: 10,
    backgroundColor: COR.marca,
  },
  capaCorpo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
  },
  capaNomeFallback: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 30,
    color: COR.marca,
  },
  capaRegua: {
    width: 44,
    height: 2,
    backgroundColor: COR.marca,
    marginTop: 38,
    marginBottom: 22,
  },
  capaSobretitulo: {
    fontSize: 9.5,
    letterSpacing: 4,
    color: COR.marca,
    fontFamily: "Helvetica-Bold",
    marginBottom: 14,
  },
  capaTitulo: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 40,
    color: COR.tinta,
    textAlign: "center",
    marginBottom: 14,
  },
  capaSubtitulo: {
    fontFamily: "Playfair Display",
    fontStyle: "italic",
    fontSize: 14,
    color: COR.texto,
    textAlign: "center",
    lineHeight: 1.5,
    maxWidth: 340,
  },
  capaData: {
    fontSize: 9,
    color: COR.apagado,
    marginTop: 26,
    letterSpacing: 0.5,
  },
  capaRodape: {
    marginHorizontal: 48,
    paddingTop: 18,
    paddingBottom: 30,
    borderTopWidth: 0.75,
    borderTopColor: "#e2d8cf",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  capaContatoBloco: {
    flexDirection: "column",
  },
  capaContatoRotulo: {
    fontSize: 6.5,
    letterSpacing: 1.5,
    color: COR.apagado,
    marginBottom: 3,
  },
  capaContatoValor: {
    fontSize: 9.5,
    color: COR.tinta,
  },

  // ---- Páginas de conteúdo ------------------------------------------
  pagina: {
    paddingTop: 84,
    paddingBottom: 62,
    paddingHorizontal: 36,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  cabecalhoFixo: {
    position: "absolute",
    top: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 9,
    borderBottomWidth: 0.75,
    borderBottomColor: COR.linha,
  },
  cabecalhoNomeFallback: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 12,
    color: COR.marca,
  },
  cabecalhoRotulo: {
    fontSize: 7,
    letterSpacing: 2,
    color: COR.apagado,
  },
  rodapeFixo: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 9,
    borderTopWidth: 0.75,
    borderTopColor: COR.linha,
  },
  rodapeTexto: {
    fontSize: 7.5,
    color: COR.apagado,
  },

  // ---- Seção (categoria) --------------------------------------------
  secaoTitulo: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  secaoTituloEsq: {
    flexDirection: "row",
    alignItems: "center",
  },
  secaoBarra: {
    width: 4,
    height: 22,
    backgroundColor: COR.marca,
    borderRadius: 2,
    marginRight: 10,
  },
  secaoNome: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 19,
    color: COR.tinta,
  },
  secaoContagem: {
    fontSize: 8,
    color: COR.apagado,
    letterSpacing: 0.5,
  },

  // ---- Tabela -------------------------------------------------------
  tabelaCabecalho: {
    flexDirection: "row",
    backgroundColor: COR.tinta,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  th: {
    fontSize: 7,
    letterSpacing: 1.2,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  linha: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COR.linha,
    borderLeftWidth: 0.5,
    borderLeftColor: COR.linha,
    borderRightWidth: 0.5,
    borderRightColor: COR.linha,
  },
  colFoto: { width: COL_FOTO },
  colProduto: { flex: 1, paddingRight: 14 },
  colDetalhes: { width: COL_DETALHES, paddingRight: 10 },
  colCores: { width: COL_CORES },

  foto: {
    width: LARGURA_FOTO,
    height: LARGURA_FOTO,
    borderRadius: 6,
  },
  semFoto: {
    width: LARGURA_FOTO,
    height: LARGURA_FOTO,
    borderRadius: 6,
    backgroundColor: COR.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  semFotoTexto: {
    fontSize: 7,
    letterSpacing: 1,
    color: COR.apagado,
  },

  produtoNome: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: COR.tinta,
    lineHeight: 1.3,
    marginBottom: 4,
  },
  produtoDescricao: {
    fontSize: 8.5,
    color: COR.texto,
    lineHeight: 1.45,
  },

  detalheBloco: {
    marginBottom: 5,
  },
  detalheRotulo: {
    fontSize: 6.5,
    letterSpacing: 1,
    color: COR.apagado,
    marginBottom: 1.5,
  },
  detalheValor: {
    fontSize: 8.5,
    color: COR.tinta,
    lineHeight: 1.35,
  },
  vazio: {
    fontSize: 8.5,
    color: "#c5bbb2",
  },

  coresLista: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cor: {
    backgroundColor: COR.chip,
    borderRadius: 8,
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    marginRight: 4,
    marginBottom: 4,
  },
  corTexto: {
    fontSize: 7.5,
    color: COR.texto,
  },

  // ---- Chamada final ------------------------------------------------
  chamada: {
    marginTop: 26,
    padding: 18,
    borderRadius: 8,
    backgroundColor: COR.marcaSuave,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chamadaTitulo: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 15,
    color: COR.marca,
    marginBottom: 3,
  },
  chamadaTexto: {
    fontSize: 8.5,
    color: COR.texto,
  },
  chamadaContato: {
    alignItems: "flex-end",
  },
  chamadaContatoLinha: {
    fontSize: 9,
    color: COR.tinta,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
});

// ---------------------------------------------------------------------
// Conteúdo das colunas
// ---------------------------------------------------------------------

const ROTULOS_DIMENSOES: [keyof ProdutoDimensoesSimples, string][] = [
  ["diametro", "Diâmetro"],
  ["comprimento", "Comprimento"],
  ["largura", "Largura"],
  ["altura", "Altura"],
  ["profundidade", "Profundidade"],
];

interface LinhaDetalhe {
  rotulo: string;
  valores: string[];
}

function linhasDeDetalhes(details: ProductDetails): LinhaDetalhe[] {
  const linhas: LinhaDetalhe[] = [];
  const dim = details.dimensoes;

  if (dim && "mesa" in dim) {
    const { mesa, cadeira } = dim;
    linhas.push({
      rotulo: "MESA",
      valores: [`C ${mesa.comprimento} · L ${mesa.largura} · A ${mesa.altura}`],
    });
    linhas.push({
      rotulo: "CADEIRA",
      valores: [`A ${cadeira.altura} · L ${cadeira.largura} · P ${cadeira.profundidade}`],
    });
  } else if (dim) {
    const valores = ROTULOS_DIMENSOES.filter(([chave]) => dim[chave]).map(
      ([chave, rotulo]) => `${rotulo}: ${dim[chave]}`
    );
    if (valores.length > 0) linhas.push({ rotulo: "MEDIDAS", valores });
  }

  if (details.material) linhas.push({ rotulo: "MATERIAL", valores: [details.material] });
  if (details.acabamento) linhas.push({ rotulo: "ACABAMENTO", valores: [details.acabamento] });
  if (details.capacidade) linhas.push({ rotulo: "CAPACIDADE", valores: [details.capacidade] });

  return linhas;
}

function LinhaProduto({
  produto,
  foto,
  indice,
}: {
  produto: ProdutoAdmin;
  foto: string | null | undefined;
  indice: number;
}) {
  const detalhes = linhasDeDetalhes(produto.details ?? {});
  const cores = produto.details?.cores?.filter(Boolean) ?? [];

  return (
    <View
      wrap={false}
      style={[styles.linha, { backgroundColor: indice % 2 === 1 ? COR.zebra : "#ffffff" }]}
    >
      <View style={styles.colFoto}>
        {foto ? (
          <Image src={foto} style={styles.foto} />
        ) : (
          <View style={styles.semFoto}>
            <Text style={styles.semFotoTexto}>SEM FOTO</Text>
          </View>
        )}
      </View>

      <View style={styles.colProduto}>
        <Text style={styles.produtoNome}>{produto.name}</Text>
        {!!produto.description && (
          <Text style={styles.produtoDescricao}>{produto.description}</Text>
        )}
      </View>

      <View style={styles.colDetalhes}>
        {detalhes.length === 0 ? (
          <Text style={styles.vazio}>—</Text>
        ) : (
          detalhes.map((detalhe) => (
            <View key={detalhe.rotulo} style={styles.detalheBloco}>
              <Text style={styles.detalheRotulo}>{detalhe.rotulo}</Text>
              {detalhe.valores.map((valor) => (
                <Text key={valor} style={styles.detalheValor}>
                  {valor}
                </Text>
              ))}
            </View>
          ))
        )}
      </View>

      <View style={styles.colCores}>
        {cores.length === 0 ? (
          <Text style={styles.vazio}>—</Text>
        ) : (
          <View style={styles.coresLista}>
            {cores.map((cor) => (
              <View key={cor} style={styles.cor}>
                <Text style={styles.corTexto}>{cor}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function CabecalhoTabela() {
  return (
    <View style={styles.tabelaCabecalho}>
      <Text style={[styles.th, styles.colFoto]}>FOTO</Text>
      <Text style={[styles.th, styles.colProduto]}>PRODUTO</Text>
      <Text style={[styles.th, styles.colDetalhes]}>MEDIDAS E DETALHES</Text>
      <Text style={[styles.th, styles.colCores]}>CORES</Text>
    </View>
  );
}

function SecaoCategoria({
  grupo,
  fotos,
  primeira,
}: {
  grupo: GrupoCatalogo;
  fotos: CatalogoPDFProps["fotos"];
  primeira: boolean;
}) {
  const total = grupo.produtos.length;
  const [primeiro, ...resto] = grupo.produtos;

  return (
    // Não trocar por marginBottom: com ele, uma seção que termina a menos de 22pt do fim da página
    // faz o yoga do react-pdf entrar em laço infinito de paginação ("Invalid array length").
    <View style={{ marginTop: primeira ? 0 : 22 }}>
      {/* Título + cabeçalho da tabela + 1ª linha ficam juntos: evita título/cabeçalho órfão no fim da página. */}
      <View wrap={false}>
        <View style={styles.secaoTitulo}>
          <View style={styles.secaoTituloEsq}>
            <View style={styles.secaoBarra} />
            <Text style={styles.secaoNome}>{grupo.nome}</Text>
          </View>
          <Text style={styles.secaoContagem}>
            {total} {total === 1 ? "PRODUTO" : "PRODUTOS"}
          </Text>
        </View>
        <CabecalhoTabela />
        <LinhaProduto produto={primeiro} foto={fotos[primeiro.image]} indice={0} />
      </View>
      {resto.map((produto, i) => (
        <LinhaProduto key={produto.id} produto={produto} foto={fotos[produto.image]} indice={i + 1} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------
// Documento
// ---------------------------------------------------------------------

export function CatalogoPDF({ grupos, fotos, logo, geradoEm }: CatalogoPDFProps) {
  const totalProdutos = grupos.reduce((acc, g) => acc + g.produtos.length, 0);
  const dataExtenso = format(geradoEm, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const siteExibicao = CONTATO.siteUrl.replace(/^https?:\/\//i, "");

  return (
    <Document title="Catálogo de Produtos" author={CONTATO.nomeEmpresa} creator={CONTATO.nomeEmpresa}>
      {/* ------------------------------- Capa ------------------------------- */}
      <Page size="A4" style={styles.capa}>
        <View style={styles.capaFaixaTopo} />

        <View style={styles.capaCorpo}>
          {logo ? (
            <Image src={logo.src} style={{ width: 210, height: 210 / logo.proporcao }} />
          ) : (
            <Text style={styles.capaNomeFallback}>{CONTATO.nomeEmpresa}</Text>
          )}
          <View style={styles.capaRegua} />
          <Text style={styles.capaSobretitulo}>J.ANTUNES LOCAÇÃO</Text>
          <Text style={styles.capaTitulo}>Catálogo de Produtos</Text>
          <Text style={styles.capaSubtitulo}>
            Toalhas, trilhos e artigos selecionados para tornar sua festa ou evento inesquecível.
          </Text>
          <Text style={styles.capaData}>
            {totalProdutos} {totalProdutos === 1 ? "PRODUTO" : "PRODUTOS"} · ATUALIZADO EM{" "}
            {dataExtenso.toUpperCase()}
          </Text>
        </View>

        <View style={styles.capaRodape}>
          <View style={styles.capaContatoBloco}>
            <Text style={styles.capaContatoRotulo}>TELEFONE / WHATSAPP</Text>
            <Text style={styles.capaContatoValor}>{CONTATO.telefoneExibicao}</Text>
          </View>
          <View style={styles.capaContatoBloco}>
            <Text style={styles.capaContatoRotulo}>E-MAIL</Text>
            <Text style={styles.capaContatoValor}>{CONTATO.email}</Text>
          </View>
          <View style={styles.capaContatoBloco}>
            <Text style={styles.capaContatoRotulo}>SITE</Text>
            <Text style={styles.capaContatoValor}>{siteExibicao}</Text>
          </View>
        </View>
      </Page>

      {/* ------------------------- Páginas de produtos ---------------------- */}
      <Page size="A4" style={styles.pagina}>
        <View style={styles.cabecalhoFixo} fixed>
          {logo ? (
            <Image src={logo.src} style={{ width: ALTURA_LOGO_CABECALHO * logo.proporcao, height: ALTURA_LOGO_CABECALHO }} />
          ) : (
            <Text style={styles.cabecalhoNomeFallback}>{CONTATO.nomeEmpresa}</Text>
          )}
          <Text style={styles.cabecalhoRotulo}>CATÁLOGO DE PRODUTOS</Text>
        </View>

        {grupos.map((grupo, i) => (
          <SecaoCategoria key={grupo.slug} grupo={grupo} fotos={fotos} primeira={i === 0} />
        ))}

        <View style={styles.chamada} wrap={false}>
          <View>
            <Text style={styles.chamadaTitulo}>Gostou do que viu?</Text>
            <Text style={styles.chamadaTexto}>Peça seu orçamento sem compromisso.</Text>
          </View>
          <View style={styles.chamadaContato}>
            <Text style={styles.chamadaContatoLinha}>{CONTATO.telefoneExibicao}</Text>
            <Text style={styles.chamadaContatoLinha}>{siteExibicao}/orcamento</Text>
          </View>
        </View>

        <View style={styles.rodapeFixo} fixed>
          <Text style={styles.rodapeTexto}>
            {CONTATO.nomeEmpresa} · {CONTATO.telefoneExibicao} · {CONTATO.email}
          </Text>
          <Text
            style={styles.rodapeTexto}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber - 1} de ${totalPages - 1}`}
          />
        </View>
      </Page>
    </Document>
  );
}
