// Utilitário de recorte de imagem (Fase 9.5) — usado pelo
// components/admin/image-cropper-modal.tsx. Só roda no browser (usa
// HTMLImageElement/canvas), nunca no servidor.

import type { CSSProperties } from "react";

export interface AreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

function criarImagemElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagem = new window.Image();
    imagem.addEventListener("load", () => resolve(imagem));
    imagem.addEventListener("error", (erro) => reject(erro));
    // Evita canvas "tainted" (getContext/toBlob bloqueado) se um dia a
    // imagem vier de outra origem — inofensivo pra blob: URLs locais.
    imagem.crossOrigin = "anonymous";
    imagem.src = url;
  });
}

/**
 * Recorta `imageSrc` de acordo com `area` (a saída de `onCropComplete`
 * do react-easy-crop, já em pixels da imagem original) e devolve um
 * Blob JPEG pronto pra upload — mesmo formato que o resto do app já
 * envia pro Storage (ver app/admin/produtos/actions.ts).
 */
export async function recortarImagem(imageSrc: string, area: AreaPixels): Promise<Blob> {
  const imagem = await criarImagemElement(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Não foi possível criar o contexto de canvas para recortar a imagem.");
  }

  ctx.drawImage(
    imagem,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Falha ao gerar a imagem recortada."));
      },
      "image/jpeg",
      0.9
    );
  });
}

/**
 * Estilo CSS (background-size/position) que reproduz EXATAMENTE o
 * mesmo recorte que `recortarImagem` vai gerar, sem redesenhar nenhum
 * canvas — é só matemática sobre `background-position` em porcentagem.
 * Usado pro preview "ao vivo" no modal, atualizado a cada frame que o
 * react-easy-crop reporta uma nova área via onCropComplete.
 *
 * Dedução: com `background-size: SX% SY%`, a imagem cheia (W×H) ocupa
 * `W*(SX/100)` × `H*(SY/100)` px dentro do elemento. Pra fila do recorte
 * (cropW de largura) preencher 100% do elemento, `SX = (W/cropW)*100`.
 * `background-position: PX%` desloca a imagem por
 * `PX/100 * (larguraElemento - larguraImagemRenderizada)` — isolando
 * `PX` pra que o pixel `area.x` da imagem original caia exatamente na
 * borda esquerda do elemento dá `PX = area.x / (W - cropW) * 100`.
 */
export function calcularEstiloPreviewRecorte(
  imagemNatural: { width: number; height: number },
  area: AreaPixels
): CSSProperties {
  const { width: W, height: H } = imagemNatural;
  const { x, y, width: cropW, height: cropH } = area;

  if (!W || !H || !cropW || !cropH) return {};

  const sizeX = (W / cropW) * 100;
  const sizeY = (H / cropH) * 100;
  const posX = W === cropW ? 0 : (x / (W - cropW)) * 100;
  const posY = H === cropH ? 0 : (y / (H - cropH)) * 100;

  return {
    backgroundSize: `${sizeX}% ${sizeY}%`,
    backgroundPosition: `${posX}% ${posY}%`,
  };
}
