// Dados de contato/identidade oficiais da empresa — fonte única.
// Sobrescrevíveis via env vars (todas precisam ser NEXT_PUBLIC_ pois
// email-templates.ts, orcamento-pdf.tsx e os componentes de contato
// rodam no client/browser, não só no servidor).
export const CONTATO = {
  telefoneExibicao: "(11) 94022-4459",
  // Apenas dígitos com DDI, para uso em links wa.me
  whatsapp: "5511940224459",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "j.antunes@gmail.com",
  // E-mail que recebe notificações de novo pedido e mensagens do form de contato
  emailAdmin:
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "j.antunes@gmail.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://locacaodetoalhas.vercel.app",
  nomeEmpresa: "J.Antunes Locação",
} as const;

export const STATUS_COLORS = {
  "Pendente": "bg-yellow-100 text-yellow-800",
  "Em Análise": "bg-blue-100 text-blue-800",
  "Aprovado": "bg-green-100 text-green-800",
  "Entregue": "bg-purple-100 text-purple-800",
  "Finalizado": "bg-gray-100 text-gray-800",
  "Cancelado": "bg-red-100 text-red-800",
} as const;

export const STATUS_OPTIONS = [
  "Pendente",
  "Em Análise",
  "Aprovado",
  "Entregue",
  "Finalizado",
  "Cancelado",
] as const; 