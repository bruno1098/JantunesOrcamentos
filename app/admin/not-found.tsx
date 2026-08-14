import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-6xl font-bold text-neutral-300">404</p>
      <h1 className="text-xl font-semibold text-neutral-900">Página não encontrada</h1>
      <p className="text-sm text-neutral-500">
        Essa página não existe no painel administrativo.
      </p>
      <Button asChild>
        <Link href="/admin/dashboard">Voltar ao Dashboard</Link>
      </Button>
    </div>
  );
}
