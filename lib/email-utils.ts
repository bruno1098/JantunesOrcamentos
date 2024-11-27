// Função para verificar email usando Abstract API

const apiKey = process.env.ABSTRACT_API_KEY;

export async function verificarEmail(email: string) {
  try {
    if (!apiKey) {
      console.warn("Chave da API Abstract não configurada");
      return false; // Retorna falso se não houver chave API
    }

    const response = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`
    );
  
    const data = await response.json();
    
    if (data.error) {
      console.warn("Erro na resposta da API Abstract:", data.error);
      return false;
    }

    // Retorna true apenas se todas as condições forem verdadeiras
    return data.is_valid_format?.value === true && 
           data.is_disposable_email?.value === false && 
           data.deliverability === "DELIVERABLE";
           
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    return false; // Retorna falso em caso de erro
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