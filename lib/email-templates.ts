import { CartItem } from "@/store/cart-store";

interface PedidoEmailProps {
  id: number;
  data: string;
  email: string;
  nomeEvento: string;
  endereco: {
    cep: string;
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  dataEntrega: string;
  dataRetirada: string;
  itens: CartItem[];
  mensagem: string;
  status: string;
}

export function gerarEmailCliente(pedido: PedidoEmailProps) {
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <title>Pedido Recebido</title>
      <style>
        body {
          font-family: 'Lato', Arial, sans-serif;
          background-color: #f6f6f6;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #004d99;
          padding: 20px;
          text-align: center;
        }
        .header img {
          width: 150px;
        }
        .content {
          padding: 20px;
        }
        h1, h2 {
          color: #004d99;
        }
        .button {
          background-color: #fca311;
          color: #010101;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          display: inline-block;
        }
        .item {
          display: flex;
          margin-bottom: 15px;
        }
        .item img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          margin-right: 15px;
        }
        .item-details {
          flex: 1;
        }
        .footer {
          background-color: #f6f6f6;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Cabeçalho -->
        <div class="header">
          <img src="https://jantunes.vercel.app/_next/static/media/logo.fab738f9.png" alt="Logo da Empresa">
        </div>
        <!-- Conteúdo -->
        <div class="content">
          <h1>Pedido Recebido com Sucesso!</h1>
          <p>Olá,</p>
          <p>Seu pedido <strong>#${pedido.id}</strong> foi recebido em ${formatarData(pedido.data)}.</p>
          <p>Um de nossos consultores especializados entrará em contato através do seu email (${pedido.email}) nas próximas 24 horas úteis para discutir os detalhes do seu evento e finalizar seu orçamento.</p>
          <p>Fique tranquilo(a)! Estamos empenhados em tornar seu evento ainda mais especial.</p>

          <!-- Detalhes do Evento -->
          <h2>Detalhes do Evento</h2>
          <p><strong>Nome do Evento:</strong> ${pedido.nomeEvento}</p>
          <p><strong>Data de Entrega:</strong> ${formatarData(pedido.dataEntrega)}</p>
          <p><strong>Data de Retirada:</strong> ${formatarData(pedido.dataRetirada)}</p>

          <!-- Local do Evento -->
          <h2>Local do Evento</h2>
          <p>${pedido.endereco.rua}</p>
          <p>${pedido.endereco.bairro}, ${pedido.endereco.cidade} - ${pedido.endereco.estado}</p>
          <p>CEP: ${pedido.endereco.cep}</p>

          <!-- Itens Solicitados -->
          <h2>Itens Solicitados</h2>
          ${pedido.itens.map(item => `
            <div class="item">
              <img src="${item.image}" alt="${item.name}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div class="item-details">
                <h3 style="margin: 0 0 8px 0; color: #004d99;">${item.name}</h3>
                <p style="margin: 4px 0;"><strong>Quantidade:</strong> ${item.quantity} unidade${item.quantity > 1 ? 's' : ''}</p>
                ${item.observation ? `<p style="margin: 4px 0;"><strong>Observação:</strong> ${item.observation}</p>` : ''}
              </div>
            </div>
          `).join('')}

          <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: #004d99;">Próximos Passos:</p>
            <ol style="margin: 10px 0;">
              <li>Aguarde o contato de nosso consultor em até 24 horas úteis</li>
              <li>Discuta os detalhes específicos do seu evento</li>
              <li>Receba seu orçamento personalizado</li>
              <li>Confirme sua reserva</li>
            </ol>
          </div>

          <!-- Botão -->
          <p style="text-align: center;">
            <a href="https://locacaodetoalhas.vercel.app/meus-pedidos" class="button">Acompanhar Pedido</a>
          </p>
        </div>
        <!-- Rodapé -->
        <div class="footer">
          <p><strong>J.ANTUNES</strong></p>
          <p>Telefone: (11) 94252-1204</p>
          <p>Email: j.antuness@gmail.com</p>
          <p>© ${new Date().getFullYear()} J.Antunes. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function gerarEmailAdmin(pedido: PedidoEmailProps) {
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <title>Nova Solicitação de Orçamento</title>
      <style>
        body {
          font-family: 'Lato', Arial, sans-serif;
          background-color: #f6f6f6;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #1a1a1a;
          padding: 20px;
          text-align: center;
          color: #ffffff;
        }
        .header img {
          width: 150px;
        }
        .content {
          padding: 20px;
        }
        h1, h2 {
          color: #1a1a1a;
        }
        .item {
          display: flex;
          margin-bottom: 15px;
        }
        .item img {
          width: 150px;
          height: 150px;
          object-fit: cover;
          margin-right: 15px;
        }
        .item-details {
          flex: 1;
        }
        .footer {
          background-color: #f6f6f6;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .status {
          background-color: #ffd700;
          color: #000;
          padding: 5px 10px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 10px;
        }
        .grid {
          display: flex;
          flex-wrap: wrap;
        }
        .grid .column {
          flex: 1;
          padding: 10px;
        }
        .total {
          background-color: #1a1a1a;
          color: #ffffff;
          padding: 20px;
          text-align: right;
          font-size: 18px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Cabeçalho -->
        <div class="header">
          <img src="https://jantunes.vercel.app/_next/static/media/logo.fab738f9.png" alt="Logo da Empresa">
          <h1>Nova Solicitação de Orçamento</h1>
          <p>Pedido <strong>#${pedido.id}</strong> - ${formatarData(pedido.data)}</p>
          <span class="status">${pedido.status}</span>
        </div>
        <!-- Conteúdo -->
        <div class="content">
          <div class="grid">
            <!-- Informações do Cliente -->
            <div class="column">
              <h2>Cliente</h2>
              <p><strong>Email:</strong> ${pedido.email}</p>
              <p><strong>Evento:</strong> ${pedido.nomeEvento}</p>
            </div>
            <!-- Datas -->
            <div class="column">
              <h2>Datas</h2>
              <p><strong>Entrega:</strong> ${formatarData(pedido.dataEntrega)}</p>
              <p><strong>Retirada:</strong> ${formatarData(pedido.dataRetirada)}</p>
            </div>
          </div>

          <!-- Local do Evento -->
          <h2>Local do Evento</h2>
          <p>${pedido.endereco.rua}</p>
          <p>${pedido.endereco.bairro}, ${pedido.endereco.cidade} - ${pedido.endereco.estado}</p>
          <p>CEP: ${pedido.endereco.cep}</p>

          <!-- Itens Solicitados -->
          <h2>Itens Solicitados</h2>
          ${pedido.itens.map(item => `
            <div class="item">
              <img src="${item.image}" alt="${item.name}">
              <div class="item-details">
                <p><strong>${item.name}</strong></p>
                <p>Quantidade: ${item.quantity}</p>
                ${item.observation ? `<p>Observação: ${item.observation}</p>` : ''}
              </div>
            </div>
          `).join('')}

          <!-- Mensagem do Cliente -->
          ${pedido.mensagem ? `
            <h2>Mensagem do Cliente</h2>
            <p>${pedido.mensagem}</p>
          ` : ''}

          <!-- Total de Itens -->
          <div class="total">
            <p>Total de Itens: ${pedido.itens.reduce((acc, item) => acc + item.quantity, 0)}</p>
          </div>
        </div>
        <!-- Rodapé -->
        <div class="footer">
          <p><strong>J.ANTUNES</strong></p>
          <p>Telefone: (11) 94252-1204</p>
          <p>Email: j.antunes@gmail.com</p>
          <p>© ${new Date().getFullYear()} J.Antunes. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
