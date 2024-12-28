"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductFilter } from "@/components/product-filter";
import { ProductSkeleton } from "@/components/product-skeleton";
import { products } from "@/data/products";
import { Filter } from "lucide-react";
import Image from "next/image";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen py-12 md:py-20 px-3 md:px-8">
      <motion.div 
        className="pt-8 md:pt-0"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-6xl font-bold text-center mb-4 md:mb-12"
        >
          Nossos Produtos
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Produtos em Destaque</h2>
          
          <div className="relative">
            {/* Área de scroll horizontal */}
            <div className="overflow-x-auto pb-6 scrollbar-hide">
              <div className="flex space-x-6 px-4 md:px-8">
                {[
                  // Pegar os primeiros produtos não-mobiliário
                  ...products
                    .filter(p => p.category !== 'mobiliario')
                    .slice(0, 8), // Pega apenas os 8 primeiros produtos não-mobiliário
                  // Adiciona os produtos de mobiliário por último
                  ...products
                    .filter(p => p.category === 'mobiliario')
                    .slice(0, 2)
                ].map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-shrink-0 w-[280px] group"
                  >
                    <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full">
                      <div className="relative h-[320px]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-opacity duration-300" />
                        
                        {/* Tag de categoria */}
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-white/90 dark:bg-black/90 rounded-full text-xs font-medium">
                            {product.category === 'toalhas' || 
                             product.category === 'toalhas-redondas' || 
                             product.category === 'toalhas-quadradas' ? 'Toalhas' :
                             product.category === 'guardanapos' ? 'Guardanapos' :
                             product.category === 'trilhos' ? 'Trilhos' : 
                            product.category === 'mobiliario' ? 'Mobiliário' : 'Mobiliário'}
                          </span>
                        </div>

                        {/* Nome do produto sobreposto à imagem */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-semibold text-lg text-white line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-white/80 line-clamp-2 mt-2">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Gradientes de fade nas laterais ajustados */}
            <div className="absolute left-0 top-0 bottom-6 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-6 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">Nosso Catálogo Completo</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore nossa coleção completa e selecione os produtos para seu orçamento. 
            Personalize sua escolha utilizando os filtros abaixo.
          </p>
        </motion.div>

        <div className="md:hidden mb-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Filter size={18} />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg border bg-background text-foreground appearance-none"
            >
              <option value="all">Todos Produtos</option>
              <option value="toalhas">Toalhas de Mesa</option>
              <option value="toalhas-redondas">Toalhas de Mesa Redonda</option>
              <option value="toalhas-quadradas">Toalhas de Mesa Quadrada</option>
              <option value="guardanapos">Guardanapos</option>
              <option value="trilhos">Trilhos de Mesa</option>
              <option value="mobiliario">Mobiliário</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <ProductFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 mt-6 md:mt-12"
      >
        {isLoading ? (
          Array(6).fill(0).map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : (
          filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16 max-w-3xl mx-auto text-center bg-secondary/50 rounded-lg p-6 md:p-8"
      >
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Não encontrou o que procura?
        </h2>
        <p className="text-muted-foreground mb-6">
          Oferecemos soluções personalizadas para seu evento! Se você não encontrou o produto com as medidas, cores ou características específicas que precisa, entre em contato conosco. Podemos avaliar a possibilidade de personalização ou fabricação sob medida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/contato"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Fale Conosco
          </a>
          <a
            href="https://wa.me/5511940224459"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </motion.div>
    </div>
  );
}