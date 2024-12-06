import { Pedido } from "@/types/pedido";
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";

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

export async function buscarPedidoPorEmail(email: string): Promise<Pedido[]> {
  try {
    const pedidosRef = collection(db, "pedidos");
    const q = query(
      pedidosRef, 
      where("email", "==", email),
      orderBy("data", "desc") // Ordena por data, mais recentes primeiro
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
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
  } catch (error) {
    console.error("Erro ao buscar pedidos por email:", error);
    throw error;
  }
}

export async function buscarPedidoPorId(id: string): Promise<Pedido | null> {
  try {
    console.log("Buscando pedido com ID:", id);

    // Buscar documento diretamente pelo ID
    const docRef = doc(db, "pedidos", id);
    const docSnap = await getDoc(docRef);

    console.log("Documento existe?", docSnap.exists());
    
    if (!docSnap.exists()) {
      console.log("Documento não encontrado");
      return null;
    }

    const data = docSnap.data();
    console.log("Dados do documento:", data);

    return {
      id: docSnap.id,
      nomeEvento: data.nomeEvento,
      data: data.data,
      dataEntrega: data.dataEntrega,
      dataRetirada: data.dataRetirada,
      status: data.status,
      email: data.email,
      endereco: data.endereco,
      itens: Array.isArray(data.itens) ? data.itens.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        observation: item.observation || '',
        image: item.image || ''
      })) : [],
      mensagem: data.mensagem || '',
      dataAtualizacao: data.dataAtualizacao || null
    } as Pedido;

  } catch (error) {
    console.error("Erro detalhado ao buscar pedido:", error);
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