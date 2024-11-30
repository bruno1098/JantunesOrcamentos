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
import { Pencil, Trash2, Check } from "lucide-react";
import { ptBR } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { registerLocale } from "react-datepicker";
import { ProgressLoading } from "@/components/progress-loading";

// Registre o locale português
registerLocale('pt-BR', ptBR);

const SuccessAnimation = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          duration: 0.5,
          bounce: 0.4
        }}
        className="bg-card p-8 rounded-2xl flex flex-col items-center gap-6 max-w-sm mx-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            delay: 0.2,
            duration: 0.7,
            bounce: 0.5
          }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-bold">Orçamento Enviado!</h2>
          <p className="text-muted-foreground">
            Seu orçamento foi enviado com sucesso. Acompanhe o status do seu pedido.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full"
        >
          <Button 
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Ver Meus Pedidos
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude?: number;
  longitude?: number;
}

export default function OrcamentoPage() {
  const router = useRouter();
  const { items, updateItemQuantity } = useCartStore();
  const [email, setEmail] = useState("");
  const [nomeEvento, setNomeEvento] = useState("");
  const [localEvento, setLocalEvento] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState<Endereco>({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [dataEntrega, setDataEntrega] = useState<Date | undefined>(undefined);
  const [dataRetirada, setDataRetirada] = useState<Date | undefined>(undefined);
  const [emailValido, setEmailValido] = useState(true);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [formPreenchido, setFormPreenchido] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEntregaPicker, setShowEntregaPicker] = useState(false);
  const [showRetiradaPicker, setShowRetiradaPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarCamposEndereco, setMostrarCamposEndereco] = useState(false);
  const [mapaConfirmado, setMapaConfirmado] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [enderecoConfirmado, setEnderecoConfirmado] = useState(false);
  const [mostrarAnimacaoOk, setMostrarAnimacaoOk] = useState(false);
  const [camposComErro, setCamposComErro] = useState<string[]>([]);

  const getDataMinima = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  };

  const validarDataRetirada = (dataRetiradaSelecionada: string) => {
    const dataEntregaObj = dataEntrega ? new Date(dataEntrega) : null;
    const dataRetiradaObj = new Date(dataRetiradaSelecionada);
    
    if (dataEntregaObj && dataRetiradaObj < dataEntregaObj) {
      alert("A data de retirada não pode ser anterior à data de entrega");
      setDataRetirada(dataEntregaObj);
      return;
    }
    setDataRetirada(dataRetiradaObj);
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
      dataEntrega !== undefined &&
      dataRetirada !== undefined &&
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

  const verificarCamposFaltantes = () => {
    const campos = [
      { nome: 'email', valor: email, label: 'Email' },
      { nome: 'nomeEvento', valor: nomeEvento, label: 'Nome do Evento' },
      { nome: 'endereco', valor: endereco.rua, label: 'Endereço' },
      { nome: 'numero', valor: endereco.numero, label: 'Número' },
      { nome: 'bairro', valor: endereco.bairro, label: 'Bairro' },
      { nome: 'cidade', valor: endereco.cidade, label: 'Cidade' },
      { nome: 'estado', valor: endereco.estado, label: 'Estado' },
      { nome: 'dataEntrega', valor: dataEntrega, label: 'Data de Entrega' },
      { nome: 'dataRetirada', valor: dataRetirada, label: 'Data de Retirada' }
    ];

    const faltantes = campos.filter(campo => !campo.valor);
    setCamposComErro(faltantes.map(campo => campo.nome));
    return faltantes;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const camposFaltantes = verificarCamposFaltantes();
    
    if (camposFaltantes.length > 0) {
      const mensagemCampos = camposFaltantes
        .map(campo => campo.label)
        .join(', ');
      
      toast.error(`Por favor, preencha os seguintes campos: ${mensagemCampos}`);
      return;
    }

    if (!enderecoConfirmado) {
      toast.error('Por favor, confirme a localização no mapa');
      return;
    }

    if (!emailValido) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 3000));
      
      const pedido = {
        id: Date.now(),
        data: new Date().toISOString(),
        email,
        nomeEvento,
        endereco,
        dataEntrega: dataEntrega ? format(dataEntrega, 'yyyy-MM-dd') : '',
        dataRetirada: dataRetirada ? format(dataRetirada, 'yyyy-MM-dd') : '',
        itens: items,
        mensagem,
        status: "Pendente"
      };

      await Promise.all([
        minLoadingTime,
        (async () => {
          const pedidosAntigos = localStorage.getItem('pedidos');
          const pedidos = pedidosAntigos ? JSON.parse(pedidosAntigos) : [];
          pedidos.push(pedido);
          localStorage.setItem('pedidos', JSON.stringify(pedidos));

          await enviarEmail({
            para: 'bruno.saantunes1@gmail.com',
            assunto: `Nova Solicitação de Orçamento #${pedido.id}`,
            html: gerarEmailAdmin(pedido)
          });

          await enviarEmail({
            para: email,
            assunto: `Confirmação de Solicitação de Orçamento #${pedido.id}`,
            html: gerarEmailCliente(pedido)
          });
        })()
      ]);

      useCartStore.getState().clearCart();
      setShowSuccess(true);
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      toast.error(error.message || 'Erro ao processar seu pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buscarCep = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setEndereco(prev => ({
            ...prev,
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
          }));
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

  const css = `
    .rdp {
      --rdp-cell-size: 40px;
      --rdp-accent-color: hsl(var(--primary));
      --rdp-background-color: hsl(var(--primary) / 0.2);
      margin: 0;
    }
    .rdp-day_selected:not([disabled]) { 
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }
    .rdp-day_selected:hover:not([disabled]) { 
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: hsl(var(--primary) / 0.1);
    }
  `;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showEntregaPicker || showRetiradaPicker) {
        const target = event.target as HTMLElement;
        if (!target.closest('.rdp')) {
          setShowEntregaPicker(false);
          setShowRetiradaPicker(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEntregaPicker, showRetiradaPicker]);

  const buscarEndereco = async (termo: string) => {
    if (termo.length < 5) {
      setMostrarCamposEndereco(false);
      return;
    }

    setBuscando(true);
    try {
      const termoPesquisa = termo.replace(/[^\w\s]/gi, '').trim();
      
      if (/^\d{8}$/.test(termoPesquisa)) {
        const response = await fetch(`https://viacep.com.br/ws/${termoPesquisa}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setEndereco(prev => ({
            ...prev,
            cep: termoPesquisa,
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
          }));
          setMostrarCamposEndereco(true);
        }
      } else {
        setMostrarCamposEndereco(true);
        setEndereco(prev => ({
          ...prev,
          rua: termoPesquisa,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
    } finally {
      setBuscando(false);
    }
  };

  const confirmarLocalizacao = () => {
    if (endereco.numero) {
      setMostrarMapa(true);
    }
  };

  // Adicione esta função para verificar se todos os campos necessários estão preenchidos
  const verificarCamposEndereco = () => {
    return (
      endereco.rua.trim() !== '' &&
      endereco.numero.trim() !== '' &&
      endereco.bairro.trim() !== '' &&
      endereco.cidade.trim() !== '' &&
      endereco.estado.trim() !== ''
    );
  };

  // Função para buscar coordenadas com endereço completo
  const buscarCoordenadas = async () => {
    const enderecoCompleto = `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}, Brasil`;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setEndereco(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        }));
        setMostrarMapa(true);
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
    }
  };

  const SuccessCheckmark = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          delay: 0.2,
          duration: 0.7,
          bounce: 0.5
        }}
        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
      </motion.div>
    </motion.div>
  );

  useEffect(() => {
    const todosPreenchidos = 
      email !== '' &&
      emailValido &&
      nomeEvento !== '' &&
      endereco.rua !== '' &&
      endereco.numero !== '' &&
      endereco.bairro !== '' &&
      endereco.cidade !== '' &&
      endereco.estado !== '' &&
      dataEntrega instanceof Date &&
      dataRetirada instanceof Date &&
      enderecoConfirmado &&
      items.length > 0;

    setFormPreenchido(todosPreenchidos);
  }, [
    email,
    emailValido,
    nomeEvento,
    endereco,
    dataEntrega,
    dataRetirada,
    enderecoConfirmado,
    items
  ]);

  const getInputClassName = (fieldName: string) => `
    w-full p-3 border rounded-lg bg-background
    ${camposComErro.includes(fieldName) ? 'border-red-500 focus:border-red-500' : ''}
  `;

  return (
    <main className="min-h-screen bg-background pt-24">
      {showSuccess && (
        <SuccessAnimation 
          onClose={() => {
            setShowSuccess(false);
            router.push("/meus-pedidos");
          }} 
        />
      )}
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-lg shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-6">Solicitar Orçamento</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      className={getInputClassName('email')}
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

                <div className="mb-6">
                  <label className="block mb-2 font-medium">Localização do Evento</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Digite o CEP ou nome da rua"
                        className="w-full p-3 border rounded-lg bg-background"
                        value={termoBusca}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setTermoBusca(valor);
                          setEnderecoConfirmado(false);
                          if (!endereco.cep) {
                            buscarEndereco(valor);
                          }
                        }}
                      />
                      {buscando && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>

                    {mostrarCamposEndereco && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {endereco.cep ? (
                          <>
                            <div className="grid grid-cols-1 gap-4">
                              <input
                                type="text"
                                value={endereco.rua}
                                readOnly
                                className="w-full p-3 border rounded-lg bg-muted"
                              />
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={endereco.bairro}
                                  readOnly
                                  className="w-full p-3 border rounded-lg bg-muted"
                                />
                                <input
                                  type="text"
                                  value={endereco.cidade}
                                  readOnly
                                  className="w-full p-3 border rounded-lg bg-muted"
                                />
                                <input
                                  type="text"
                                  value={endereco.estado}
                                  readOnly
                                  className="w-full p-3 border rounded-lg bg-muted"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="Número"
                                value={endereco.numero}
                                onChange={(e) => {
                                  setEndereco(prev => ({ ...prev, numero: e.target.value }));
                                  if (verificarCamposEndereco()) {
                                    buscarCoordenadas();
                                  }
                                }}
                                className="w-full p-3 border rounded-lg bg-background"
                              />
                              <input
                                type="text"
                                placeholder="Complemento (opcional)"
                                value={endereco.complemento}
                                onChange={(e) => setEndereco(prev => ({ 
                                  ...prev, 
                                  complemento: e.target.value 
                                }))}
                                className="w-full p-3 border rounded-lg bg-background"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="Bairro"
                                value={endereco.bairro}
                                onChange={(e) => {
                                  setEndereco(prev => ({ ...prev, bairro: e.target.value }));
                                  if (verificarCamposEndereco()) {
                                    buscarCoordenadas();
                                  }
                                }}
                                className="w-full p-3 border rounded-lg bg-background"
                              />
                              <input
                                type="text"
                                placeholder="Cidade"
                                value={endereco.cidade}
                                onChange={(e) => {
                                  setEndereco(prev => ({ ...prev, cidade: e.target.value }));
                                  if (verificarCamposEndereco()) {
                                    buscarCoordenadas();
                                  }
                                }}
                                className="w-full p-3 border rounded-lg bg-background"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Estado (UF)"
                              value={endereco.estado}
                              onChange={(e) => {
                                const valor = e.target.value.toUpperCase();
                                setEndereco(prev => ({ ...prev, estado: valor }));
                                if (verificarCamposEndereco()) {
                                  buscarCoordenadas();
                                }
                              }}
                              className="w-full p-3 border rounded-lg bg-background"
                              maxLength={2}
                            />
                          </>
                        )}

                        {endereco.cep && (
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Número"
                              value={endereco.numero}
                              onChange={(e) => {
                                setEndereco(prev => ({ ...prev, numero: e.target.value }));
                                if (verificarCamposEndereco()) {
                                  buscarCoordenadas();
                                }
                              }}
                              className="w-full p-3 border rounded-lg bg-background"
                            />
                            <input
                              type="text"
                              placeholder="Complemento (opcional)"
                              value={endereco.complemento}
                              onChange={(e) => setEndereco(prev => ({ 
                                ...prev, 
                                complemento: e.target.value 
                              }))}
                              className="w-full p-3 border rounded-lg bg-background"
                            />
                          </div>
                        )}
                      </motion.div>
                    )}

                    {mostrarMapa && endereco.latitude && endereco.longitude && !enderecoConfirmado && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="text-center text-sm text-muted-foreground mb-2">
                          Seria este o local do seu evento?
                        </div>
                        <div className="h-48 rounded-lg overflow-hidden border">
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                              endereco.longitude - 0.01
                            },${endereco.latitude - 0.01},${
                              endereco.longitude + 0.01
                            },${endereco.latitude + 0.01
                            }&layer=mapnik&marker=${endereco.latitude},${endereco.longitude}`}
                          />
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => {
                              setEnderecoConfirmado(true);
                              toast.success('Localização confirmada!');
                            }}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Sim, é aqui!
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setMostrarMapa(false);
                              setEnderecoConfirmado(false);
                              setTermoBusca("");
                              toast('Você pode ajustar o endereço manualmente', {
                                icon: 'ℹ️',
                              });
                            }}
                          >
                            Não, preciso ajustar
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {enderecoConfirmado && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-green-600 mt-2"
                      >
                        <Check size={20} />
                        <span className="text-sm">Endereço confirmado!</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <style>{css}</style>
                    <label className="block mb-2">Data de Entrega:</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dataEntrega ? format(dataEntrega, 'dd/MM/yyyy') : ''}
                        readOnly
                        placeholder="Selecione a data"
                        className="w-full p-2 border rounded cursor-pointer"
                        onClick={() => setShowEntregaPicker(true)}
                      />
                      {showEntregaPicker && (
                        <div className="absolute z-50 mt-1 bg-popover border rounded-md shadow-md">
                          <DayPicker
                            mode="single"
                            selected={dataEntrega}
                            onSelect={(date: Date | undefined) => {
                              if (date) {
                                if (date < getDataMinima()) {
                                  toast.error("A data de entrega não pode ser anterior a hoje");
                                  return;
                                }
                                setDataEntrega(date);
                                if (dataRetirada && dataRetirada < date) {
                                  setDataRetirada(date);
                                  toast("A data de retirada foi ajustada");
                                }
                              }
                              setShowEntregaPicker(false);
                            }}
                            locale={ptBR}
                            fromDate={getDataMinima()}
                            className="bg-popover p-3"
                            classNames={{
                              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                              month: "space-y-4",
                              caption: "flex justify-center pt-1 relative items-center",
                              caption_label: "text-sm font-medium",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex",
                              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                              row: "flex w-full mt-2",
                              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                              day_today: "bg-accent text-accent-foreground",
                              day_outside: "text-muted-foreground opacity-50",
                              day_disabled: "text-muted-foreground opacity-50",
                              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                              day_hidden: "invisible",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Data de Retirada:</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dataRetirada ? format(dataRetirada, 'dd/MM/yyyy') : ''}
                        readOnly
                        placeholder="Selecione a data"
                        className="w-full p-2 border rounded cursor-pointer"
                        onClick={() => setShowRetiradaPicker(true)}
                      />
                      {showRetiradaPicker && (
                        <div className="absolute z-50 mt-1 bg-popover border rounded-md shadow-md">
                          <DayPicker
                            mode="single"
                            selected={dataRetirada}
                            onSelect={(date: Date | undefined) => {
                              if (date) {
                                if (dataEntrega && date < dataEntrega) {
                                  toast.error("A data de retirada não pode ser anterior à data de entrega");
                                  return;
                                }
                                setDataRetirada(date);
                              }
                              setShowRetiradaPicker(false);
                            }}
                            locale={ptBR}
                            fromDate={dataEntrega || getDataMinima()}
                            className="bg-popover p-3"
                            classNames={{
                              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                              month: "space-y-4",
                              caption: "flex justify-center pt-1 relative items-center",
                              caption_label: "text-sm font-medium",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex",
                              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                              row: "flex w-full mt-2",
                              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                              day_today: "bg-accent text-accent-foreground",
                              day_outside: "text-muted-foreground opacity-50",
                              day_disabled: "text-muted-foreground opacity-50",
                              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                              day_hidden: "invisible",
                            }}
                          />
                        </div>
                      )}
                    </div>
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

          <div className="mt-8">
            <Button 
              type="submit" 
              className={`w-full ${!formPreenchido && !isSubmitting ? 'opacity-50' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                if (!formPreenchido) {
                  verificarCamposFaltantes();
                  toast.error('Por favor, preencha todos os campos obrigatórios');
                  return;
                }
                handleSubmit(e);
              }}
              disabled={!formPreenchido || isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-full">
                  <ProgressLoading />
                </div>
              ) : (
                formPreenchido ? 'Enviar Orçamento' : 'Preencha todos os campos'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 