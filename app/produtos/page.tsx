"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductFilter } from "@/components/product-filter";
import { products } from "@/data/products";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen py-12 md:py-20 px-3 md:px-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-6xl font-bold text-center mb-8 md:mb-12"
      >
        Nossos Produtos
      </motion.h1>

      <ProductFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 mt-8 md:mt-12"
      >
        {filteredProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </motion.div>
    </div>
  );
}