"use client";

import { useState, useCallback } from "react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { verificarEmail, enviarEmail } from "@/lib/email-utils";
import debounce from 'lodash/debounce';
import { toast } from 'react-hot-toast';
import { gerarEmailCliente, gerarEmailAdmin } from "@/lib/email-templates";

export default function OrcamentoPage() {
  const router = useRouter();
  const { items } = useCartStore();
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

  const getDataMinima = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  const validarDataRetirada = (dataRetiradaSelecionada: string) => {
    if (dataEntrega && dataRetiradaSelecionada < dataEntrega) {
      alert("A data de retirada não pode ser anterior à data de entrega");
      setDataRetirada(dataEntrega);
      return;
    }
    setDataRetirada(dataRetiradaSelecionada);
  };

  const verificarEmailDebounced = useCallback(
    debounce(async (email: string) => {
      if (email && email.includes('@')) {
        try {
          setVerificandoEmail(true);
          const valido = await verificarEmail(email);
          setEmailValido(valido);
        } catch (error) {
          console.error('Erro na verificação:', error);
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          setEmailValido(emailRegex.test(email));
        } finally {
          setVerificandoEmail(false);
        }
      }
    }, 1000),
    [setVerificandoEmail, setEmailValido]
  );

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoEmail = e.target.value;
    setEmail(novoEmail);
    
    if (novoEmail.includes('@') && novoEmail.includes('.')) {
      verificarEmailDebounced(novoEmail);
    } else {
      setEmailValido(true);
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 md:px-8">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-lg bg-white dark:bg-neutral-800 p-8 rounded-lg shadow"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Solicitar Orçamento</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Email:</label>
          <div className="relative">
            <input 
              type="email" 
              required 
              value={email}
              onChange={handleEmailChange}
              onBlur={() => {
                if (email.includes('@') && email.includes('.')) {
                  verificarEmailDebounced(email);
                }
              }}
              className={`w-full p-2 border rounded ${
                !emailValido && email.includes('@') ? 'border-red-500' : ''
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

        <div className="mb-4">
          <label className="block mb-2">Nome do Evento:</label>
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
              onChange={(e) => validarDataRetirada(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {items.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Itens do Carrinho:</h3>
            <ul className="list-disc list-inside">
              {items.map(item => (
                <li key={item.id}>
                  {item.name} x {item.quantity} {item.observation && `- ${item.observation}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2">Mensagem:</label>
          <textarea 
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
          ></textarea>
        </div>

        <Button type="submit" className="w-full">
          Enviar Solicitação
        </Button>
      </form>
    </div>
  );
} 