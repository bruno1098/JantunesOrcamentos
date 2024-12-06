export interface ItemPedido {
  id: string;
  name: string;
  quantity: number;
  observation?: string;
  image?: string;
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
  id: string;
  nomeEvento: string;
  data: string;
  dataEntrega: string;
  dataRetirada: string;
  status: string;
  email: string;
  endereco: Endereco;
  itens: ItemPedido[];
  mensagem?: string;
  dataAtualizacao?: any;
}

export interface PedidoEmailProps extends Omit<Pedido, 'dataAtualizacao'> {} 