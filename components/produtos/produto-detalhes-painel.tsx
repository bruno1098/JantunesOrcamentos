"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/store/cart-store";
import type { Product, ProdutoDimensoesMesaCadeira, ProdutoDimensoesSimples } from "@/types/product";

// Mesmo sentinela/lógica de obrigatoriedade de cor que existia no Sheet
// (Fase 8) — só migrou de componente.
const SENTINEL_OUTRA_COR = "__outra_cor__";

interface ProdutoDetalhesPainelProps {
  produto: Product;
}

function renderDimensoes(dimensoes: ProdutoDimensoesSimples | ProdutoDimensoesMesaCadeira) {
  if ("mesa" in dimensoes) {
    return (
      <div className="space-y-2">
        <p className="font-medium">Mesa:</p>
        <ul className="list-disc list-inside pl-2">
          <li>Comprimento: {dimensoes.mesa.comprimento}</li>
          <li>Largura: {dimensoes.mesa.largura}</li>
          <li>Altura: {dimensoes.mesa.altura}</li>
        </ul>
        {dimensoes.cadeira && (
          <>
            <p className="font-medium mt-2">Cadeira:</p>
            <ul className="list-disc list-inside pl-2">
              <li>Altura: {dimensoes.cadeira.altura}</li>
              <li>Largura: {dimensoes.cadeira.largura}</li>
              <li>Profundidade: {dimensoes.cadeira.profundidade}</li>
            </ul>
          </>
        )}
      </div>
    );
  }

  if (dimensoes.diametro) {
    return <p>Diâmetro: {dimensoes.diametro}</p>;
  }

  if (dimensoes.comprimento || dimensoes.largura) {
    return (
      <p>
        {dimensoes.comprimento} x {dimensoes.largura}
      </p>
    );
  }

  return null;
}

/**
 * Painel de compra da PDP (Fase 10) — toda a lógica que antes vivia no
 * Sheet de "Orçar" dentro de product-card.tsx: seleção de cor
 * (obrigatória), quantidade e adicionar ao orçamento (Zustand + toast
 * com atalho pro carrinho). Client Component porque precisa de
 * estado/interatividade; a página em si (app/(site)/produtos/[id]/page.tsx)
 * é Server Component só até aqui — este painel é a "ilha" interativa.
 *
 * Sem campo de observação (existia no Sheet antigo): o novo layout de
 * PDP, no espírito de e-commerce clássico pedido, não previu esse campo
 * — o cliente ainda pode detalhar necessidades depois, por WhatsApp ou
 * na etapa de orçamento. Se isso for um problema pro fluxo do admin
 * (que hoje tem uma UI dedicada pra responder observação por item), é
 * fácil trazer de volta.
 */
export function ProdutoDetalhesPainel({ produto }: ProdutoDetalhesPainelProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantidade, setQuantidade] = useState(1);
  const [corSelecionada, setCorSelecionada] = useState("");
  const [corCustomizada, setCorCustomizada] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const corFinal = corSelecionada === SENTINEL_OUTRA_COR ? corCustomizada.trim() : corSelecionada;
  const corValida = corFinal.length > 0;

  const handleAddToCart = () => {
    if (!corValida) {
      toast.error("Selecione uma cor antes de adicionar ao orçamento.");
      return;
    }

    setIsAdding(true);
    addItem({ ...produto, quantity: quantidade, corEscolhida: corFinal });
    setIsAdding(false);

    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛍️</span>
          <div className="flex-1">
            <p className="font-medium leading-tight">{produto.name}</p>
            <p className="text-sm text-muted-foreground">Adicionado ao orçamento!</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              toast.dismiss(t.id);
              useCartStore.getState().openCart();
            }}
          >
            Ver carrinho
          </Button>
        </div>
      ),
      { duration: 4000, position: "top-right" }
    );

    setQuantidade(1);
    setCorSelecionada("");
    setCorCustomizada("");
  };

  const { details } = produto;
  const temDetalhes = Boolean(details.dimensoes || details.material || details.acabamento || details.capacidade);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">{produto.category}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{produto.name}</h1>
      </div>

      <p className="text-neutral-600 dark:text-neutral-300">{produto.description}</p>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Cor <span className="text-red-500">*</span>
        </label>
        <Select value={corSelecionada} onValueChange={setCorSelecionada}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma cor" />
          </SelectTrigger>
          <SelectContent>
            {details.cores?.map((cor) => (
              <SelectItem key={cor} value={cor}>
                {cor}
              </SelectItem>
            ))}
            <SelectItem value={SENTINEL_OUTRA_COR}>Outro (Especificar)</SelectItem>
          </SelectContent>
        </Select>
        {corSelecionada === SENTINEL_OUTRA_COR && (
          <input
            type="text"
            value={corCustomizada}
            onChange={(e) => setCorCustomizada(e.target.value)}
            placeholder="Digite a cor desejada"
            autoFocus
            className="mt-2 w-full rounded-md border p-2 dark:border-neutral-700 dark:bg-neutral-800"
          />
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Quantidade</label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-lg font-medium">{quantidade}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantidade((q) => q + 1)}
            aria-label="Aumentar quantidade"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full text-base"
        onClick={handleAddToCart}
        disabled={isAdding || !corValida}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Adicionar ao Orçamento
      </Button>

      {temDetalhes && (
        <div className="border-t pt-4">
          <h2 className="mb-2 font-medium">Detalhes do Produto</h2>

          {details.dimensoes && (
            <div className="mb-3 text-sm">
              <span className="font-medium">Dimensões:</span>
              <div className="mt-1 text-neutral-600 dark:text-neutral-300">
                {renderDimensoes(details.dimensoes)}
              </div>
            </div>
          )}

          {details.material && (
            <div className="mb-3 text-sm">
              <span className="font-medium">Material:</span>{" "}
              <span className="text-neutral-600 dark:text-neutral-300">{details.material}</span>
            </div>
          )}

          {details.acabamento && (
            <div className="mb-3 text-sm">
              <span className="font-medium">Acabamento:</span>{" "}
              <span className="text-neutral-600 dark:text-neutral-300">{details.acabamento}</span>
            </div>
          )}

          {details.capacidade && (
            <div className="mb-3 text-sm">
              <span className="font-medium">Capacidade:</span>{" "}
              <span className="text-neutral-600 dark:text-neutral-300">{details.capacidade}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
