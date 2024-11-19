import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;

console.log('API Key começa com:', apiKey?.substring(0, 3));

if (!apiKey || !apiKey.startsWith('SG.')) {
  console.error('API Key inválida ou não configurada corretamente');
}

// Configurar a API key do SendGrid
sgMail.setApiKey(apiKey || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { para, assunto, html } = req.body;

    if (!para || !assunto || !html) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando' 
      });
    }

    const msg = {
      to: para,
      from: {
        email: 'bruno.saantunes1@gmail.com',
        name: 'J.Antunes'
      },
      subject: assunto,
      html: html,
    };

    console.log('Configuração do email:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    });

    const [response] = await sgMail.send(msg);
    
    console.log('Resposta do SendGrid:', {
      statusCode: response.statusCode,
      headers: response.headers
    });

    return res.status(200).json({ 
      success: true,
      message: 'Email enviado com sucesso'
    });

  } catch (error: any) {
    console.error('Erro detalhado:', {
      message: error.message,
      code: error.code,
      response: error.response?.body
    });

    return res.status(500).json({ 
      error: 'Erro ao enviar email',
      details: error.response?.body || error.message
    });
  }
} 