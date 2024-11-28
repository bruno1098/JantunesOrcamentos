"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { ShoppingCart } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Modal from "react-modal";
import { getCartIconPosition } from "@/utils/dom-utils";
import { X } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  const [elementPosition, setElementPosition] = useState({ left: 0, top: 0 });
  const productRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    addItem({ ...product, quantity, observation });
    setIsAdding(false);
    setIsModalOpen(false);
    
    setQuantity(1);
    setObservation("");

    const productElement = productRef.current;
    if (!productElement) return;

    const productRect = productElement.getBoundingClientRect();
    const cartPosition = getCartIconPosition();
    
    setElementPosition({
      left: isMobile ? 
        productRect.left + (productRect.width / 2) - 15 :
        productRect.left + (productRect.width / 2) - 15,
      top: isMobile ? 
        productRect.top + (productRect.height / 2) - 15 :
        productRect.top + (productRect.height / 2) - 15
    });
    
    const targetX = cartPosition.x - (productRect.left + productRect.width / 2);
    const targetY = cartPosition.y - (productRect.top + productRect.height / 2);

    setAnimationPosition({
      x: targetX,
      y: targetY
    });

    setShowModal(false);
    setTimeout(() => {
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
      }, 1200);
    }, 300);
  };
  const [showFullImage, setShowFullImage] = useState(false);

  // Animação de entrada
  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 50,
      scale: 0.9,
      filter: "blur(10px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        delay: index * 0.1, // Efeito cascata
        ease: [0.23, 1, 0.32, 1],
        scale: {
          type: "spring",
          damping: 15,
          stiffness: 100
        }
      }
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <motion.div
        ref={productRef}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="group relative bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
      >
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <CardContent className="p-3 sm:p-6 flex-grow">
          <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base line-clamp-3">
            {product.description}
          </p>
        </CardContent>
        <CardFooter className="p-3 sm:p-6 pt-0">
          <Button 
            className="w-full text-sm sm:text-base py-2"
            onClick={() => setIsModalOpen(true)}
            disabled={isAdding}
          >
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">Adicionar ao Carrinho</span>
              </>
            )}
          </Button>
        </CardFooter>
      </motion.div>

      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ 
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0
            }}
            animate={{ 
              opacity: 0,
              scale: 0.5,
              x: animationPosition.x,
              y: animationPosition.y
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.2,
              ease: isMobile ? [0.2, 0, 0.4, 1] : [0.4, 0, 0.2, 1],
              type: "tween"
            }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: elementPosition.left,
              top: elementPosition.top,
              width: isMobile ? "30px" : "40px",
              height: isMobile ? "30px" : "40px",
            }}
          >
            <motion.div
              className="w-full h-full relative"
              animate={{
                scaleX: [1, 1.2, 0.8, 1],
                scaleY: [1, 0.8, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-sm" />
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
                animate={{
                  borderRadius: ["50%", "40% 60% 70% 30%", "40% 60%"],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover scale-150 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent mix-blend-overlay" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Adicionar ao Carrinho"
        className="modal fixed bg-background text-foreground p-4 md:p-6 rounded-lg w-[95%] md:max-w-md absolute top-[5%] md:top-1/2 left-1/2 transform -translate-x-1/2 md:-translate-y-1/2 shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-[90vh] overflow-y-auto"
        overlayClassName="modal-overlay fixed inset-0 bg-black/75 flex items-start md:items-center justify-center backdrop-blur-sm"
      >
        <div className="flex flex-col items-start gap-4 mb-6">
          <div 
            className="relative w-full h-48 md:h-64 flex-shrink-0 cursor-zoom-in group"
            onClick={() => setShowFullImage(true)}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover rounded-md"
            />
            <div className={`absolute inset-0 flex items-center justify-center ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity bg-black/20 rounded-md`}>
              <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                Clique para ampliar
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{product.name}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {product.description}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Quantidade:</label>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Observações:</label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700"
            rows={4}
          ></textarea>
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddToCart}>
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Adicionar"
            )}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showFullImage}
        onRequestClose={() => setShowFullImage(false)}
        className="modal fixed inset-0 bg-black/95 flex items-center justify-center p-4"
        overlayClassName="modal-overlay"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-black dark:text-white" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>
        </div>
      </Modal>
    </>
  );
}