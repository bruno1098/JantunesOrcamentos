"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { buscarProdutos } from "@/lib/produtos-service";
import { Product } from "@/types/product";

interface ProdutoPickerProps {
  onSelect: (produto: Product) => void;
}

/**
 * Busca + lista de produtos do catálogo (Supabase), pra adicionar um
 * item a um pedido. Usado tanto na edição de itens de um pedido
 * existente (admin/pedidos/[id]/orcamento) quanto na criação de um
 * pedido do zero (admin/pedidos/novo).
 */
export function ProdutoPicker({ onSelect }: ProdutoPickerProps) {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarProdutos()
      .then(setProdutos)
      .catch((error) => console.error("Erro ao carregar catálogo:", error))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = produtos.filter((produto) =>
    produto.name.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-3 rounded-lg border bg-background p-4">
      <Input
        placeholder="Buscar produto pelo nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        autoFocus
      />
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {carregando && (
          <p className="p-2 text-sm text-muted-foreground">Carregando catálogo...</p>
        )}
        {!carregando && filtrados.length === 0 && (
          <p className="p-2 text-sm text-muted-foreground">Nenhum produto encontrado.</p>
        )}
        {filtrados.map((produto) => (
          <button
            key={produto.id}
            type="button"
            onClick={() => onSelect(produto)}
            className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-secondary"
          >
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
              <Image src={produto.image} alt={produto.name} fill className="object-cover" />
            </div>
            <span className="text-sm">{produto.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
