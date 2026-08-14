import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AdminShell } from "@/components/admin/admin-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Painel Admin | J.Antunes",
    template: "%s | Painel Admin",
  },
  description: "Painel administrativo — uso interno J.Antunes Locação.",
  // Painel privado: não deve aparecer em buscadores.
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Root layout independente do admin — ver app/(site)/layout.tsx para
 * o par dele. Cada um tem seu próprio <html>/<body>: é assim que o
 * Next.js App Router isola completamente duas seções de um app com
 * "Multiple Root Layouts" via Route Groups. Sem herança nenhuma do
 * layout do site público (nav, footer, carrinho, cookie banner etc.
 * nunca existem aqui).
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased bg-neutral-50 text-neutral-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="j-antunes-admin-theme"
        >
          <AdminShell>{children}</AdminShell>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
