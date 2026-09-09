"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ShoppingCart, ShoppingBag, ImageOff } from "lucide-react";
import Image from "next/image";
import { isValidImageUrl } from "@/lib/image-utils";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ isOpen, onClose }: CartProps) {
  const { items, removeItem } = useCartStore();
  const router = useRouter();

  const handleSolicitarOrcamento = () => {
    // Navegação direta — nada de delay artificial ou validação de rede
    // aqui antes de trocar de rota (era a causa da "trava" ao clicar).
    onClose();
    router.push("/orcamento");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full w-full sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pb-6">
          <SheetTitle>🛒 Carrinho</SheetTitle>
          <SheetDescription>
            {items.length > 0 
              ? "Revise os itens selecionados antes de solicitar o orçamento."
              : "Seu carrinho está vazio. Adicione alguns produtos para continuar."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-secondary/50 rounded-lg p-4"
              >
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  {isValidImageUrl(item.image) ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageOff className="h-8 w-8 text-neutral-400" />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    {item.corEscolhida && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Cor: {item.corEscolhida}
                      </p>
                    )}
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {item.description}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                      Quantidade: {item.quantity}
                    </p>
                    {item.observation && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Observação: {item.observation}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pt-6 mt-auto border-t">
          <Button
            onClick={handleSolicitarOrcamento}
            className="w-full"
            disabled={items.length === 0}
          >
            Solicitar Orçamento
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}