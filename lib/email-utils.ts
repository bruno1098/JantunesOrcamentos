// Função para verificar email usando Abstract API

const apiKey = process.env.ABSTRACT_API_KEY;

export async function verificarEmail(email: string) {
  try {
    const response = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`
    );
  
    const data = await response.json();
    
    console.log('Resposta da API:', data); // Para debug

    // Verifica se o email é válido baseado em critérios mais específicos
    return data.is_valid_format.value && // formato válido
           !data.is_disposable_email.value && // não é email descartável
           data.deliverability === "DELIVERABLE"; // pode receber emails
           
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    // Em caso de erro na API, vamos considerar válido se tiver formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Função para enviar email usando SendGrid
export async function enviarEmail(params: {
  para: string;
  assunto: string;
  html: string;
}) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro na resposta da API:', data);
      throw new Error(data.error || 'Erro ao enviar email');
    }

    return data;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
} 