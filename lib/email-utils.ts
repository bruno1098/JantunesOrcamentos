// Função para verificar email usando Abstract API

const apiKey = process.env.ABSTRACT_API_KEY;

export async function verificarEmail(email: string) {
  try {
    // Verifica se a chave da API existe
    if (!apiKey) {
      console.warn("Chave da API Abstract não configurada");
      // Fallback para validação básica
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    const response = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`
    );
  
    const data = await response.json();
    
    // Verifica se há erro na resposta
    if (data.error) {
      console.warn("Erro na resposta da API Abstract:", data.error);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    return data.is_valid_format?.value && 
           !data.is_disposable_email?.value && 
           data.deliverability === "DELIVERABLE";
           
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