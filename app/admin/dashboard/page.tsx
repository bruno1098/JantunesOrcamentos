"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { buscarTodosPedidos } from "@/lib/pedidos-service";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Package,
  DollarSign,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemPedido {
  id: string;
  name: string;
  quantity: number;
  observation?: string;
}

interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude?: number;
  longitude?: number;
}

interface Pedido {
  id: string;
  nomeEvento: string;
  data: string;
  dataEntrega: string;
  dataRetirada: string;
  status: string;
  email: string;
  endereco: Endereco;
  itens: ItemPedido[];
  mensagem?: string;
}

interface DashboardStats {
  totalPedidos: number;
  pedidosPendentes: number;
  pedidosHoje: number;
  crescimentoMensal: number;
  totalProdutos: number;
}

const CORES_GRAFICO = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';  // Opcional
  isLoading: boolean;
}

interface TabelaPedidoRowProps {
  pedido: Pedido;
  onVerDetalhes: () => void;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodoFiltro, setPeriodoFiltro] = useState("7dias");
  const [stats, setStats] = useState<DashboardStats>({
    totalPedidos: 0,
    pedidosPendentes: 0,
    pedidosHoje: 0,
    crescimentoMensal: 0,
    totalProdutos: 0
  });
  const [itensPorPagina, setItensPorPagina] = useState("5");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("mais-recente");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const resultado = await buscarTodosPedidos();
      setPedidos(resultado);
      calcularEstatisticas(resultado);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const calcularEstatisticas = (dados: Pedido[]) => {
    const hoje = new Date();
    const pedidosHoje = dados.filter(pedido => 
      format(new Date(pedido.data), 'yyyy-MM-dd') === format(hoje, 'yyyy-MM-dd')
    ).length;

    const pedidosPendentes = dados.filter(pedido => 
      pedido.status === 'Pendente'
    ).length;

    const mesPassado = dados.filter(pedido => {
      const dataPedido = new Date(pedido.data);
      const mesAnterior = new Date();
      mesAnterior.setMonth(mesAnterior.getMonth() - 1);
      return dataPedido.getMonth() === mesAnterior.getMonth();
    }).length;

    const mesAtual = dados.filter(pedido => {
      const dataPedido = new Date(pedido.data);
      return dataPedido.getMonth() === hoje.getMonth();
    }).length;

    const crescimento = mesPassado ? ((mesAtual - mesPassado) / mesPassado) * 100 : 0;

    const totalProdutos = dados.reduce((total, pedido) => {
      return total + pedido.itens.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    setStats({
      totalPedidos: dados.length,
      pedidosPendentes,
      pedidosHoje,
      crescimentoMensal: crescimento,
      totalProdutos
    });
  };

  const getDadosGrafico = () => {
    const hoje = new Date();
    const diasFiltro = periodoFiltro === "7dias" ? 7 : 30;
    
    const dadosFiltrados = Array.from({ length: diasFiltro }, (_, i) => {
      const data = new Date();
      data.setDate(hoje.getDate() - i);
      const pedidosDia = pedidos.filter(pedido => 
        format(new Date(pedido.data), 'yyyy-MM-dd') === format(data, 'yyyy-MM-dd')
      ).length;

      return {
        data: format(data, 'dd/MM', { locale: ptBR }),
        pedidos: pedidosDia,
      };
    }).reverse();

    return dadosFiltrados;
  };

  const getDadosStatus = () => {
    const statusCount = pedidos.reduce((acc, pedido) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, quantidade]) => ({
      status,
      quantidade,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  const getPedidosFiltrados = () => {
    let pedidosFiltrados = [...pedidos];

    // Filtrar por status
    if (filtroStatus !== "todos") {
      pedidosFiltrados = pedidosFiltrados.filter(
        pedido => pedido.status === filtroStatus
      );
    }

    // Ordenar
    pedidosFiltrados.sort((a, b) => {
      const dataA = new Date(a.data).getTime();
      const dataB = new Date(b.data).getTime();
      return ordenacao === "mais-recente" ? dataB - dataA : dataA - dataB;
    });

    return pedidosFiltrados;
  };

  return (
    <AdminGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <Button variant="destructive" onClick={handleLogout}>
            Sair
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total de Pedidos"
            value={stats.totalPedidos}
            icon={Package}
            isLoading={isLoading}
          />
          <StatCard
            title="Pedidos Pendentes"
            value={stats.pedidosPendentes}
            icon={Calendar}
            isLoading={isLoading}
          />
          <StatCard
            title="Pedidos Hoje"
            value={stats.pedidosHoje}
            icon={Users}
            isLoading={isLoading}
          />
          <StatCard
            title="Crescimento Mensal"
            value={`${stats.crescimentoMensal.toFixed(1)}%`}
            icon={DollarSign}
            trend={stats.crescimentoMensal >= 0 ? "up" : "down"}
            isLoading={isLoading}
          />
          <StatCard
            title="Total de Produtos"
            value={stats.totalProdutos}
            icon={Package}
            isLoading={isLoading}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pedidos por Período</CardTitle>
                <Select
                  value={periodoFiltro}
                  onValueChange={setPeriodoFiltro}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                    <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDadosGrafico()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="pedidos" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status dos Pedidos</CardTitle>
              <CardDescription>Distribuição por status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getDadosStatus()}
                        dataKey="quantidade"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {getDadosStatus().map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CORES_GRAFICO[index % CORES_GRAFICO.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Pedidos Recentes */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Pedidos Recentes</CardTitle>
              <div className="flex flex-wrap gap-4">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Entregue">Entregue</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ordenacao} onValueChange={setOrdenacao}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mais-recente">Mais Recente</SelectItem>
                    <SelectItem value="mais-antigo">Mais Antigo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={itensPorPagina} onValueChange={setItensPorPagina}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Itens por página" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 por página</SelectItem>
                    <SelectItem value="10">10 por página</SelectItem>
                    <SelectItem value="20">20 por página</SelectItem>
                    <SelectItem value="50">50 por página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Data</th>
                    <th className="text-left p-4">Cliente</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4">
                        <div className="flex justify-center">
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </td>
                    </tr>
                  ) : getPedidosFiltrados()
                      .slice(0, parseInt(itensPorPagina))
                      .map((pedido) => (
                        <TabelaPedidoRow
                          key={pedido.id}
                          pedido={pedido}
                          onVerDetalhes={() => router.push(`/admin/pedidos/${pedido.id}`)}
                        />
                      ))}
                </tbody>
              </table>
              {!isLoading && getPedidosFiltrados().length === 0 && (
                <div className="text-center p-4 text-gray-500">
                  Nenhum pedido encontrado com os filtros selecionados.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}

// Componentes auxiliares
function StatCard({ title, value, icon: Icon, trend, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-8 w-[60px]" />
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">
                  {title}
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{value}</h2>
                  {trend && (
                    <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                      {trend === "up" ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TabelaPedidoRow({ pedido, onVerDetalhes }: TabelaPedidoRowProps) {
  const router = useRouter();

  // Calcular quantidade de itens diferentes no pedido
  const totalItens = pedido.itens.length;

  // Calcular soma total de todas as quantidades
  const totalQuantidades = pedido.itens.reduce((sum, item) => sum + item.quantity, 0);

  // Criar string com detalhes dos produtos
  const detalheProdutos = pedido.itens.map(item => 
    `${item.quantity}x ${item.name}${item.observation ? ` (Obs: ${item.observation})` : ''}`
  ).join(', ');

  return (
    <tr className="border-b">
      <td className="p-4">#{pedido.id}</td>
      <td className="p-4">
        {format(new Date(pedido.data), "dd/MM/yyyy", { locale: ptBR })}
      </td>
      <td className="p-4">{pedido.email}</td>
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <span className={`px-3 py-1 rounded-full text-sm ${
            pedido.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
            pedido.status === 'Em Análise' ? 'bg-blue-100 text-blue-800' :
            pedido.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
            pedido.status === 'Entregue' ? 'bg-purple-100 text-purple-800' :
            pedido.status === 'Finalizado' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {pedido.status}
          </span>
          <span className="text-sm text-muted-foreground">
            {totalItens} {totalItens === 1 ? 'item' : 'itens'} ({totalQuantidades} {totalQuantidades === 1 ? 'unidade' : 'unidades'})
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={detalheProdutos}>
            {detalheProdutos}
          </span>
        </div>
      </td>
      <td className="p-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push(`/admin/pedidos/${pedido.id}`)}
        >
          Ver Detalhes
        </Button>
      </td>
    </tr>
  );
} 