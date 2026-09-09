"use client";

import { useEffect, useMemo, useState } from "react";
import Cropper, { type Area, type MediaSize, type Point } from "react-easy-crop";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { recortarImagem, calcularEstiloPreviewRecorte } from "@/lib/canvas-crop";

// 4:3 — não existe uma proporção fixa "de verdade" no card real
// (h-48 sm:h-64, largura fluida conforme a grade), mas 4:3 é a que
// mais se aproxima do card em telas de 3-4 colunas. Como o card final
// ainda aplica object-cover, o que importa aqui é padronizar o
// enquadramento entre fotos, não bater um valor exato.
const CROP_ASPECT_RATIO = 4 / 3;

interface ImageCropperModalProps {
  /** Presente = modal aberto, recortando este arquivo. `null` = fechado. */
  arquivo: File | null;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

export function ImageCropperModal({ arquivo, onCancel, onConfirm }: ImageCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [processando, setProcessando] = useState(false);

  // Toda vez que um novo arquivo entra (da fila do dropzone), gera a
  // object URL e zera crop/zoom — sem isso, o segundo arquivo da fila
  // abriria já zoomado/deslocado do jeito que o primeiro ficou.
  useEffect(() => {
    if (!arquivo) {
      setImageSrc(null);
      return;
    }

    const url = URL.createObjectURL(arquivo);
    setImageSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMediaSize(null);
    setAreaPixels(null);

    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  const estiloPreview = useMemo(() => {
    if (!mediaSize || !areaPixels) return undefined;
    return calcularEstiloPreviewRecorte(
      { width: mediaSize.naturalWidth, height: mediaSize.naturalHeight },
      areaPixels
    );
  }, [mediaSize, areaPixels]);

  const handleConfirmar = async () => {
    if (!imageSrc || !areaPixels) return;
    setProcessando(true);
    try {
      const blob = await recortarImagem(imageSrc, areaPixels);
      onConfirm(blob);
    } catch (error) {
      console.error("Erro ao recortar imagem:", error);
      toast.error("Não foi possível recortar esta imagem. Tente outra foto.");
    } finally {
      setProcessando(false);
    }
  };

  return (
    <Dialog open={arquivo !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ajustar foto</DialogTitle>
          <DialogDescription>
            Ajuste o enquadramento e o zoom. Todas as fotos do catálogo usam a mesma proporção
            (4:3) para ficarem uniformes na vitrine.
          </DialogDescription>
        </DialogHeader>

        {imageSrc && (
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Cropper */}
            <div className="flex-1">
              <div className="relative h-72 w-full overflow-hidden rounded-md bg-neutral-900">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={CROP_ASPECT_RATIO}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onMediaLoaded={setMediaSize}
                  onCropComplete={(_areaPercent, areaPx) => setAreaPixels(areaPx)}
                />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-primary"
                  aria-label="Zoom da imagem"
                />
              </div>
            </div>

            {/* Preview — mesma moldura do card real da vitrine (rounded-lg,
                shadow, bg, proporção 4:3), com título fictício, pra admin
                ver exatamente como vai ficar antes de confirmar. */}
            <div className="w-full select-none sm:w-48">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Preview na vitrine</p>
              <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-neutral-800">
                <div
                  className="aspect-[4/3] w-full bg-neutral-200 bg-no-repeat dark:bg-neutral-700"
                  style={estiloPreview ? { backgroundImage: `url(${imageSrc})`, ...estiloPreview } : undefined}
                />
                <div className="p-3">
                  <p className="truncate text-sm font-bold">Nome do Produto</p>
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                    Descrição de exemplo de como este produto vai aparecer no catálogo público.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={processando}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirmar} disabled={processando || !areaPixels}>
            {processando ? "Recortando..." : "Confirmar Corte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
