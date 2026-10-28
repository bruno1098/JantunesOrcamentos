"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Download, FileX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buscarProdutosAdmin } from "@/lib/produtos-service";

type Status = "carregando" | "pronto" | "vazio" | "erro";

interface CatalogoPronto {
  url: string;
  nomeArquivo: string;
  produtos: number;
  semFoto: number;
}

export default function AdminCatalogoPreviewPage() {
  const [status, setStatus] = useState<Status>("carregando");
  const [progresso, setProgresso] = useState<{ feitas: number; total: number } | null>(null);
  const [catalogo, setCatalogo] = useState<CatalogoPronto | null>(null);
  const [tentativa, setTentativa] = useState(0);

  // Gera o PDF uma vez ao abrir a tela (e de novo em "Tentar novamente"). O que se vê
  // no iframe é o próprio arquivo que o botão baixa — o que aparece é o que sai impresso.
  useEffect(() => {
    let cancelado = false;
    let urlCriada: string | null = null;

    setStatus("carregando");
    setProgresso(null);
    setCatalogo(null);

    (async () => {
      try {
        const produtos = await buscarProdutosAdmin();
        if (!produtos.some((p) => p.ativo)) {
          if (!cancelado) setStatus("vazio");
          return;
        }

        // Import dinâmico: o módulo do PDF lê `window` ao carregar e puxa o react-pdf
        // (pesado) — não pode rodar no render do servidor nem pesar o resto do admin.
        const { gerarCatalogoPDF } = await import("@/lib/catalogo-pdf");
        const gerado = await gerarCatalogoPDF(produtos, (feitas, total) => {
          if (!cancelado) setProgresso({ feitas, total });
        });
        if (cancelado) return;

        urlCriada = URL.createObjectURL(gerado.blob);
        setCatalogo({
          url: urlCriada,
          nomeArquivo: gerado.nomeArquivo,
          produtos: gerado.produtos,
          semFoto: gerado.semFoto,
        });
        setStatus("pronto");
      } catch (error) {
        console.error("Erro ao gerar o catálogo:", error);
        if (!cancelado) setStatus("erro");
      }
    })();

    return () => {
      cancelado = true;
      if (urlCriada) URL.revokeObjectURL(urlCriada);
    };
  }, [tentativa]);

  const montandoPdf = progresso !== null && progresso.feitas === progresso.total;
  const percentual = progresso ? Math.round((progresso.feitas / progresso.total) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" aria-label="Voltar para produtos">
            <Link href="/admin/produtos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Catálogo de Produtos</h1>
            <p className="text-sm text-muted-foreground">
              {catalogo
                ? `${catalogo.produtos} ${catalogo.produtos === 1 ? "produto ativo" : "produtos ativos"} · pré-visualização do PDF`
                : "Pré-visualização do PDF"}
            </p>
          </div>
        </div>

        {catalogo ? (
          <Button asChild>
            <a href={catalogo.url} download={catalogo.nomeArquivo}>
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </a>
          </Button>
        ) : (
          <Button disabled>
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        )}
      </div>

      {catalogo && catalogo.semFoto > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {catalogo.semFoto} {catalogo.semFoto === 1 ? "produto sai" : "produtos saem"} com o quadro
            “Sem foto” (imagem não cadastrada ou indisponível). Cadastre a foto em{" "}
            <Link href="/admin/produtos" className="font-medium underline">
              Produtos
            </Link>{" "}
            e reabra esta tela para atualizar.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground md:hidden">
        Em alguns celulares a pré-visualização não aparece — use o botão Baixar PDF.
      </p>

      <div className="relative min-h-[480px] flex-1 overflow-hidden rounded-lg border bg-neutral-100">
        {status === "carregando" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            <div>
              <p className="font-medium">Gerando catálogo...</p>
              <p className="text-sm text-muted-foreground">
                {progresso === null
                  ? "Buscando produtos"
                  : montandoPdf
                    ? "Montando o PDF"
                    : `Carregando fotos ${progresso.feitas}/${progresso.total}`}
              </p>
            </div>
            <div className="h-1.5 w-56 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all"
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>
        )}

        {status === "pronto" && catalogo && (
          <iframe
            title="Pré-visualização do catálogo em PDF"
            src={`${catalogo.url}#view=Fit&navpanes=0`}
            className="absolute inset-0 h-full w-full border-0"
          />
        )}

        {status === "vazio" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <FileX className="h-8 w-8 text-neutral-400" />
            <p className="font-medium">Nenhum produto ativo para o catálogo.</p>
            <p className="text-sm text-muted-foreground">
              Cadastre ou ative produtos para poder gerar o PDF.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin/produtos">Ir para produtos</Link>
            </Button>
          </div>
        )}

        {status === "erro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <p className="font-medium">Não foi possível gerar o catálogo.</p>
            <Button variant="outline" onClick={() => setTentativa((n) => n + 1)}>
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
