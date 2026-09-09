"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft, ImageOff } from "lucide-react";
import { isValidImageUrl } from "@/lib/image-utils";
import { ProdutoPicker } from "@/components/admin/produto-picker";
import { salvarPedido } from "@/lib/pedidos-service";
import { enviarEmail } from "@/lib/email-utils";
import { gerarEmailCliente, gerarEmailAdmin } from "@/lib/email-templates";
import { CONTATO } from "@/lib/constants";
import { ItemPedido } from "@/types/pedido";
import { Product } from "@/types/product";

interface EnderecoForm {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

const ENDERECO_VAZIO: EnderecoForm = {
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

/**
 * Criação manual de pedido pelo admin — pra quando o cliente entra em
 * contato direto (WhatsApp, telefone) sem passar pelo formulário
 * público de /orcamento. Reaproveita o mesmo salvarPedido() (mesma
 * RPC criar_pedido) e os mesmos templates de e-mail do fluxo público.
 *
 * Versão propositalmente mais enxuta que o formulário público: sem
 * verificação de e-mail via API externa (fricção desnecessária pra
 * admin) e com datas em <input type="date"> nativo em vez do picker
 * customizado.
 */
export default function NovoPedidoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarBuscaProduto, setMostrarBuscaProduto] = useState(false);

  const [nomeEvento, setNomeEvento] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState<EnderecoForm>(ENDERECO_VAZIO);
  const [dataEntrega, setDataEntrega] = useState("");
  const [dataRetirada, setDataRetirada] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [itens, setItens] = useState<ItemPedido[]>([]);

  const buscarCep = async (cepDigitado: string) => {
    const cepLimpo = cepDigitado.replace(/\D/g, "");
    setEndereco(prev => ({ ...prev, cep: cepLimpo }));
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setEndereco(prev => ({
          ...prev,
          rua: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleAdicionarProduto = (produto: Product) => {
    const existente = itens.find(item => item.id === String(produto.id));
    if (existente) {
      setItens(prev =>
        prev.map(item =>
          item.id === existente.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setItens(prev => [
        ...prev,
        { id: String(produto.id), name: produto.name, quantity: 1, image: produto.image },
      ]);
    }
    setMostrarBuscaProduto(false);
  };

  const handleQuantidadeChange = (itemId: string, novaQuantidade: number) => {
    if (novaQuantidade < 1) return;
    setItens(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity: novaQuantidade } : item))
    );
  };

  const handleRemoverItem = (itemId: string) => {
    setItens(prev => prev.filter(item => item.id !== itemId));
  };

  const formValido =
    nomeEvento.trim() !== "" &&
    email.trim() !== "" &&
    endereco.rua !== "" &&
    endereco.numero !== "" &&
    endereco.bairro !== "" &&
    endereco.cidade !== "" &&
    endereco.estado !== "" &&
    dataEntrega !== "" &&
    dataRetirada !== "" &&
    itens.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValido) {
      toast.error("Preencha todos os campos obrigatórios e adicione ao menos um item.");
      return;
    }

    setIsSubmitting(true);
    try {
      const novoPedido = {
        nomeEvento,
        data: new Date().toISOString(),
        dataEntrega: new Date(dataEntrega).toISOString(),
        dataRetirada: new Date(dataRetirada).toISOString(),
        status: "Pendente",
        email: email.toLowerCase().trim(),
        endereco: {
          rua: endereco.rua,
          numero: endereco.numero,
          complemento: endereco.complemento,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
          cep: endereco.cep,
        },
        itens,
        mensagem,
      };

      const pedidoId = await salvarPedido(novoPedido);

      try {
        await Promise.all([
          enviarEmail({
            para: novoPedido.email,
            assunto: `Pedido #${pedidoId} - Confirmação de Orçamento`,
            html: gerarEmailCliente({ ...novoPedido, id: pedidoId }),
          }),
          enviarEmail({
            para: CONTATO.emailAdmin,
            assunto: `Novo Pedido #${pedidoId} (criado pelo admin)`,
            html: gerarEmailAdmin({ ...novoPedido, id: pedidoId }),
          }),
        ]);
      } catch (emailError) {
        // O pedido já foi salvo — erro de e-mail não deve travar o
        // fluxo, só avisar que precisa conferir manualmente.
        console.error("Erro ao enviar e-mails de confirmação:", emailError);
        toast.error("Pedido criado, mas houve erro ao enviar os e-mails de confirmação.");
      }

      toast.success(`Pedido #${pedidoId} criado com sucesso!`);
      router.push(`/admin/pedidos/${pedidoId}`);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao criar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Criar Pedido Manualmente</h1>
            <p className="text-sm text-muted-foreground">
              Para clientes que entraram em contato direto (WhatsApp, telefone).
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente e Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Evento</label>
                  <Input value={nomeEvento} onChange={(e) => setNomeEvento(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail do Cliente</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Entrega</label>
                  <Input
                    type="date"
                    value={dataEntrega}
                    onChange={(e) => setDataEntrega(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Retirada</label>
                  <Input
                    type="date"
                    value={dataRetirada}
                    onChange={(e) => setDataRetirada(e.target.value)}
                    min={dataEntrega || undefined}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">CEP</label>
                  <Input
                    value={endereco.cep}
                    onChange={(e) => buscarCep(e.target.value)}
                    maxLength={8}
                    placeholder="Só números"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Rua</label>
                  <Input
                    value={endereco.rua}
                    onChange={(e) => setEndereco(prev => ({ ...prev, rua: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Número</label>
                  <Input
                    value={endereco.numero}
                    onChange={(e) => setEndereco(prev => ({ ...prev, numero: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Complemento</label>
                  <Input
                    value={endereco.complemento}
                    onChange={(e) => setEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bairro</label>
                  <Input
                    value={endereco.bairro}
                    onChange={(e) => setEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <Input
                    value={endereco.cidade}
                    onChange={(e) => setEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <Input
                    value={endereco.estado}
                    onChange={(e) =>
                      setEndereco(prev => ({ ...prev, estado: e.target.value.toUpperCase() }))
                    }
                    maxLength={2}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Itens</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarBuscaProduto(v => !v)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mostrarBuscaProduto && <ProdutoPicker onSelect={handleAdicionarProduto} />}

              {itens.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum item adicionado ainda.</p>
              )}

              {itens.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-lg bg-secondary/50 p-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
                    {isValidImageUrl(item.image) ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="h-5 w-5 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <Input
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
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mensagem (opcional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="min-h-[100px] w-full rounded-md border p-2"
                placeholder="Alguma observação sobre o contato/pedido..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formValido || isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Pedido"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
