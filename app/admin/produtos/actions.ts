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
    const imagem = formData.get("imagem") as File | null;
    const ativo = formData.get("ativo") === "on";

    if (!nome || !categoria || !descricao) {
      return { success: false, message: "Preencha nome, categoria e descrição." };
    }
    if (!imagem || imagem.size === 0) {
      return { success: false, message: "Selecione uma imagem para o produto." };
    }

    const imagemUrl = await uploadImagem(supabase, imagem);
    const detalhes = parseDetalhes(formData);

    const { error } = await supabase.from("produtos").insert({
      nome,
      categoria,
      descricao,
      imagem_url: imagemUrl,
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
    const imagem = formData.get("imagem") as File | null;
    const ativo = formData.get("ativo") === "on";

    if (!id || !nome || !categoria || !descricao) {
      return { success: false, message: "Preencha nome, categoria e descrição." };
    }

    const dadosAtualizados: Record<string, unknown> = {
      nome,
      categoria,
      descricao,
      detalhes: parseDetalhes(formData),
      ativo,
    };

    // Imagem é opcional na edição: só sobe e troca a URL se uma nova
    // foi selecionada; senão mantém a que já está salva.
    if (imagem && imagem.size > 0) {
      dadosAtualizados.imagem_url = await uploadImagem(supabase, imagem);
    }

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
