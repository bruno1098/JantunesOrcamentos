"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buscarPedidoPorId,
  atualizarPedido,
  salvarOrcamento,
  buscarOrcamentoPorPedido,
} from "@/lib/pedidos-service";
import { Pedido, ItemPedido } from "@/types/pedido";
import { Orcamento } from "@/types/orcamento";
import { Product } from "@/types/product";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OrcamentoPDF } from "@/components/orcamento/orcamento-pdf";
import { pdf } from "@react-pdf/renderer";
import Image from "next/image";
import { Plus, Trash2, ImageOff } from "lucide-react";
import { isValidImageUrl } from "@/lib/image-utils";
import { FaWhatsapp } from "react-icons/fa";
import { ProdutoPicker } from "@/components/admin/produto-picker";

export default function OrcamentoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [mostrarBuscaProduto, setMostrarBuscaProduto] = useState(false);
  const [salvandoItens, setSalvandoItens] = useState(false);
  const [salvandoOrcamento, setSalvandoOrcamento] = useState(false);
  const [gerandoPDF, setGerandoPDF] = useState(false);
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

      // Se já existe um orçamento salvo pra este pedido (reabrindo a
      // tela depois de já ter precificado antes), usa ele como ponto
      // de partida em vez de zerar tudo de novo.
      const orcamentoExistente = resultado.pedidoUuid
        ? await buscarOrcamentoPorPedido(resultado.pedidoUuid, resultado.id)
        : null;

      if (orcamentoExistente) {
        setOrcamento(orcamentoExistente);
      } else {
        setOrcamento(prev => ({
          ...prev,
          itens: resultado.itens.map(item => ({
            ...item,
            valorUnitario: 0
          }))
        }));
      }
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

  // Total sempre calculado a partir de pedido.itens (fonte de verdade
  // pra quantidade/identidade dos itens), buscando o preço em
  // orcamento.itens por id — evita divergência se a quantidade de um
  // item for editada depois de já ter uma cópia em orcamento.itens.
  const calcularTotal = () => {
    if (!pedido) return orcamento.valorFrete;
    const valorItens = pedido.itens.reduce((total, item) => {
      const valorUnitario = orcamento.itens.find(i => i.id === item.id)?.valorUnitario || 0;
      return total + valorUnitario * item.quantity;
    }, 0);
    return valorItens + orcamento.valorFrete;
  };

  // ---------------------------------------------------------------
  // Edição dos itens do PEDIDO (não do orçamento) — regra de negócio:
  // a admin precisa poder trocar/remover/adicionar item ANTES de
  // fechar o orçamento (ex: produto sem estoque). Isso atualiza
  // `pedido.itens` localmente; "Salvar Itens do Pedido" persiste no
  // Supabase. orcamento.itens é mantido em sincronia junto, pra cada
  // item continuar com seu campo de preço funcionando.
  // ---------------------------------------------------------------

  const handleQuantidadeChange = (itemId: string, novaQuantidade: number) => {
    if (!pedido || novaQuantidade < 1) return;
    setPedido({
      ...pedido,
      itens: pedido.itens.map(item =>
        item.id === itemId ? { ...item, quantity: novaQuantidade } : item
      ),
    });
  };

  const handleRemoverItem = (itemId: string) => {
    if (!pedido) return;
    setPedido({
      ...pedido,
      itens: pedido.itens.filter(item => item.id !== itemId),
    });
    setOrcamento(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== itemId),
    }));
  };

  const handleAdicionarProduto = (produto: Product) => {
    if (!pedido) return;

    const itemExistente = pedido.itens.find(item => item.id === String(produto.id));
    if (itemExistente) {
      handleQuantidadeChange(itemExistente.id, itemExistente.quantity + 1);
      setMostrarBuscaProduto(false);
      return;
    }

    const novoItem: ItemPedido = {
      id: String(produto.id),
      name: produto.name,
      quantity: 1,
      image: produto.image,
    };

    setPedido({ ...pedido, itens: [...pedido.itens, novoItem] });
    setOrcamento(prev => ({
      ...prev,
      itens: [...prev.itens, { ...novoItem, valorUnitario: 0 }],
    }));
    setMostrarBuscaProduto(false);
  };

  const salvarItensPedido = async () => {
    if (!pedido) return;
    setSalvandoItens(true);
    try {
      await atualizarPedido(pedido.id, { itens: pedido.itens });
      toast.success("Itens do pedido atualizados!");
    } catch (error) {
      console.error("Erro ao salvar itens do pedido:", error);
      toast.error("Erro ao salvar alterações nos itens do pedido.");
    } finally {
      setSalvandoItens(false);
    }
  };

  // Monta o orçamento a partir de pedido.itens (fonte de verdade de
  // quantidade/identidade, inclui qualquer troca/remoção/adição feita
  // nesta tela) + o valorUnitario correspondente em orcamento.itens —
  // usado tanto para salvar quanto para gerar o PDF, sempre com os
  // dados que estão na tela no momento do clique.
  const montarOrcamentoAtualizado = (): Orcamento | null => {
    if (!pedido) return null;
    return {
      ...orcamento,
      valorTotal: calcularTotal(),
      itens: pedido.itens.map(item => ({
        ...item,
        valorUnitario: orcamento.itens.find(i => i.id === item.id)?.valorUnitario || 0,
      })),
    };
  };

  // Botão "Salvar Orçamento": só persiste no Supabase (itens do pedido
  // + orçamento precificado). Não gera PDF nem depende dele — a admin
  // pode salvar o progresso de precificação e voltar depois.
  const salvarOrcamentoHandler = async () => {
    if (!pedido) return;
    if (!pedido.pedidoUuid) {
      toast.error("Não foi possível identificar o pedido para salvar o orçamento.");
      return;
    }

    const orcamentoAtualizado = montarOrcamentoAtualizado();
    if (!orcamentoAtualizado) return;

    setSalvandoOrcamento(true);
    try {
      await atualizarPedido(pedido.id, { itens: pedido.itens });
      await salvarOrcamento(pedido.pedidoUuid, orcamentoAtualizado);

      // Reflete na tela exatamente o que acabou de ser persistido —
      // confirmação visual do que foi salvo, não só um toast.
      setOrcamento(orcamentoAtualizado);
      toast.success("Orçamento salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      toast.error("Erro ao salvar o orçamento. Tente novamente.");
    } finally {
      setSalvandoOrcamento(false);
    }
  };

  // Botão "Gerar PDF": só monta e baixa o PDF com os dados atuais da
  // tela — não salva nada no Supabase. Se a admin ainda não clicou em
  // "Salvar Orçamento", o PDF sai igual (dados vêm do estado local),
  // só não fica persistido no banco.
  const gerarPDF = async () => {
    if (!pedido) {
      toast.error("Dados do orçamento incompletos");
      return;
    }

    const orcamentoParaPDF = montarOrcamentoAtualizado();
    if (!orcamentoParaPDF) return;

    setGerandoPDF(true);
    try {
      const blob = await pdf(<OrcamentoPDF orcamento={orcamentoParaPDF} pedido={pedido} />).toBlob();

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      const link = document.createElement("a");
      link.href = url;
      link.download = `orcamento-${pedido.id}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);

      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      toast.error("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setGerandoPDF(false);
    }
  };

  // O sistema nunca coletou telefone do cliente (só e-mail) — o wa.me
  // vai sem número de destino de propósito: abre o seletor de contato
  // do próprio WhatsApp da admin, pra ela escolher a conversa certa
  // (a mesma de onde veio o contato original) e colar o PDF já
  // baixado por "Salvar e Gerar PDF". Não existe forma de anexar o
  // arquivo automaticamente via link wa.me — é uma limitação da API
  // pública do WhatsApp, não algo que dê pra contornar sem integração
  // paga (WhatsApp Business API).
  const enviarPorWhatsApp = () => {
    const total = calcularTotal();
    const dataValidadeFormatada = format(orcamento.dataValidade, "dd/MM/yyyy", { locale: ptBR });

    const mensagem =
      `Olá! Segue o orçamento do pedido #${pedido.id} (${pedido.nomeEvento}).\n\n` +
      `Valor total: R$ ${total.toFixed(2)}\n` +
      `Válido até: ${dataValidadeFormatada}\n` +
      (orcamento.formaPagamento ? `Forma de pagamento: ${orcamento.formaPagamento}\n` : "") +
      `\nVou anexar o PDF com todos os detalhes em seguida. Qualquer dúvida, é só chamar!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, "_blank");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-semibold">Itens do Pedido</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMostrarBuscaProduto(v => !v)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Produto
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={salvarItensPedido}
                      disabled={salvandoItens}
                    >
                      {salvandoItens ? "Salvando..." : "Salvar Itens do Pedido"}
                    </Button>
                  </div>
                </div>

                {mostrarBuscaProduto && (
                  <div className="mb-4">
                    <ProdutoPicker onSelect={handleAdicionarProduto} />
                  </div>
                )}

                <div className="space-y-4">
                  {pedido.itens.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum item no pedido. Use &quot;Adicionar Produto&quot; acima.
                    </p>
                  )}
                  {pedido.itens.map((item, index) => (
                    <div key={index} className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 relative rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                          {isValidImageUrl(item.image) ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageOff className="h-6 w-6 text-neutral-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          {/* Cabeçalho do Item */}
                          <div className="flex justify-between items-start mb-3 gap-4">
                            <div>
                              <h4 className="font-medium text-lg">{item.name}</h4>
                              {item.corEscolhida && (
                                <p className="text-sm text-muted-foreground">Cor: {item.corEscolhida}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <label className="text-sm text-muted-foreground" htmlFor={`qtd-${item.id}`}>
                                Qtd:
                              </label>
                              <Input
                                id={`qtd-${item.id}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantidadeChange(item.id, Number(e.target.value))}
                                className="w-20"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoverItem(item.id)}
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                aria-label={`Remover ${item.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
              <div className="flex flex-wrap justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  onClick={enviarPorWhatsApp}
                  className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                >
                  <FaWhatsapp className="mr-2 h-4 w-4" />
                  Enviar por WhatsApp
                </Button>
                <Button variant="outline" onClick={gerarPDF} disabled={gerandoPDF}>
                  {gerandoPDF ? "Gerando..." : "Gerar PDF"}
                </Button>
                <Button onClick={salvarOrcamentoHandler} disabled={salvandoOrcamento}>
                  {salvandoOrcamento ? "Salvando..." : "Salvar Orçamento"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 