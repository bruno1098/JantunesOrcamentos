"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { buscarPedidoPorEmail, buscarPedidoPorId } from "@/lib/pedidos-service";
import { Pedido, ItemPedido, Endereco } from "../../types/pedido";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_COLORS = {
  "Pendente": "bg-yellow-100 text-yellow-800",
  "Em Análise": "bg-blue-100 text-blue-800",
  "Aprovado": "bg-green-100 text-green-800",
  "Entregue": "bg-purple-100 text-purple-800",
  "Finalizado": "bg-gray-100 text-gray-800",
  "Cancelado": "bg-red-100 text-red-800",
} as const;

export default function MeusPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busca, setBusca] = useState("");
  const [tipoBusca, setTipoBusca] = useState<"email" | "id">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [buscaAutomatica, setBuscaAutomatica] = useState(false);

  useEffect(() => {
    // Pegar parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const redirect = params.get('redirect');

    if (emailParam && redirect === 'true') {
      setBusca(emailParam);
      setTipoBusca("email");
      setBuscaAutomatica(true);
    }
  }, []);

  useEffect(() => {
    if (buscaAutomatica && busca) {
      handleBuscar();
      // Limpar a URL após a busca
      window.history.replaceState({}, '', '/meus-pedidos');
      setBuscaAutomatica(false);
    }
  }, [buscaAutomatica, busca]);

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleBuscar = async () => {
    if (!busca) {
      toast.error("Por favor, digite um email");
      return;
    }

    setIsLoading(true);
    try {
      const emailNormalizado = busca.toLowerCase().trim();
      console.log('Email sendo buscado:', emailNormalizado);
      
      // Verificar se é um email válido
      if (tipoBusca === "email" && !isValidEmail(emailNormalizado)) {
        toast.error("Email inválido");
        return;
      }

      // Log antes da chamada ao serviço
      console.log('Iniciando busca no Firebase...');
      
      const resultadoFirebase = await buscarPedidoPorEmail(emailNormalizado);
      
      // Log do resultado
      console.log('Resultado da busca:', resultadoFirebase);

      if (!resultadoFirebase || resultadoFirebase.length === 0) {
        console.log('Nenhum pedido encontrado');
        toast.error("Nenhum pedido encontrado para este email");
        setPedidos([]);
        return;
      }

      console.log(`Encontrados ${resultadoFirebase.length} pedidos`);
      setPedidos(resultadoFirebase);
      toast.success(`${resultadoFirebase.length} pedido(s) encontrado(s)`);

    } catch (error) {
      console.error("Erro detalhado na busca:", error);
      toast.error("Erro ao buscar pedidos. Tente novamente.");
      setPedidos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBuscar();
    }
  };

  return (
    <div className="container mx-auto pt-16 pb-8 px-2 sm:px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Meus Pedidos</h1>

        <div className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-lg mb-6">
          <div className="flex flex-col gap-3">
            <Button
              variant={tipoBusca === "email" ? "default" : "outline"}
              onClick={() => setTipoBusca("email")}
              className="w-full"
            >
              Buscar por Email
            </Button>
          
            <Input
              type={tipoBusca === "email" ? "email" : "text"}
              placeholder={tipoBusca === "email" ? "Digite seu email" : "Digite o número do pedido"}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
            <Button 
              onClick={handleBuscar} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⌛</span>
                  Buscando...
                </div>
              ) : (
                'Buscar'
              )}
            </Button>
          </div>
        </div>

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
                    <p className="text-sm text-gray-500">
                      {new Date(pedido.data).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-lg">
                      <h3 className="font-semibold mb-2 text-sm">Informações do Evento</h3>
                      <p className="text-sm">Data de Entrega: {new Date(pedido.dataEntrega).toLocaleDateString()}</p>
                      <p className="text-sm">Data de Retirada: {new Date(pedido.dataRetirada).toLocaleDateString()}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-lg">
                      <h3 className="font-semibold mb-2 text-sm">Local do Evento</h3>
                      <p className="text-sm">{pedido.endereco.rua}</p>
                      <p className="text-sm">{pedido.endereco.bairro}, {pedido.endereco.cidade} - {pedido.endereco.estado}</p>
                      <p className="text-sm">CEP: {pedido.endereco.cep}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-lg">
                    <h3 className="font-semibold mb-2 text-sm">Itens do Pedido</h3>
                    <ul className="space-y-2">
                      {pedido.itens.map((item: ItemPedido, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span>•</span>
                          <span>
                            {item.name} x {item.quantity}
                            {item.observation && (
                              <span className="block text-xs text-gray-500 mt-1">
                                {item.observation}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {pedido.mensagem && (
                    <div className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-lg">
                      <h3 className="font-semibold mb-2 text-sm">Mensagem</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{pedido.mensagem}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 