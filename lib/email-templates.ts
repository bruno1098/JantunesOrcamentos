import { CartItem } from "@/store/cart-store";

interface PedidoEmailProps {
  id: string;
  data: string;
  email: string;
  nomeEvento: string;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    latitude?: number;
    longitude?: number;
  };
  dataEntrega: string;
  dataRetirada: string;
  itens: CartItem[];
  mensagem: string;
  status: string;
}

// Função auxiliar para gerar URL da imagem do mapa
const gerarUrlMapaEstatico = (latitude: number, longitude: number) => {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=15&size=600x300&markers=${latitude},${longitude}&format=png`;
};

export function gerarEmailCliente(pedido: PedidoEmailProps) {
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const mapaUrl = pedido.endereco.latitude && pedido.endereco.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${pedido.endereco.longitude - 0.01},${pedido.endereco.latitude - 0.01},${pedido.endereco.longitude + 0.01},${pedido.endereco.latitude + 0.01}&layer=mapnik&marker=${pedido.endereco.latitude},${pedido.endereco.longitude}`
    : null;

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
        .map-container {
          width: 100%;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
          margin: 20px 0;
          border: 1px solid #e2e8f0;
        }
        .address-card {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 15px;
          margin: 10px 0;
          border: 1px solid #e2e8f0;
        }
        .event-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        .event-card {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 15px;
          border: 1px solid #e2e8f0;
        }
        .status-badge {
          background-color: #fca311;
          color: #010101;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
          display: inline-block;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Cabeçalho -->
        <div class="header">
          <img src="https://jantunes.vercel.app/_next/static/media/logo.fab738f9.png" alt="Logo J.Antunes">
          <div class="status-badge">${pedido.status}</div>
        </div>

        <!-- Conteúdo -->
        <div class="content">
          <h1>Pedido Recebido com Sucesso!</h1>
          <p>Olá,</p>
          <p>Seu pedido <strong>#${pedido.id}</strong> foi recebido em ${formatarData(pedido.data)}.</p>

          <!-- Detalhes do Evento -->
          <div class="event-details">
            <div class="event-card">
              <h3>Evento</h3>
              <p><strong>Nome:</strong> ${pedido.nomeEvento}</p>
              <p><strong>Entrega:</strong> ${formatarData(pedido.dataEntrega)}</p>
              <p><strong>Retirada:</strong> ${formatarData(pedido.dataRetirada)}</p>
            </div>

            <div class="event-card">
              <h3>Local</h3>
              <p>${pedido.endereco.rua}, ${pedido.endereco.numero}</p>
              ${pedido.endereco.complemento ? `<p>Complemento: ${pedido.endereco.complemento}</p>` : ''}
              <p>${pedido.endereco.bairro}</p>
              <p>${pedido.endereco.cidade} - ${pedido.endereco.estado}</p>
              <p>CEP: ${pedido.endereco.cep}</p>
            </div>
          </div>

          ${pedido.endereco.latitude && pedido.endereco.longitude ? `
            <div class="map-container" style="margin: 20px 0;">
              <img 
                src="${gerarUrlMapaEstatico(pedido.endereco.latitude, pedido.endereco.longitude)}"
                alt="Localização do evento"
                style="width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0;"
              />
              <div style="margin-top: 8px; text-align: center;">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=${pedido.endereco.latitude},${pedido.endereco.longitude}" 
                  style="color: #004d99; text-decoration: underline;"
                  target="_blank"
                >
                  Abrir no Google Maps
                </a>
              </div>
            </div>
          ` : ''}

          <!-- Itens Solicitados -->
          <h2>Itens Solicitados</h2>
          ${pedido.itens.map(item => `
            <div class="item">
              <img src="${item.image}" alt="${item.name}">
              <div class="item-details">
                <h3>${item.name}</h3>
                <p><strong>Quantidade:</strong> ${item.quantity} unidade${item.quantity > 1 ? 's' : ''}</p>
                ${item.observation ? `<p><strong>Observação:</strong> ${item.observation}</p>` : ''}
              </div>
            </div>
          `).join('')}

          ${pedido.mensagem ? `
            <div class="message-card">
              <h3>Sua Mensagem</h3>
              <p>${pedido.mensagem}</p>
            </div>
          ` : ''}

          <div class="next-steps">
            <h3>Próximos Passos</h3>
            <ol>
              <li>Aguarde nosso contato em até 24h úteis</li>
              <li>Discutiremos os detalhes do seu evento</li>
              <li>Enviaremos seu orçamento personalizado</li>
              <li>Após sua aprovação, confirmaremos sua reserva</li>
            </ol>
          </div>

          <div class="cta-button">
            <a href="https://locacaodetoalhas.vercel.app/meus-pedidos" class="button">
              Acompanhar Pedido
            </a>
          </div>
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

  const mapaUrl = pedido.endereco.latitude && pedido.endereco.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${pedido.endereco.longitude - 0.01},${pedido.endereco.latitude - 0.01},${pedido.endereco.longitude + 0.01},${pedido.endereco.latitude + 0.01}&layer=mapnik&marker=${pedido.endereco.latitude},${pedido.endereco.longitude}`
    : null;

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
          line-height: 1.6;
        }
        .email-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #1a1a1a;
          padding: 30px 20px;
          text-align: center;
          color: #ffffff;
        }
        .header img {
          width: 150px;
          margin-bottom: 15px;
        }
        .content {
          padding: 30px;
        }
        .status-badge {
          background-color: #ffd700;
          color: #000;
          padding: 8px 16px;
          border-radius: 20px;
          display: inline-block;
          font-weight: bold;
          margin: 10px 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        .info-card {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }
        .map-container {
          width: 100%;
          height: 300px;
          border-radius: 12px;
          overflow: hidden;
          margin: 20px 0;
          border: 1px solid #e2e8f0;
        }
        .item {
          display: flex;
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 15px;
          border: 1px solid #e2e8f0;
        }
        .item img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          margin-right: 20px;
        }
        .item-details {
          flex: 1;
        }
        .message-box {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #e2e8f0;
        }
        .total-box {
          background-color: #1a1a1a;
          color: #ffffff;
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
          text-align: right;
          font-size: 18px;
        }
        .footer {
          background-color: #f6f6f6;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://jantunes.vercel.app/_next/static/media/logo.fab738f9.png" alt="Logo J.Antunes">
          <h1>Nova Solicitação de Orçamento</h1>
          <p>Pedido <strong>#${pedido.id}</strong> - ${formatarData(pedido.data)}</p>
          <span class="status-badge">${pedido.status}</span>
        </div>

        <div class="content">
          <div class="info-grid">
            <div class="info-card">
              <h2>Informações do Cliente</h2>
              <p><strong>Email:</strong> ${pedido.email}</p>
              <p><strong>Evento:</strong> ${pedido.nomeEvento}</p>
              <p><strong>Data de Entrega:</strong> ${formatarData(pedido.dataEntrega)}</p>
              <p><strong>Data de Retirada:</strong> ${formatarData(pedido.dataRetirada)}</p>
            </div>

            <div class="info-card">
              <h2>Endereço do Evento</h2>
              <p>${pedido.endereco.rua}, ${pedido.endereco.numero}</p>
              ${pedido.endereco.complemento ? `<p>Complemento: ${pedido.endereco.complemento}</p>` : ''}
              <p>${pedido.endereco.bairro}</p>
              <p>${pedido.endereco.cidade} - ${pedido.endereco.estado}</p>
              <p>CEP: ${pedido.endereco.cep}</p>
            </div>
          </div>

          ${pedido.endereco.latitude && pedido.endereco.longitude ? `
            <div class="map-container" style="margin: 20px 0;">
              <img 
                src="${gerarUrlMapaEstatico(pedido.endereco.latitude, pedido.endereco.longitude)}"
                alt="Localização do evento"
                style="width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0;"
              />
              <div style="margin-top: 8px; text-align: center;">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=${pedido.endereco.latitude},${pedido.endereco.longitude}" 
                  style="color: #004d99; text-decoration: underline;"
                  target="_blank"
                >
                  Abrir no Google Maps
                </a>
              </div>
            </div>
          ` : ''}

          <h2>Itens Solicitados</h2>
          ${pedido.itens.map(item => `
            <div class="item">
              <img src="${item.image}" alt="${item.name}">
              <div class="item-details">
                <h3>${item.name}</h3>
                <p><strong>Quantidade:</strong> ${item.quantity} unidade${item.quantity > 1 ? 's' : ''}</p>
                ${item.observation ? `<p><strong>Observação:</strong> ${item.observation}</p>` : ''}
              </div>
            </div>
          `).join('')}

          ${pedido.mensagem ? `
            <div class="message-box">
              <h2>Mensagem do Cliente</h2>
              <p>${pedido.mensagem}</p>
            </div>
          ` : ''}

          <div class="total-box">
            <p>Total de Itens: ${pedido.itens.reduce((acc, item) => acc + item.quantity, 0)}</p>
          </div>
        </div>

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
