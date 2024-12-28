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
import Image from "next/image";

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
      console.log("Iniciando processo de geração do PDF");
      
      if (!pedido || !orcamento) {
        console.error("Dados incompletos:", { pedido, orcamento });
        toast.error("Dados do orçamento incompletos");
        return;
      }

      const valorTotalCalculado = calcularTotal();
      
      // Criar uma cópia atualizada do orçamento com as respostas do admin
      const orcamentoAtualizado = {
        ...orcamento,
        valorTotal: valorTotalCalculado,
        itens: orcamento.itens.map(item => ({
          ...item,
          adminResponse: pedido.itens.find(i => i.id === item.id)?.adminResponse
        }))
      };

      // Criar o componente PDF com os dados atualizados
      let pdfContent;
      try {
        console.log("Criando componente PDF");
        pdfContent = (
          <OrcamentoPDF 
            orcamento={orcamentoAtualizado}
            pedido={pedido}
          />
        );
        console.log("Componente PDF criado com sucesso");
      } catch (componentError) {
        console.error("Erro ao criar componente PDF:", componentError);
        throw componentError;
      }

      // Gerar o blob com try/catch específico
      let blob;
      try {
        console.log("Gerando blob do PDF");
        blob = await pdf(pdfContent).toBlob();
        console.log("Blob gerado com sucesso:", blob);
      } catch (blobError) {
        console.error("Erro ao gerar blob:", blobError);
        throw blobError;
      }

      // Criar e disparar o download com try/catch específico
      try {
        console.log("Iniciando processo de download");
        const url = URL.createObjectURL(blob);
        console.log("URL criada:", url);

        // Tentar abrir em nova aba primeiro
        window.open(url, '_blank');
        
        // Backup: tentar download direto
        const link = document.createElement('a');
        link.href = url;
        link.download = `orcamento-${pedido.id}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        
        console.log("Link criado, tentando download");
        link.click();
        
        // Limpar recursos
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log("Recursos limpos");
        }, 1000);

        console.log("Processo de download concluído");
        toast.success("PDF gerado com sucesso!");
      } catch (downloadError) {
        console.error("Erro no processo de download:", downloadError);
        throw downloadError;
      }
    } catch (error) {
      console.error("Erro geral na geração do PDF:", error);
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
                <div className="space-y-4">
                  {pedido.itens.map((item, index) => (
                    <div key={index} className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 relative rounded-md overflow-hidden">
                          <Image
                            src={item.image || '/placeholder.jpg'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          {/* Cabeçalho do Item */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-lg">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Quantidade solicitada: <span className="font-medium">{item.quantity} {item.quantity > 1 ? 'unidades' : 'unidade'}</span>
                              </p>
                            </div>
                          </div>

                          {/* Grid de Valores */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium block mb-1.5">Valor Unitário:</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={orcamento.itens.find(i => i.id === item.id)?.valorUnitario || ''}
                                  onChange={(e) => atualizarValorItem(item.id, Number(e.target.value))}
                                  className="pl-8 font-medium"
                                  placeholder="0,00"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium block mb-1.5">Subtotal:</label>
                              <div className="bg-background p-2.5 rounded-md border">
                                <span className="font-medium">
                                  R$ {((orcamento.itens.find(i => i.id === item.id)?.valorUnitario || 0) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Observações e Respostas - Só aparece se houver observação */}
                          {item.observation && (
                            <div className="mt-4 space-y-3">
                              <div className="bg-secondary rounded-md p-3">
                                <p className="text-sm font-medium mb-1">Observação do Cliente:</p>
                                <p className="text-sm text-muted-foreground">{item.observation}</p>
                              </div>

                              <div>
                                <label className="text-sm font-medium block mb-1.5">Resposta à Observação:</label>
                                <textarea
                                  value={item.adminResponse || ''}
                                  onChange={(e) => {
                                    const newItens = [...pedido.itens];
                                    newItens[index] = {
                                      ...newItens[index],
                                      adminResponse: e.target.value
                                    };
                                    setPedido({ ...pedido, itens: newItens });
                                  }}
                                  placeholder="Adicione uma resposta para a observação do cliente..."
                                  className="w-full p-2.5 text-sm rounded-md border bg-background min-h-[80px]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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