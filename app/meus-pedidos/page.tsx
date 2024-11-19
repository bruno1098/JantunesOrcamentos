"use client";

import { useEffect, useState } from "react";

interface Pedido {
  id: number;
  data: string;
  email: string;
  nomeEvento: string;
  endereco: {
    cep: string;
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  dataEntrega: string;
  dataRetirada: string;
  itens: Array<{
    id: string;
    name: string;
    quantity: number;
    observation?: string;
  }>;
  mensagem: string;
  status: string;
}

export default function MeusPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    const carregarPedidos = async () => {
      try {
        const pedidosSalvos = await localStorage.getItem('pedidos');
        if (pedidosSalvos) {
          setPedidos(JSON.parse(pedidosSalvos));
        }
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
      }
    };

    carregarPedidos();
  }, []);

  return (
    <div className="container mx-auto pt-24 pb-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Meus Pedidos</h1>

        <div className="space-y-6">
          {pedidos.length === 0 ? (
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Nenhum pedido encontrado.</p>
            </div>
          ) : (
            pedidos.map((pedido) => (
              <div 
                key={pedido.id} 
                className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{pedido.nomeEvento}</h2>
                    <p className="text-sm text-gray-500">
                      Pedido #{pedido.id} - {new Date(pedido.data).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                    {pedido.status}
                  </span>
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
                    {pedido.itens.map((item, index) => (
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 