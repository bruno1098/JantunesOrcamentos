import { isValidImageUrl } from "@/lib/image-utils";

/**
 * Prepara as imagens do catálogo em PDF (components/admin/catalogo-pdf.tsx).
 *
 * O react-pdf só entende JPG/PNG e, no browser, busca cada imagem com um
 * `fetch` cru — então WebP/AVIF quebram o PDF inteiro e hosts sem CORS
 * liberado falham. Aqui cada foto é baixada, recortada em quadrado
 * (mesmo `object-cover` da listagem do admin), reduzida e convertida
 * para JPEG em data URL: formato garantido, PDF leve e fotos uniformes.
 */

const LADO_FOTO_PX = 320;
const QUALIDADE_JPEG = 0.82;
const TIMEOUT_MS = 15_000;
const CONCORRENCIA = 6;

async function baixarBlob(url: string): Promise<Blob> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resposta = await fetch(url, { signal: controller.signal });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return await resposta.blob();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Tenta direto (Supabase Storage libera CORS); se o host não liberar,
 * cai no otimizador do próprio Next (mesma origem, então sem CORS) —
 * ele só serve os hosts de next.config.js, os mesmos que
 * `isValidImageUrl` já deixa passar. 384 é um dos `imageSizes` do config.
 */
async function baixarFoto(url: string): Promise<Blob> {
  try {
    return await baixarBlob(url);
  } catch (erroDireto) {
    if (!/^https?:\/\//i.test(url)) throw erroDireto;
    return baixarBlob(`/_next/image?url=${encodeURIComponent(url)}&w=384&q=80`);
  }
}

function decodificar(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Imagem inválida"));
    };
    img.src = objectUrl;
  });
}

/** Devolve a foto como data URL JPEG quadrada, ou `null` se não der pra usá-la. */
async function fotoParaJpegQuadrado(url: string): Promise<string | null> {
  if (!isValidImageUrl(url)) return null;

  try {
    const img = await decodificar(await baixarFoto(url));
    const lado = Math.min(img.naturalWidth, img.naturalHeight);
    if (lado === 0) throw new Error("Imagem sem dimensões");

    const destino = Math.min(LADO_FOTO_PX, lado);
    const canvas = document.createElement("canvas");
    canvas.width = destino;
    canvas.height = destino;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível");

    // JPEG não tem transparência: sem o fundo branco, PNG transparente sairia preto.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, destino, destino);
    ctx.drawImage(
      img,
      (img.naturalWidth - lado) / 2,
      (img.naturalHeight - lado) / 2,
      lado,
      lado,
      0,
      0,
      destino,
      destino
    );

    return canvas.toDataURL("image/jpeg", QUALIDADE_JPEG);
  } catch (error) {
    console.warn("Catálogo: foto ignorada:", url, error);
    return null;
  }
}

/**
 * Prepara todas as fotos (sem repetir download de URLs iguais), com
 * poucas conexões em paralelo. Foto que falha vira `null` — o PDF
 * mostra um quadro "Sem foto" em vez de abortar.
 */
export async function prepararFotos(
  urls: string[],
  onProgresso?: (feitas: number, total: number) => void
): Promise<Record<string, string | null>> {
  const unicas = Array.from(new Set(urls));
  const fotos: Record<string, string | null> = {};
  let proxima = 0;
  let feitas = 0;

  const trabalhador = async () => {
    while (proxima < unicas.length) {
      const url = unicas[proxima++];
      fotos[url] = await fotoParaJpegQuadrado(url);
      onProgresso?.(++feitas, unicas.length);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCORRENCIA, unicas.length) }, trabalhador)
  );
  return fotos;
}

export interface LogoCatalogo {
  src: string;
  /** largura / altura do logo já aparado. */
  proporcao: number;
}

/**
 * O logo em /images/logo.png tem muita margem transparente (a arte
 * ocupa ~60% da área); aparamos pra ele poder ser dimensionado pelo
 * conteúdo real, tanto na capa quanto no cabeçalho pequeno das páginas.
 */
export async function carregarLogo(): Promise<LogoCatalogo | null> {
  try {
    const img = await decodificar(await baixarBlob("/images/logo.png"));
    const largura = img.naturalWidth;
    const altura = img.naturalHeight;

    const origem = document.createElement("canvas");
    origem.width = largura;
    origem.height = altura;
    const ctxOrigem = origem.getContext("2d");
    if (!ctxOrigem) throw new Error("Canvas indisponível");
    ctxOrigem.drawImage(img, 0, 0);

    const { data } = ctxOrigem.getImageData(0, 0, largura, altura);
    let minX = largura;
    let minY = altura;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        if (data[(y * largura + x) * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) throw new Error("Logo totalmente transparente");

    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const aparado = document.createElement("canvas");
    aparado.width = w;
    aparado.height = h;
    aparado.getContext("2d")?.drawImage(origem, minX, minY, w, h, 0, 0, w, h);

    return { src: aparado.toDataURL("image/png"), proporcao: w / h };
  } catch (error) {
    console.warn("Catálogo: logo ignorado:", error);
    return null;
  }
}
