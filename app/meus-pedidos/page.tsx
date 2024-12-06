"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { buscarPedidoPorEmail, buscarPedidoPorId } from "@/lib/pedidos-service";
import { motion } from "framer-motion";
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

  const handleBuscar = async () => {
    if (!busca) {
      toast.error("Digite um email ou número do pedido");
      return;
    }

    setIsLoading(true);
    try {
      let resultadoFirebase: Pedido[];
      
      if (tipoBusca === "email") {
        resultadoFirebase = await buscarPedidoPorEmail(busca);
      } else {
        const pedido = await buscarPedidoPorId(busca);
        resultadoFirebase = pedido ? [pedido] : [];
      }

      setPedidos(resultadoFirebase);
      
      if (resultadoFirebase.length === 0) {
        toast.error("Nenhum pedido encontrado");
      } else {
        toast.success(`${resultadoFirebase.length} pedido(s) encontrado(s)`);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      toast.error("Erro ao buscar pedidos");
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
    <div className="container mx-auto pt-24 pb-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Meus Pedidos</h1>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Button
              variant={tipoBusca === "email" ? "default" : "outline"}
              onClick={() => setTipoBusca("email")}
              className="flex-1 md:flex-none"
            >
              Buscar por Email
            </Button>
            <Button
              variant={tipoBusca === "id" ? "default" : "outline"}
              onClick={() => setTipoBusca("id")}
              className="flex-1 md:flex-none"
            >
              Buscar por Número do Pedido
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type={tipoBusca === "email" ? "email" : "text"}
              placeholder={tipoBusca === "email" ? "Digite seu email" : "Digite o número do pedido"}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleBuscar} 
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">⌛</span>
                  Buscando...
                </div>
              ) : (
                'Buscar'
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} className="mb-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Pedido #{pedido.id}</CardTitle>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    STATUS_COLORS[pedido.status as keyof typeof STATUS_COLORS]
                  }`}>
                    {pedido.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{pedido.nomeEvento}</h2>
                    <p className="text-sm text-gray-500">
                      Pedido #{pedido.id} - {new Date(pedido.data).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold mb-2">Informações do Evento</h3>
                    <p>Data de Entrega: {new Date(pedido.dataEntrega).toLocaleDateString()}</p>
                    <p>Data de Retirada: {new Date(pedido.dataRetirada).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Local do Evento</h3>
                    <p>{pedido.endereco.rua}</p>
                    <p>{pedido.endereco.bairro}, {pedido.endereco.cidade} - {pedido.endereco.estado}</p>
                    <p>CEP: {pedido.endereco.cep}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Itens do Pedido</h3>
                  <ul className="list-disc list-inside">
                    {pedido.itens.map((item: ItemPedido, index) => (
                      <li key={index}>
                        {item.name} x {item.quantity}
                        {item.observation && <span className="text-sm text-gray-500"> - {item.observation}</span>}
                      </li>
                    ))}
                  </ul>
                </div>

                {pedido.mensagem && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Mensagem</h3>
                    <p className="text-gray-600">{pedido.mensagem}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 