import { Pedido } from "@/types/pedido";
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc, serverTimestamp, getDoc, documentId } from "firebase/firestore";

async function verificarIdUnico(id: string): Promise<boolean> {
  const pedidosRef = collection(db, "pedidos");
  const q = query(pedidosRef, where("id", "==", id));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

async function gerarIdUnico(): Promise<string> {
  let idUnico = Math.floor(10000 + Math.random() * 90000).toString();
  let isUnico = false;

  while (!isUnico) {
    // Se não for único, gera um novo número
    idUnico = Math.floor(1000 + Math.random() * 90000).toString();
    isUnico = await verificarIdUnico(idUnico);
  }

  return idUnico;
}

export async function salvarPedido(pedido: Omit<Pedido, 'id'>): Promise<string> {
  try {
    const pedidoId = await gerarIdUnico();
    const pedidoCompleto = {
      ...pedido,
      id: pedidoId,
      dataAtualizacao: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "pedidos"), pedidoCompleto);
    
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
    const q = query(pedidosRef, where("email", "==", emailNormalizado));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return [];

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: data.id // Usando o ID personalizado, não o ID do documento
      } as Pedido;
    }).sort((a, b) => {
      const dataA = new Date(a.data).getTime();
      const dataB = new Date(b.data).getTime();
      return dataB - dataA;
    });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    throw error;
  }
};

export async function buscarPedidoPorId(id: string): Promise<Pedido | null> {
  try {
    const pedidosRef = collection(db, "pedidos");
    const q = query(pedidosRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`Nenhum pedido encontrado com o ID: ${id}`);
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      ...data,
      id: data.id // Usando o ID personalizado
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
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: data.id // Usando o ID personalizado, não o ID do documento
      } as Pedido;
    }).sort((a, b) => {
      const dataA = new Date(a.data).getTime();
      const dataB = new Date(b.data).getTime();
      return dataB - dataA;
    });
  } catch (error) {
    console.error("Erro ao buscar todos os pedidos:", error);
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

export async function atualizarPedido(id: string, dados: Partial<Pedido>): Promise<void> {
  try {
    const pedidosRef = collection(db, "pedidos");
    const q = query(pedidosRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error(`Pedido não encontrado com o ID: ${id}`);
    }

    const docRef = doc(db, "pedidos", querySnapshot.docs[0].id);
    
    // Remover campos undefined ou null
    const dadosLimpos = Object.entries(dados).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    await updateDoc(docRef, {
      ...dadosLimpos,
      dataAtualizacao: serverTimestamp()
    });
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    throw error;
  }
} 