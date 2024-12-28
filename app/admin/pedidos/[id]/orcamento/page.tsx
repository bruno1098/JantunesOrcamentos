"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buscarPedidoPorId } from "@/lib/pedidos-service";
import { Pedido, ItemPedido } from "@/types/pedido";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OrcamentoPDF } from "@/components/orcamento-pdf";
import { pdf } from "@react-pdf/renderer";

interface ItemOrcamento extends ItemPedido {
  valorUnitario: number;
}

interface Orcamento {
  pedidoId: string;
  itens: ItemOrcamento[];
  valorFrete: number;
  valorTotal: number;
  observacoes: string;
  dataValidade: Date;
  formaPagamento: string;
}

export default function OrcamentoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [orcamento, setOrcamento] = useState<Orcamento>({
    pedidoId: params.id,
    itens: [],
    valorFrete: 0,
    valorTotal: 0,
    observacoes: "",
    dataValidade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    formaPagamento: ""
  });

  useEffect(() => {
    carregarPedido();
  }, [params.id]);

  const carregarPedido = async () => {
    setIsLoading(true);
    try {
      const resultado = await buscarPedidoPorId(params.id);
      if (!resultado) {
        toast.error("Pedido não encontrado");
        router.push("/admin/pedidos");
        return;
      }
      setPedido(resultado);
      setOrcamento(prev => ({
        ...prev,
        itens: resultado.itens.map(item => ({
          ...item,
          valorUnitario: 0
        }))
      }));
    } catch (error) {
      console.error("Erro ao carregar pedido:", error);
      toast.error("Erro ao carregar detalhes do pedido");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!pedido) {
    return <div className="p-8">Pedido não encontrado</div>;
  }

  const atualizarValorItem = (itemId: string, valor: number) => {
    setOrcamento(prev => ({
      ...prev,
      itens: prev.itens.map(item => 
        item.id === itemId ? { ...item, valorUnitario: valor } : item
      )
    }));
  };

  const calcularTotal = () => {
    const valorItens = orcamento.itens.reduce((total, item) => 
      total + (item.valorUnitario * item.quantity), 0);
    return valorItens + orcamento.valorFrete;
  };

  const gerarPDF = async () => {
    try {
      // Verificar dados
      if (!pedido || !orcamento) {
        toast.error("Dados do orçamento incompletos");
        return;
      }

      // Atualizar valorTotal antes de gerar o PDF
      setOrcamento(prev => ({
        ...prev,
        valorTotal: calcularTotal()
      }));

      console.log("Iniciando geração do PDF...");
      
      // Tentar gerar o PDF com try/catch específico
      let blob;
      try {
        blob = await pdf(
          <OrcamentoPDF 
            orcamento={{
              ...orcamento,
              valorTotal: calcularTotal()
            }} 
            pedido={pedido}
          />
        ).toBlob();
        console.log("Blob do PDF gerado com sucesso");
      } catch (pdfError) {
        console.error("Erro na geração do blob do PDF:", pdfError);
        throw pdfError;
      }

      console.log("Iniciando download...");

      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orcamento-${pedido.id}.pdf`;
        
        // Forçar o download
        document.body.appendChild(link);
        console.log("Link criado, iniciando download...");
        link.click();
        
        // Pequeno delay antes de limpar
        await new Promise(resolve => setTimeout(resolve, 100));
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("Download concluído");
        
        toast.success("PDF gerado com sucesso!");
      } catch (downloadError) {
        console.error("Erro no processo de download:", downloadError);
        throw downloadError;
      }
    } catch (error) {
      console.error("Erro detalhado ao gerar PDF:", error);
      toast.error("Erro ao gerar o PDF. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Orçamento - Pedido #{params.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Informações do Pedido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Data de Entrega</h3>
                  <p>{format(new Date(pedido.dataEntrega), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Data de Retirada</h3>
                  <p>{format(new Date(pedido.dataRetirada), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              </div>

              {/* Tabela de Itens */}
              <div>
                <h3 className="font-semibold mb-4">Itens do Pedido</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Item</th>
                        <th className="text-center p-2">Quantidade</th>
                        <th className="text-right p-2">Valor Unitário</th>
                        <th className="text-right p-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orcamento.itens.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.name}</td>
                          <td className="text-center p-2">{item.quantity}</td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.valorUnitario}
                              onChange={(e) => atualizarValorItem(item.id, Number(e.target.value))}
                              className="w-32 text-right"
                            />
                          </td>
                          <td className="text-right p-2">
                            R$ {(item.valorUnitario * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Frete e Total */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Valor do Frete</h3>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={orcamento.valorFrete}
                    onChange={(e) => setOrcamento(prev => ({ ...prev, valorFrete: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
                  <Input
                    type="text"
                    value={orcamento.formaPagamento}
                    onChange={(e) => setOrcamento(prev => ({ ...prev, formaPagamento: e.target.value }))}
                    className="w-full"
                    placeholder="Ex: 50% de entrada + 50% na entrega"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <textarea
                  value={orcamento.observacoes}
                  onChange={(e) => setOrcamento(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                />
              </div>

              {/* Total */}
              <div className="bg-neutral-900 text-white p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total do Orçamento:</span>
                  <span className="text-2xl">R$ {calcularTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button onClick={gerarPDF}>
                  Gerar PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 