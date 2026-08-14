"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { buscarProdutosAdmin } from "@/lib/produtos-service";
import { criarProduto, atualizarProduto, deletarProduto } from "./actions";
import { ProdutoForm } from "@/components/admin/produto-form";
import { ProdutoAdmin } from "@/types/product";

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<ProdutoAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<ProdutoAdmin | undefined>(undefined);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const carregarProdutos = async () => {
    setIsLoading(true);
    try {
      const resultado = await buscarProdutosAdmin();
      setProdutos(resultado);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const abrirCriacao = () => {
    setProdutoEditando(undefined);
    setSheetAberto(true);
  };

  const abrirEdicao = (produto: ProdutoAdmin) => {
    setProdutoEditando(produto);
    setSheetAberto(true);
  };

  const handleSucesso = () => {
    setSheetAberto(false);
    carregarProdutos();
  };

  const handleExcluir = async (produto: ProdutoAdmin) => {
    const confirmado = window.confirm(
      `Excluir "${produto.name}" definitivamente do catálogo? Essa ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    setExcluindoId(produto.id);
    try {
      const resultado = await deletarProduto(produto.id);
      if (!resultado.success) {
        toast.error(resultado.message ?? "Erro ao excluir produto.");
        return;
      }
      toast.success("Produto excluído.");
      carregarProdutos();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast.error("Erro ao excluir produto.");
    } finally {
      setExcluindoId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Button onClick={abrirCriacao}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="w-20 p-4 text-left">Imagem</th>
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">Categoria</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="p-4">
                  <Skeleton className="h-8 w-full" />
                </td>
              </tr>
            )}
            {!isLoading && produtos.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
            {!isLoading &&
              produtos.map((produto) => (
                <tr key={produto.id} className="border-b last:border-0">
                  <td className="p-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md">
                      <Image src={produto.image} alt={produto.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="p-4 font-medium">{produto.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{produto.category}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        produto.ativo
                          ? "bg-green-100 text-green-800"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {produto.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => abrirEdicao(produto)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleExcluir(produto)}
                        disabled={excluindoId === produto.id}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Sheet open={sheetAberto} onOpenChange={setSheetAberto}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{produtoEditando ? "Editar Produto" : "Novo Produto"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProdutoForm
              produto={produtoEditando}
              onSubmit={produtoEditando ? atualizarProduto : criarProduto}
              onSuccess={handleSucesso}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
