"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProdutoAdmin } from "@/types/product";
import type { ProdutoActionResult } from "@/app/admin/produtos/actions";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(produto?.image ?? null);

  const dimensoes = (produto?.details.dimensoes ?? {}) as Record<string, string | undefined>;

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
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
        <label className="block text-sm font-medium mb-1">
          Imagem {produto ? "(deixe em branco para manter a atual)" : ""}
        </label>
        <Input
          type="file"
          name="imagem"
          accept="image/*"
          onChange={handleImagemChange}
          required={!produto}
        />
        {previewUrl && (
          <div className="relative mt-2 h-32 w-32 overflow-hidden rounded-md border">
            <Image src={previewUrl} alt="Pré-visualização" fill className="object-cover" />
          </div>
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
    </form>
  );
}
