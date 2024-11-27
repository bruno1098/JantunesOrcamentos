// Função de debounce para limitar as chamadas
let timeoutId: NodeJS.Timeout;

export async function verificarEmail(email: string): Promise<boolean> {
  // Retorna uma Promise que será resolvida após o delay
  return new Promise((resolve) => {
    // Cancela o timeout anterior se existir
    if (timeoutId) clearTimeout(timeoutId);

    // Cria um novo timeout
    timeoutId = setTimeout(async () => {
      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
    
        const data = await response.json();
        
        if (!response.ok) {
          console.warn("Erro na resposta da API:", data.error);
          resolve(false);
          return;
        }

        resolve(
          data.is_valid_format?.value === true && 
          data.is_disposable_email?.value === false && 
          data.deliverability === "DELIVERABLE"
        );
      } catch (error) {
        console.error("Erro ao verificar email:", error);
        resolve(false);
      }
    }, 1000); // Espera 1 segundo entre as chamadas
  });
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