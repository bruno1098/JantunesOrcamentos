"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProdutoActionResult {
  success: boolean;
  message?: string;
}

/**
 * Monta o JSONB `detalhes` a partir dos campos "achatados" do
 * formulário. Cobre os formatos que já existem hoje no catálogo:
 * material, cores (lista), e dimensões como diâmetro OU
 * comprimento+largura. Não cobre o formato aninhado mesa+cadeira (só
 * 1 produto do catálogo original usa isso) — esse caso segue editável
 * só direto no banco por ora.
 */
function parseDetalhes(formData: FormData): Record<string, unknown> {
  const detalhes: Record<string, unknown> = {};

  const material = (formData.get("material") as string | null)?.trim();
  if (material) detalhes.material = material;

  const coresRaw = (formData.get("cores") as string | null) ?? "";
  const cores = coresRaw
    .split(",")
    .map((cor) => cor.trim())
    .filter(Boolean);
  if (cores.length > 0) detalhes.cores = cores;

  const diametro = (formData.get("diametro") as string | null)?.trim();
  const comprimento = (formData.get("comprimento") as string | null)?.trim();
  const largura = (formData.get("largura") as string | null)?.trim();

  if (diametro) {
    detalhes.dimensoes = { diametro };
  } else if (comprimento || largura) {
    detalhes.dimensoes = { comprimento, largura };
  }

  const acabamento = (formData.get("acabamento") as string | null)?.trim();
  if (acabamento) detalhes.acabamento = acabamento;

  const capacidade = (formData.get("capacidade") as string | null)?.trim();
  if (capacidade) detalhes.capacidade = capacidade;

  return detalhes;
}

async function uploadImagem(
  supabase: ReturnType<typeof createClient>,
  imagem: File
): Promise<string> {
  const extensao = imagem.name.split(".").pop() || "jpg";
  const nomeArquivo = `${randomUUID()}.${extensao}`;

  const { error } = await supabase.storage
    .from("jantunes_midia")
    .upload(nomeArquivo, imagem, { contentType: imagem.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("jantunes_midia").getPublicUrl(nomeArquivo);
  return data.publicUrl;
}

/**
 * Sobe várias imagens em paralelo. `formData.getAll("novasImagens")`
 * inclui um File "fantasma" (size 0) quando nenhum arquivo novo foi
 * anexado — por isso o filtro.
 */
async function uploadImagens(
  supabase: ReturnType<typeof createClient>,
  arquivos: File[]
): Promise<string[]> {
  const validos = arquivos.filter((arquivo) => arquivo instanceof File && arquivo.size > 0);
  return Promise.all(validos.map((arquivo) => uploadImagem(supabase, arquivo)));
}

/**
 * Entrada do "manifesto" de ordem montado pelo client (Fase 9.5 —
 * ver components/admin/produto-form.tsx::handleSubmit). Cada posição do
 * array é uma URL que já existia OU o índice de um arquivo novo anexado
 * em paralelo em `formData.getAll("novasImagens")` — os dois tipos
 * podem estar intercalados em qualquer ordem (é assim que a admin
 * arrasta as miniaturas pra reordenar existentes+novas juntas).
 */
type OrdemImagemEntrada = { tipo: "existente"; url: string } | { tipo: "nova"; indice: number };

function parseOrdemImagens(formData: FormData): OrdemImagemEntrada[] {
  const raw = formData.get("ordemImagens") as string | null;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entrada): entrada is OrdemImagemEntrada => {
      if (!entrada || typeof entrada !== "object") return false;
      if (entrada.tipo === "existente") return typeof entrada.url === "string";
      if (entrada.tipo === "nova") return typeof entrada.indice === "number";
      return false;
    });
  } catch {
    return [];
  }
}

/**
 * Reconstrói o array final de URLs de imagem, na ordem exata definida
 * pela admin (drag & drop no formulário) — sobe os arquivos novos e
 * substitui cada entrada "nova" do manifesto pela URL resultante,
 * mantendo a posição das entradas "existente" intactas.
 */
async function montarImagensFinais(
  supabase: ReturnType<typeof createClient>,
  formData: FormData
): Promise<string[]> {
  const ordem = parseOrdemImagens(formData);
  const arquivosNovos = formData.getAll("novasImagens") as File[];
  const urlsNovas = await uploadImagens(supabase, arquivosNovos);

  return ordem
    .map((entrada) => (entrada.tipo === "existente" ? entrada.url : urlsNovas[entrada.indice]))
    .filter((url): url is string => Boolean(url));
}

function revalidarCatalogo() {
  // /produtos hoje busca os dados no client (useEffect), não fica em
  // cache de Server Component — então isto não tem muito o que
  // invalidar na prática (a página já busca dado fresco a cada
  // carregamento). Mantido mesmo assim: não atrapalha, e cobre o caso
  // de a página um dia passar a buscar no servidor.
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
}

export async function criarProduto(formData: FormData): Promise<ProdutoActionResult> {
  try {
    const supabase = createClient();

    const nome = (formData.get("nome") as string | null)?.trim();
    const categoria = (formData.get("categoria") as string | null)?.trim();
    const descricao = (formData.get("descricao") as string | null)?.trim();
    const ativo = formData.get("ativo") === "on";

    if (!nome || !categoria || !descricao) {
      return { success: false, message: "Preencha nome, categoria e descrição." };
    }

    const imagens = await montarImagensFinais(supabase, formData);
    if (imagens.length === 0) {
      return { success: false, message: "Selecione ao menos uma imagem para o produto." };
    }

    const detalhes = parseDetalhes(formData);

    const { error } = await supabase.from("produtos").insert({
      nome,
      categoria,
      descricao,
      // imagem_url espelha imagens[0] — retrocompatibilidade (ver
      // sqls/10_add_multiple_images_to_produtos.sql).
      imagem_url: imagens[0],
      imagens,
      detalhes,
      ativo,
    });

    if (error) throw error;

    revalidarCatalogo();
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return { success: false, message: "Erro ao criar produto. Tente novamente." };
  }
}

export async function atualizarProduto(formData: FormData): Promise<ProdutoActionResult> {
  try {
    const supabase = createClient();

    const id = Number(formData.get("id"));
    const nome = (formData.get("nome") as string | null)?.trim();
    const categoria = (formData.get("categoria") as string | null)?.trim();
    const descricao = (formData.get("descricao") as string | null)?.trim();
    const ativo = formData.get("ativo") === "on";

    if (!id || !nome || !categoria || !descricao) {
      return { success: false, message: "Preencha nome, categoria e descrição." };
    }

    // Imagens finais na ordem exata definida pela admin (drag & drop no
    // formulário) — mistura URLs mantidas e arquivos novos recém-subidos.
    const imagensFinais = await montarImagensFinais(supabase, formData);

    if (imagensFinais.length === 0) {
      return { success: false, message: "O produto precisa de ao menos uma imagem." };
    }

    const dadosAtualizados: Record<string, unknown> = {
      nome,
      categoria,
      descricao,
      detalhes: parseDetalhes(formData),
      ativo,
      imagens: imagensFinais,
      // imagem_url espelha imagens[0] — retrocompatibilidade (ver
      // sqls/10_add_multiple_images_to_produtos.sql).
      imagem_url: imagensFinais[0],
    };

    const { error } = await supabase.from("produtos").update(dadosAtualizados).eq("id", id);
    if (error) throw error;

    revalidarCatalogo();
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return { success: false, message: "Erro ao atualizar produto. Tente novamente." };
  }
}

export async function deletarProduto(id: number): Promise<ProdutoActionResult> {
  try {
    const supabase = createClient();

    // Seguro apagar de verdade: pedidos guardam um "snapshot" do item
    // (nome/imagem/quantidade) no momento da compra, em JSONB — não há
    // FK de pedidos.itens para produtos.id, então excluir um produto
    // não afeta pedidos já feitos.
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) throw error;

    revalidarCatalogo();
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return { success: false, message: "Erro ao excluir produto. Tente novamente." };
  }
}
