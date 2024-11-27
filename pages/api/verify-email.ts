import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ABSTRACT_API_KEY;
  const { email } = req.body;

  if (!apiKey) {
    console.error('API Key do Abstract não configurada');
    return res.status(500).json({ error: 'Configuração da API inválida' });
  }

  try {
    const response = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Erro ao validar email:', error);
    return res.status(500).json({ 
      error: 'Erro ao validar email',
      details: error.message 
    });
  }
} 