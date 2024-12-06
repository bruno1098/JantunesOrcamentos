import { Pedido } from "@/types/pedido";
import { STATUS_COLORS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PedidoCardProps {
  pedido: Pedido;
}

export function PedidoCard({ pedido }: PedidoCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Pedido #{pedido.id}</CardTitle>
          <span className={`px-3 py-1 rounded-full text-sm ${
            STATUS_COLORS[pedido.status as keyof typeof STATUS_COLORS]
          }`}>
            {pedido.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* ... resto do conteúdo ... */}
      </CardContent>
    </Card>
  );
} 