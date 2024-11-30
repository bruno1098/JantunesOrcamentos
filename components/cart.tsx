"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingDots } from "@/components/loading-dots";
import { toast } from "react-hot-toast";

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
      // Primeiro, aguarda obrigatoriamente os 2 segundos da animação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Só depois inicia e aguarda a navegação
      await router.push("/orcamento");
      
      // Fecha o carrinho apenas quando tudo estiver pronto
      onClose();
    } catch (error) {
      console.error("Erro ao navegar:", error);
      toast.error("Erro ao carregar a página de orçamento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-neutral-800 shadow-xl z-50"
          >
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <h2 className="text-lg font-bold">Carrinho</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-6">
                {items.length === 0 ? (
                  <div className="text-center text-neutral-500 dark:text-neutral-400">
                    Seu carrinho está vazio
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col space-y-4 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
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
                )}
              </ScrollArea>

              <div className="p-6 border-t dark:border-neutral-800">
                <Button 
                  className="w-full" 
                  disabled={items.length === 0 || isLoading}
                  onClick={handleSolicitarOrcamento}
                >
                  {isLoading ? (
                    <LoadingDots />
                  ) : (
                    'Solicitar Orçamento'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}