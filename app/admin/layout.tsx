"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="j-antunes-theme"
    >
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {isLoginPage && <Navigation />}
        {children}
        {isLoginPage && <Footer />}
      </div>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
} 