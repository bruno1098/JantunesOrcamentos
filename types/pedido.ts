export interface ItemPedido {
  id: string;
  name: string;
  quantity: number;
  observation?: string;
  image?: string;
  adminResponse?: string;
  /**
   * Cor escolhida pelo cliente no catálogo público (Fase 8) — vem do
   * `<Select>` de cores do produto, ou digitada à mão se ele escolher
   * "Outro (Especificar)". Opcional no tipo porque nem todo item nasce
   * desse fluxo: itens adicionados pela admin (ProdutoPicker, em
   * app/admin/pedidos/[id]/orcamento e app/admin/pedidos/novo) não
   * passam por seleção de cor — só o Sheet de "Orçar" do catálogo
   * público (components/produtos/product-card.tsx) torna isso
   * obrigatório antes de liberar o botão "Adicionar".
   */
  corEscolhida?: string;
}

export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude?: number;
  longitude?: number;
}

export interface Pedido {
  id: string; // numero_pedido — código curto e público (ex: "10042"), não o uuid interno
  /**
   * uuid interno da linha em `pedidos` no Supabase (era inexistente no
   * Firestore, onde o doc.id não era usado). Usado internamente pelo
   * DAL (ex: FK ao criar/buscar um orçamento) — não é exibido na UI.
   * Opcional para não quebrar código legado que monta um Pedido "à mão".
   */
  pedidoUuid?: string;
  nomeEvento: string;
  data: string;
  dataEntrega: string;
  dataRetirada: string;
  status: string;
  email: string;
  endereco: Endereco;
  itens: ItemPedido[];
  mensagem?: string;
  // Sempre uma string ISO vinda do Postgres (timestamptz) agora — nunca
  // mais um Firestore Timestamp (que exigia `.toDate()` para virar Date).
  dataAtualizacao?: string;
}

export interface PedidoEmailProps extends Omit<Pedido, 'dataAtualizacao'> {} 