"use client";

import Image from "next/image";
import { GripVertical, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Uma imagem do formulário de produto (Fase 9.5) — uma lista só,
 * misturando o que já estava salvo com o que acabou de ser recortado
 * nesta sessão de edição, pra dar pra arrastar as duas em conjunto e
 * definir UMA ordem final (é essa ordem que vira `imagens[]` no banco).
 */
export type ImagemFormItem =
  | { id: string; tipo: "existente"; url: string }
  | { id: string; tipo: "nova"; blob: Blob; previewUrl: string };

interface SortableImageListProps {
  itens: ImagemFormItem[];
  onReordenar: (itens: ImagemFormItem[]) => void;
  onRemover: (id: string) => void;
}

export function SortableImageList({ itens, onReordenar, onRemover }: SortableImageListProps) {
  // `distance: 4` — precisa mover 4px antes de virar drag, senão um
  // clique simples no botão de remover/no grip já dispararia um drag.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const indiceAntigo = itens.findIndex((item) => item.id === active.id);
    const indiceNovo = itens.findIndex((item) => item.id === over.id);
    if (indiceAntigo === -1 || indiceNovo === -1) return;

    onReordenar(arrayMove(itens, indiceAntigo, indiceNovo));
  };

  if (itens.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itens.map((item) => item.id)} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-2">
          {itens.map((item, index) => (
            <SortableThumb
              key={item.id}
              item={item}
              ehCapa={index === 0}
              onRemover={() => onRemover(item.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableThumb({
  item,
  ehCapa,
  onRemover,
}: {
  item: ImagemFormItem;
  ehCapa: boolean;
  onRemover: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const src = item.tipo === "existente" ? item.url : item.previewUrl;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative h-20 w-20 overflow-hidden rounded-md border-2 bg-neutral-100 dark:bg-neutral-800 ${
        ehCapa ? "border-primary" : "border-transparent"
      } ${isDragging ? "z-10 opacity-70" : ""}`}
    >
      <Image src={src} alt="Imagem do produto" fill className="pointer-events-none object-cover" />

      {/* imagens[0] é sempre espelhada em imagem_url (ver sqls/10_add_multiple_images_to_produtos.sql)
          — é a foto usada em qualquer lugar do app que ainda mostra só
          uma imagem (carrinho, listagem do admin, PDF). */}
      {ehCapa && (
        <span className="absolute left-0.5 top-0.5 rounded bg-primary px-1 py-0.5 text-[10px] font-medium leading-none text-primary-foreground">
          Capa
        </span>
      )}

      <button
        type="button"
        onClick={onRemover}
        className="absolute right-0.5 top-0.5 rounded-full bg-black/70 p-0.5 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
        aria-label="Remover esta imagem"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Alça de arrastar dedicada (não o card inteiro) — evita que
          clicar no botão de remover dispare um drag por engano. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute inset-x-0 bottom-0 flex cursor-grab items-center justify-center bg-black/50 py-0.5 text-white opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
