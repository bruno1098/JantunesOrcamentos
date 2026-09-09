"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProdutoAdmin } from "@/types/product";
import type { ProdutoActionResult } from "@/app/admin/produtos/actions";
import { SortableImageList, type ImagemFormItem } from "@/components/admin/sortable-image-list";
import { ImageCropperModal } from "@/components/admin/image-cropper-modal";

const CATEGORIAS = [
  { value: "toalhas", label: "Toalhas de Mesa" },
  { value: "toalhas-redondas", label: "Toalhas Redondas" },
  { value: "toalhas-quadradas", label: "Toalhas Quadradas" },
  { value: "toalhas-retangulares", label: "Toalhas Retangulares" },
  { value: "guardanapos", label: "Guardanapos" },
  { value: "trilhos", label: "Trilhos de Mesa" },
  { value: "mobiliario", label: "Mobiliário" },
];

interface ProdutoFormProps {
  /** Presente = edição; ausente = criação. */
  produto?: ProdutoAdmin;
  onSubmit: (formData: FormData) => Promise<ProdutoActionResult>;
  onSuccess: () => void;
}

export function ProdutoForm({ produto, onSubmit, onSuccess }: ProdutoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista única (existentes + recém-recortadas), nessa ordem final — é
  // exatamente essa ordem que vira `imagens[]` no banco (ver handleSubmit
  // e app/admin/produtos/actions.ts). Remover uma existente daqui não
  // apaga do Storage (o app já não fazia isso na troca de imagem única
  // antes da Fase 9; mantido o mesmo comportamento).
  const [imagens, setImagens] = useState<ImagemFormItem[]>(() =>
    (produto?.images ?? []).map((url) => ({ id: url, tipo: "existente" as const, url }))
  );

  // Fila de arquivos ainda não recortados (do dropzone) — o modal de
  // recorte sempre edita o primeiro da fila; confirmar ou cancelar tira
  // ele da fila e, se sobrar mais algum, o modal já abre pro próximo.
  const [filaCrop, setFilaCrop] = useState<File[]>([]);

  const dimensoes = (produto?.details.dimensoes ?? {}) as Record<string, string | undefined>;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    // Sem `onDrop` isso ficaria só com clique+drag&drop — colar
    // (Ctrl/Cmd+V) já funciona sozinho por padrão nesta versão do
    // react-dropzone (não é preciso nenhum handler extra pra isso).
    onDrop: (arquivosAceitos) => {
      if (arquivosAceitos.length > 0) {
        setFilaCrop((prev) => [...prev, ...arquivosAceitos]);
      }
    },
  });

  const removerImagem = (id: string) => {
    // Revoga a object URL fora do updater de propósito: updaters de
    // setState devem ser puros (o React pode invocá-los mais de uma vez
    // em dev), revogar uma URL é efeito colateral.
    const item = imagens.find((i) => i.id === id);
    if (item?.tipo === "nova") URL.revokeObjectURL(item.previewUrl);
    setImagens((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCancelarCrop = () => {
    setFilaCrop((prev) => prev.slice(1));
  };

  const handleConfirmarCrop = (blob: Blob) => {
    const previewUrl = URL.createObjectURL(blob);
    setImagens((prev) => [
      ...prev,
      { id: crypto.randomUUID(), tipo: "nova", blob, previewUrl },
    ]);
    setFilaCrop((prev) => prev.slice(1));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (imagens.length === 0) {
      toast.error("Selecione ao menos uma imagem para o produto.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Manifesto da ordem final: cada posição diz se é uma URL que já
      // existia ou o índice de um blob novo (anexado logo abaixo, na
      // mesma ordem). A Server Action reconstrói o array final a partir
      // disso — ver parseOrdemImagens em app/admin/produtos/actions.ts.
      const ordem: Array<{ tipo: "existente"; url: string } | { tipo: "nova"; indice: number }> = [];
      let indiceNovo = 0;
      for (const item of imagens) {
        if (item.tipo === "existente") {
          ordem.push({ tipo: "existente", url: item.url });
        } else {
          ordem.push({ tipo: "nova", indice: indiceNovo });
          formData.append("novasImagens", item.blob, `imagem-${indiceNovo}.jpg`);
          indiceNovo++;
        }
      }
      formData.set("ordemImagens", JSON.stringify(ordem));

      const resultado = await onSubmit(formData);

      if (!resultado.success) {
        toast.error(resultado.message ?? "Erro ao salvar produto.");
        return;
      }

      toast.success(produto ? "Produto atualizado!" : "Produto criado!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {produto && <input type="hidden" name="id" value={produto.id} />}

      <div>
        <label className="block text-sm font-medium mb-1">Nome</label>
        <Input name="nome" defaultValue={produto?.name} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Categoria</label>
        <select
          name="categoria"
          defaultValue={produto?.category ?? CATEGORIAS[0].value}
          className="w-full rounded-md border bg-background p-2 text-sm"
          required
        >
          {CATEGORIAS.map((categoria) => (
            <option key={categoria.value} value={categoria.value}>
              {categoria.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <Textarea name="descricao" defaultValue={produto?.description} required rows={3} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Imagens</label>
        <p className="text-xs text-muted-foreground mb-2">
          Uma foto por cor, se aplicável. Arraste as miniaturas pra reordenar — a primeira
          (marcada &quot;Capa&quot;) é a usada em qualquer lugar que mostra só uma foto.
        </p>

        {imagens.length > 0 && (
          <div className="mb-3">
            <SortableImageList itens={imagens} onReordenar={setImagens} onRemover={removerImagem} />
          </div>
        )}

        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-6 text-center transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-700"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Arraste fotos aqui, clique pra escolher, ou cole (Ctrl/Cmd+V)
          </p>
          <p className="text-xs text-muted-foreground">Cada foto abre uma tela de recorte antes de entrar na lista.</p>
        </div>

        {imagens.length === 0 && (
          <p className="mt-1 text-xs text-red-500">Selecione ao menos uma imagem.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Material</label>
          <Input name="material" defaultValue={produto?.details.material} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cores (separadas por vírgula)</label>
          <Input name="cores" defaultValue={produto?.details.cores?.join(", ")} />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Dimensões</p>
        <p className="text-xs text-muted-foreground mb-2">
          Preencha Diâmetro OU Comprimento/Largura, conforme o tipo do produto.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Diâmetro</label>
            <Input name="diametro" defaultValue={dimensoes.diametro} placeholder="Ex: 280cm" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Comprimento</label>
            <Input name="comprimento" defaultValue={dimensoes.comprimento} placeholder="Ex: 220cm" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Largura</label>
            <Input name="largura" defaultValue={dimensoes.largura} placeholder="Ex: 45cm" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Acabamento (opcional)</label>
          <Input name="acabamento" defaultValue={produto?.details.acabamento} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Capacidade (opcional)</label>
          <Input name="capacidade" defaultValue={produto?.details.capacidade} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="ativo"
          defaultChecked={produto?.ativo ?? true}
          className="h-4 w-4 rounded border-neutral-300"
        />
        Produto ativo (visível no catálogo público)
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : produto ? "Salvar Alterações" : "Criar Produto"}
        </Button>
      </div>

      <ImageCropperModal
        arquivo={filaCrop[0] ?? null}
        onCancel={handleCancelarCrop}
        onConfirm={handleConfirmarCrop}
      />
    </form>
  );
}
