"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { buscarPedidoPorId, atualizarPedido } from "@/lib/pedidos-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MapPin, Calendar, Mail, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pedido } from "@/types/pedido";

const STATUS_COLORS = {
  "Pendente": "bg-yellow-100 text-yellow-800",
  "Em Análise": "bg-blue-100 text-blue-800",
  "Aprovado": "bg-green-100 text-green-800",
  "Entregue": "bg-purple-100 text-purple-800",
  "Finalizado": "bg-gray-100 text-gray-800",
  "Cancelado": "bg-red-100 text-red-800",
};

const STATUS_OPTIONS = [
  "Pendente",
  "Em Análise",
  "Aprovado",
  "Entregue",
  "Finalizado",
  "Cancelado",
];

export default function PedidoDetalhes({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    
    console.log("ID do pedido na URL:", params.id); // Debug
    carregarPedido();
  }, [params.id]);

  const carregarPedido = async () => {
    try {
      setIsLoading(true);
      const resultado = await buscarPedidoPorId(params.id);
      
      console.log("Resultado da busca:", resultado); // Debug
      
      if (!resultado) {
        toast.error("Pedido não encontrado");
        return;
      }
      
      setPedido(resultado);
    } catch (error) {
      console.error("Erro ao carregar pedido:", error);
      toast.error("Erro ao carregar detalhes do pedido");
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarStatus = async (novoStatus: string) => {
    try {
      setIsLoading(true);
      
      if (!pedido) {
        toast.error("Pedido não encontrado");
        return;
      }

      await atualizarPedido(pedido.id, {
        status: novoStatus,
        dataAtualizacao: new Date().toISOString()
      });

      // Atualizar o estado local
      setPedido(prev => prev ? { ...prev, status: novoStatus } : null);
      
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Pedido não encontrado</h2>
              <p className="text-muted-foreground">
                O pedido que você está procurando não existe ou foi removido.
              </p>
              <Button onClick={() => router.push("/admin/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Pedido #{pedido.id}</h1>
          <Button
            variant="default"
            onClick={() => router.push(`/admin/pedidos/${pedido.id}/orcamento`)}
            className="ml-auto"
          >
            Gerar Orçamento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Status do Pedido</CardTitle>
                <Select
                  value={pedido.status}
                  onValueChange={atualizarStatus}
                  disabled={atualizandoStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[pedido.status as keyof typeof STATUS_COLORS]}`}>
                    {pedido.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Última atualização: {pedido.dataAtualizacao ? 
                      format(new Date(pedido.dataAtualizacao.toDate()), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) :
                      "Não disponível"
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes do Evento */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Evento</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Data do Evento</span>
                    </div>
                    <p>{format(new Date(pedido.dataEntrega), "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email</span>
                    </div>
                    <p>{pedido.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Itens do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pedido.itens.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow">
                      {item.image && (
                        <div className="relative w-24 h-24">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity}
                        </p>
                        {item.observation && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Observação: {item.observation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço do Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>{pedido.endereco.rua}, {pedido.endereco.numero}</p>
                  {pedido.endereco.complemento && (
                    <p>{pedido.endereco.complemento}</p>
                  )}
                  <p>{pedido.endereco.bairro}</p>
                  <p>{pedido.endereco.cidade} - {pedido.endereco.estado}</p>
                  <p>CEP: {pedido.endereco.cep}</p>
                </div>

                {pedido.endereco.latitude && pedido.endereco.longitude && (
                  <div className="mt-4">
                    <iframe
                      width="100%"
                      height="200"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        pedido.endereco.longitude - 0.01
                      },${pedido.endereco.latitude - 0.01},${
                        pedido.endereco.longitude + 0.01
                      },${pedido.endereco.latitude + 0.01
                      }&layer=mapnik&marker=${pedido.endereco.latitude},${
                        pedido.endereco.longitude
                      }`}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mensagem */}
            {pedido.mensagem && (
              <Card>
                <CardHeader>
                  <CardTitle>Mensagem do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{pedido.mensagem}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 