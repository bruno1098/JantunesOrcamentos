"use client";

import { useState, useCallback, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { verificarEmail, enviarEmail } from "@/lib/email-utils";
import debounce from 'lodash/debounce';
import { toast } from 'react-hot-toast';
import { gerarEmailCliente, gerarEmailAdmin } from "@/lib/email-templates";
import { motion } from "framer-motion";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

export default function OrcamentoPage() {
  const router = useRouter();
  const { items, updateItemQuantity } = useCartStore();
  const [email, setEmail] = useState("");
  const [nomeEvento, setNomeEvento] = useState("");
  const [localEvento, setLocalEvento] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState({
    rua: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [dataEntrega, setDataEntrega] = useState("");
  const [dataRetirada, setDataRetirada] = useState("");
  const [emailValido, setEmailValido] = useState(true);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [formPreenchido, setFormPreenchido] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const getDataMinima = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  const validarDataRetirada = (dataRetiradaSelecionada: string) => {
    const dataEntregaObj = new Date(dataEntrega);
    const dataRetiradaObj = new Date(dataRetiradaSelecionada);
    
    if (dataEntrega && dataRetiradaObj < dataEntregaObj) {
      alert("A data de retirada não pode ser anterior à data de entrega");
      setDataRetirada(dataEntrega);
      return;
    }
    setDataRetirada(dataRetiradaSelecionada);
  };

  const verificarEmailDebounced = useCallback((email: string) => {
    const debouncedCheck = debounce(async (emailToCheck: string) => {
      if (emailToCheck && emailToCheck.includes('@')) {
        try {
          setVerificandoEmail(true);
          const valido = await verificarEmail(emailToCheck);
          setEmailValido(valido);
        } catch (error) {
          console.error('Erro na verificação:', error);
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          setEmailValido(emailRegex.test(emailToCheck));
        } finally {
          setVerificandoEmail(false);
        }
      }
    }, 1000);
    
    debouncedCheck(email);
  }, []);

  const verificarCamposPreenchidos = useCallback(() => {
    const camposPreenchidos = 
      email !== "" &&
      emailValido &&
      nomeEvento !== "" &&
      cep !== "" &&
      endereco.rua !== "" &&
      endereco.bairro !== "" &&
      endereco.cidade !== "" &&
      endereco.estado !== "" &&
      dataEntrega !== "" &&
      dataRetirada !== "" &&
      items.length > 0;

    setFormPreenchido(camposPreenchidos);
  }, [email, emailValido, nomeEvento, cep, endereco, dataEntrega, dataRetirada, items]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoEmail = e.target.value;
    setEmail(novoEmail);
    
    if (novoEmail.includes('@') && novoEmail.includes('.')) {
      verificarEmailDebounced(novoEmail);
    } else {
      setEmailValido(true);
    }
    verificarCamposPreenchidos();
  };

  useEffect(() => {
    verificarCamposPreenchidos();
  }, [email, nomeEvento, cep, endereco, dataEntrega, dataRetirada, verificarCamposPreenchidos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailValido) {
      toast.error("Por favor, insira um email válido.");
      return;
    }

    const loadingToast = toast.loading('Processando seu pedido...');

    try {
      const pedido = {
        id: Date.now(),
        data: new Date().toISOString(),
        email,
        nomeEvento,
        endereco: {
          cep,
          ...endereco
        },
        dataEntrega,
        dataRetirada,
        itens: items,
        mensagem,
        status: "Pendente"
      };

      // Salvar no localStorage
      const pedidosAntigos = localStorage.getItem('pedidos');
      const pedidos = pedidosAntigos ? JSON.parse(pedidosAntigos) : [];
      pedidos.push(pedido);
      localStorage.setItem('pedidos', JSON.stringify(pedidos));

      // Primeiro tenta enviar para o administrador
      console.log('Enviando email para admin...');
      await enviarEmail({
        para: 'bruno.saantunes1@gmail.com',
        assunto: `Nova Solicitação de Orçamento #${pedido.id}`,
        html: gerarEmailAdmin(pedido)
      });

      // Se sucesso, tenta enviar para o cliente
      console.log('Enviando email para cliente...');
      await enviarEmail({
        para: email,
        assunto: `Confirmação de Solicitação de Orçamento #${pedido.id}`,
        html: gerarEmailCliente(pedido)
      });

      // Se chegou aqui, deu tudo certo
      useCartStore.getState().clearCart();
      toast.success('Orçamento solicitado com sucesso!', { id: loadingToast });
      router.push("/");

    } catch (error: any) {
      console.error("Erro detalhado:", error);
      toast.error(error.message || 'Erro ao processar seu pedido', { id: loadingToast });
    }
  };

  const buscarCep = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setEndereco({
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleEditQuantity = (itemId: string) => {
    setEditingId(itemId);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateItemQuantity(itemId, newQuantity);
    }
  };

  const handleQuantityBlur = () => {
    setEditingId(null);
  };

  const handleRemoveItem = (itemId: string) => {
    toast((t) => (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 shadow-2xl min-w-[400px]">
          <div className="flex flex-col items-center gap-6">
            <span className="text-xl font-medium text-white text-center">
              Deseja remover este item?
            </span>
            <div className="flex gap-4 w-full">
              <Button
                variant="destructive"
                size="lg"
                onClick={() => {
                  useCartStore.getState().removeItem(itemId);
                  toast.dismiss(t.id);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Sim
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 border-neutral-600 text-white hover:bg-neutral-700"
              >
                Não
              </Button>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'transparent',
        padding: 0,
        maxWidth: '100vw',
        width: '100%',
        height: '100vh'
      },
    });
  };

  return (
    <main className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-lg shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-6">Solicitar Orçamento</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna da esquerda - Formulário */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Seus Dados</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full p-2 border rounded ${
                        email && !verificandoEmail && email.includes('@') ? 
                          (emailValido ? 'border-green-500' : 'border-red-500') 
                          : ''
                      }`}
                    />
                    {verificandoEmail && (
                      <span className="absolute right-2 top-2 text-sm text-gray-500">
                        Verificando...
                      </span>
                    )}
                    {!emailValido && email.includes('@') && (
                      <p className="text-red-500 text-sm mt-1">
                        Por favor, insira um email válido
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Evento</label>
                  <input 
                    type="text"
                    required
                    value={nomeEvento}
                    onChange={(e) => setNomeEvento(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2">CEP do Local:</label>
                  <input 
                    type="text" 
                    required 
                    value={cep}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      setCep(valor);
                      if (valor.length === 8) buscarCep(valor);
                    }}
                    maxLength={8}
                    placeholder="Digite apenas números"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Endereço:</label>
                  <input 
                    type="text" 
                    required 
                    value={endereco.rua}
                    readOnly
                    className="w-full p-2 border rounded mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      required 
                      value={endereco.bairro}
                      readOnly
                      placeholder="Bairro"
                      className="w-full p-2 border rounded"
                    />
                    <input 
                      type="text" 
                      required 
                      value={endereco.cidade}
                      readOnly
                      placeholder="Cidade"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2">Data de Entrega:</label>
                    <input 
                      type="date" 
                      required 
                      value={dataEntrega}
                      min={getDataMinima()}
                      onChange={(e) => {
                        setDataEntrega(e.target.value);
                        if (dataRetirada && dataRetirada < e.target.value) {
                          setDataRetirada(e.target.value);
                        }
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Data de Retirada:</label>
                    <input 
                      type="date" 
                      required 
                      value={dataRetirada}
                      min={dataEntrega || getDataMinima()}
                      onChange={(e) => {
                        const novaDataRetirada = e.target.value;
                        const dataEntregaObj = new Date(dataEntrega);
                        const dataRetiradaObj = new Date(novaDataRetirada);
                        
                        if (dataEntrega && dataRetiradaObj < dataEntregaObj) {
                          setDataRetirada(dataEntrega);
                        } else {
                          setDataRetirada(novaDataRetirada);
                        }
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Mensagem:</label>
                  <textarea 
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={4}
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Coluna da direita - Resumo do pedido */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Itens Selecionados</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                    <div className="w-20 h-20 relative rounded-md overflow-hidden">
                      <Image
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Quantidade:</span>
                        {editingId === item.id ? (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            onBlur={handleQuantityBlur}
                            autoFocus
                            className="w-16 p-1 text-sm border rounded"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">{item.quantity}</span>
                        )}
                        <button
                          onClick={() => handleEditQuantity(item.id)}
                          className="p-1 hover:bg-primary/10 rounded"
                        >
                          <Pencil size={18} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 hover:bg-primary/10 rounded"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </div>
                      {item.observation && (
                        <p className="text-sm text-muted-foreground">
                          Obs: {item.observation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botão único centralizado abaixo das duas colunas */}
          <div className="mt-8">
            <Button 
              type="submit" 
              className="w-full"
              onClick={handleSubmit}
              disabled={!formPreenchido}
            >
              {formPreenchido ? 'Enviar Orçamento' : 'Preencha todos os campos para enviar o orçamento'}
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 