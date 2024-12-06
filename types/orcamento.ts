import { ItemPedido, Pedido } from "./pedido";

export interface ItemOrcamento extends ItemPedido {
  valorUnitario: number;
}

export interface Orcamento {
  pedidoId: string;
  itens: ItemOrcamento[];
  valorFrete: number;
  valorTotal: number;
  observacoes: string;
  dataValidade: Date;
  formaPagamento: string;
} 