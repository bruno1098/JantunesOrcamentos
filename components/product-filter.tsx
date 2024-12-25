"use client";

import { Button } from "@/components/ui/button";

interface ProductFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ProductFilter({
  selectedCategory,
  onCategoryChange,
}: ProductFilterProps) {
  const categories = [
    { id: "all", name: "Todos Produtos" },
    { id: "toalhas", name: "Toalhas de Mesa" },
    { id: "toalhas-redondas", name: "Toalhas de Mesa Redonda" },
    { id: "toalhas-quadradas", name: "Toalhas de Mesa Quadrada" },
    { id: "guardanapos", name: "Guardanapos" },
    { id: "trilhos", name: "Trilhos de Mesa" },
    { id: "mobiliario", name: "Mobiliário" }
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}

