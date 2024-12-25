import { Pedido } from "@/types/pedido";
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc, serverTimestamp, getDoc, documentId } from "firebase/firestore";

export async function salvarPedido(pedido: Omit<Pedido, 'id'>): Promise<string> {
  try {
    // Gerar um ID baseado no timestamp e número aleatório
    const timestamp = Date.now();
    const numeroAleatorio = Math.floor(Math.random() * 1000);
    const pedidoId = `${timestamp}${numeroAleatorio}`;

    // Adicionar o ID ao pedido
    const pedidoCompleto = {
      ...pedido,
      id: pedidoId
    };

    // Salvar no Firestore
    const docRef = await addDoc(collection(db, "pedidos"), pedidoCompleto);
    
    // Atualizar o documento com o ID gerado
    await updateDoc(doc(db, "pedidos", docRef.id), {
      id: pedidoId
    });

    return pedidoId;
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    throw error;
  }
}

export const buscarPedidoPorEmail = async (email: string): Promise<Pedido[]> => {
  try {
    const pedidosRef = collection(db, "pedidos");
    const emailNormalizado = email.toLowerCase().trim();
    
    // Primeiro, vamos fazer uma busca simples sem ordenação
    const q = query(
      pedidosRef, 
      where("email", "==", emailNormalizado)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }

    // Mapear os documentos e converter para o tipo Pedido
    const pedidos = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nomeEvento: data.nomeEvento,
        data: data.data,
        dataEntrega: data.dataEntrega,
        dataRetirada: data.dataRetirada,
        status: data.status,
        email: data.email,
        endereco: data.endereco,
        itens: data.itens,
        mensagem: data.mensagem,
        dataAtualizacao: data.dataAtualizacao
      } as Pedido;
    });

    // Ordenar os resultados no lado do cliente
    return pedidos.sort((a, b) => {
      const dataA = new Date(a.data).getTime();
      const dataB = new Date(b.data).getTime();
      return dataB - dataA; // Ordem decrescente (mais recente primeiro)
    });

  } catch (error) {
    console.error("Erro ao buscar pedidos por email:", error);
    throw error;
  }
};

export async function buscarPedidoPorId(id: string): Promise<Pedido | null> {
  try {
    console.log("Buscando pedido com ID:", id);
    const pedidosRef = collection(db, "pedidos");
    const q = query(pedidosRef, where(documentId(), "==", id));
    
    const querySnapshot = await getDocs(q);
    console.log("Resultado da query:", querySnapshot.docs);
    
    if (querySnapshot.empty) {
      console.log("Nenhum pedido encontrado com este ID");
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    console.log("Dados do pedido:", data);

    return {
      id: doc.id,
      nomeEvento: data.nomeEvento,
      data: data.data,
      dataEntrega: data.dataEntrega,
      dataRetirada: data.dataRetirada,
      status: data.status,
      email: data.email,
      endereco: data.endereco,
      itens: data.itens,
      mensagem: data.mensagem,
      dataAtualizacao: data.dataAtualizacao
    } as Pedido;

  } catch (error) {
    console.error("Erro ao buscar pedido por ID:", error);
    throw error;
  }
}

export async function buscarTodosPedidos(): Promise<Pedido[]> {
  try {
    const pedidosRef = collection(db, "pedidos");
    const querySnapshot = await getDocs(pedidosRef);
    
    const pedidos = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nomeEvento: data.nomeEvento,
        data: data.data,
        dataEntrega: data.dataEntrega,
        dataRetirada: data.dataRetirada,
        status: data.status,
        email: data.email,
        endereco: data.endereco,
        itens: data.itens,
        mensagem: data.mensagem,
        dataAtualizacao: data.dataAtualizacao
      } as Pedido;
    });

    return pedidos;
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    throw error;
  }
}

export async function atualizarStatusPedido(pedidoId: string, novoStatus: string): Promise<void> {
  try {
    const pedidoRef = doc(db, "pedidos", pedidoId);
    
    await updateDoc(pedidoRef, {
      status: novoStatus,
      dataAtualizacao: serverTimestamp()
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
} 