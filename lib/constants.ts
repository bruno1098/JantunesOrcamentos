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