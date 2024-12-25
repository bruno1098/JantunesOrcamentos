"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ShoppingCart, ShoppingBag, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingDots } from "@/components/loading-dots";
import { toast } from "react-hot-toast";
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ isOpen, onClose }: CartProps) {
  const { items, removeItem } = useCartStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSolicitarOrcamento = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await router.push("/orcamento");
      onClose();
    } catch (error) {
      console.error("Erro ao navegar:", error);
      toast.error("Erro ao carregar a página de orçamento");
    } finally {
      setIsLoading(false);
    }
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
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
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
            disabled={isLoading || items.length === 0}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </span>
            ) : (
              "Solicitar Orçamento"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}