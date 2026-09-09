"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { ItemPedido } from "@/types/pedido";
import { STATUS_COLORS } from "@/lib/constants";
import { isValidImageUrl } from "@/lib/image-utils";
import { ImageOff } from "lucide-react";
import type { BuscarPedidosResult } from "@/app/api/meus-pedidos/email/route";
import type { PedidoComOrcamento } from "@/app/api/meus-pedidos/_lib";
import { MapaEnderecoLazy as MapaEndereco } from "@/components/mapa/mapa-endereco-lazy";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MetodoBusca = "email" | "numero";

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const formatarData = (iso: string) => format(new Date(iso), "dd/MM/yyyy", { locale: ptBR });

export default function MeusPedidosPage() {
  const [metodoBusca, setMetodoBusca] = useState<MetodoBusca>("email");
  const [termoBusca, setTermoBusca] = useState("");
  const [pedidos, setPedidos] = useState<PedidoComOrcamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [jaBuscou, setJaBuscou] = useState(false);

  const trocarMetodo = (metodo: MetodoBusca) => {
    setMetodoBusca(metodo);
    setTermoBusca("");
    setPedidos([]);
    setJaBuscou(false);
  };

  const handleBuscar = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!termoBusca.trim()) {
      toast.error(
        metodoBusca === "email" ? "Por favor, digite um e-mail" : "Por favor, digite o número do pedido"
      );
      return;
    }

    setIsLoading(true);
    try {
      // Route Handler (não Server Action — ver app/api/meus-pedidos/email/route.ts
      // para o porquê) — o termo buscado nunca fica exposto em URL ou
      // query string, só no corpo do POST, e a consulta em si roda
      // inteiramente no servidor via uma função SQL estreita.
      const endpoint =
        metodoBusca === "email" ? "/api/meus-pedidos/email" : "/api/meus-pedidos/numero";
      const body = metodoBusca === "email" ? { email: termoBusca } : { numero: termoBusca };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const resultado = (await response.json()) as BuscarPedidosResult;
      setJaBuscou(true);

      if (!resultado.success) {
        toast.error(resultado.message ?? "Erro ao buscar pedidos. Tente novamente.");
        setPedidos([]);
        return;
      }

      setPedidos(resultado.pedidos);

      if (resultado.pedidos.length === 0) {
        toast.error(resultado.message ?? "Nenhum pedido encontrado.");
      } else {
        toast.success(`${resultado.pedidos.length} pedido(s) encontrado(s)`);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      toast.error("Erro ao buscar pedidos. Tente novamente.");
      setPedidos([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto pt-16 pb-8 px-2 sm:px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Meus Pedidos</h1>

        <form
          onSubmit={handleBuscar}
          className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-lg mb-6"
        >
          <div className="flex flex-col gap-3">
            <div className="flex gap-2" role="tablist" aria-label="Buscar por">
              <button
                type="button"
                role="tab"
                aria-selected={metodoBusca === "email"}
                onClick={() => trocarMetodo("email")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  metodoBusca === "email"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                Buscar por E-mail
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={metodoBusca === "numero"}
                onClick={() => trocarMetodo("numero")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  metodoBusca === "numero"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                Buscar por Nº do Pedido
              </button>
            </div>

            <label htmlFor="termo-busca" className="text-sm font-medium">
              {metodoBusca === "email"
                ? "Digite o e-mail usado no pedido para consultar o status"
                : "Digite o número do pedido (ex: 10042) para consultar o status"}
            </label>
            <Input
              id="termo-busca"
              type={metodoBusca === "email" ? "email" : "text"}
              inputMode={metodoBusca === "numero" ? "numeric" : undefined}
              placeholder={metodoBusca === "email" ? "seu@email.com" : "Ex: 10042"}
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              autoComplete={metodoBusca === "email" ? "email" : "off"}
              className="w-full"
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⌛</span>
                  Buscando...
                </div>
              ) : (
                "Buscar"
              )}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} className="mb-4">
              <CardHeader className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <CardTitle className="text-lg sm:text-xl">Pedido #{pedido.id}</CardTitle>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    STATUS_COLORS[pedido.status as keyof typeof STATUS_COLORS]
                  }`}>
                    {pedido.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{pedido.nomeEvento}</h2>
                    <p className="text-sm text-gray-500">Solicitado em {formatarData(pedido.data)}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-lg">
                      <h3 className="font-semibold mb-2 text-sm">Informações do Evento</h3>
                      <p className="text-sm">Entrega: {formatarData(pedido.dataEntrega)}</p>
                      <p className="text-sm">Retirada: {formatarData(pedido.dataRetirada)}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-lg">
                      <h3 className="font-semibold mb-2 text-sm">Local do Evento</h3>
                      <p className="text-sm">
                        {pedido.endereco.rua}
                        {pedido.endereco.numero && `, ${pedido.endereco.numero}`}
                      </p>
                      {pedido.endereco.complemento && (
                        <p className="text-sm">{pedido.endereco.complemento}</p>
                      )}
                      <p className="text-sm">
                        {pedido.endereco.bairro}, {pedido.endereco.cidade} - {pedido.endereco.estado}
                      </p>
                      {pedido.endereco.cep && <p className="text-sm">CEP: {pedido.endereco.cep}</p>}
                    </div>
                  </div>

                  {pedido.endereco.latitude && pedido.endereco.longitude && (
                    <div className="h-[200px] overflow-hidden rounded-lg border">
                      <MapaEndereco
                        latitude={pedido.endereco.latitude}
                        longitude={pedido.endereco.longitude}
                      />
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-lg">
                    <h3 className="font-semibold mb-3 text-sm">Itens do Pedido</h3>
                    <ul className="space-y-3">
                      {pedido.itens.map((item: ItemPedido, index) => {
                        const valorUnitario = pedido.orcamento?.itens.find(
                          (i) => i.id === item.id
                        )?.valorUnitario;
                        return (
                          <li key={index} className="flex items-start gap-3">
                            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
                              {isValidImageUrl(item.image) ? (
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageOff className="h-4 w-4 text-neutral-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 text-sm">
                              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                <span className="font-medium">
                                  {item.name}{" "}
                                  <span className="text-muted-foreground">x {item.quantity}</span>
                                </span>
                                {typeof valorUnitario === "number" && valorUnitario > 0 && (
                                  <span className="whitespace-nowrap text-muted-foreground">
                                    {formatarMoeda(valorUnitario)} un. ·{" "}
                                    {formatarMoeda(valorUnitario * item.quantity)}
                                  </span>
                                )}
                              </div>
                              {item.observation && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Sua observação: {item.observation}
                                </p>
                              )}
                              {item.adminResponse && (
                                <p className="mt-1 text-xs text-primary">
                                  Resposta: {item.adminResponse}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {pedido.mensagem && (
                    <div className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-lg">
                      <h3 className="font-semibold mb-2 text-sm">Mensagem</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{pedido.mensagem}</p>
                    </div>
                  )}

                  {pedido.orcamento ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                      <h3 className="mb-2 text-sm font-semibold">Valores do Orçamento</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Frete</span>
                          <span>{formatarMoeda(pedido.orcamento.valorFrete)}</span>
                        </div>
                        <div className="flex justify-between border-t border-green-200 pt-1 text-base font-semibold dark:border-green-900">
                          <span>Total</span>
                          <span>{formatarMoeda(pedido.orcamento.valorTotal)}</span>
                        </div>
                        {pedido.orcamento.formaPagamento && (
                          <p className="pt-1 text-muted-foreground">
                            Forma de pagamento: {pedido.orcamento.formaPagamento}
                          </p>
                        )}
                        <p className="text-muted-foreground">
                          Válido até: {format(new Date(pedido.orcamento.dataValidade), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        {pedido.orcamento.observacoes && (
                          <p className="pt-1 text-muted-foreground">
                            Obs. do orçamento: {pedido.orcamento.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      Ainda não precificamos este pedido — assim que o orçamento estiver pronto, o valor aparece aqui.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {jaBuscou && !isLoading && pedidos.length === 0 && (
            <p className="text-center text-muted-foreground">
              {metodoBusca === "email"
                ? "Nenhum pedido encontrado para este e-mail."
                : "Nenhum pedido encontrado com este número."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
