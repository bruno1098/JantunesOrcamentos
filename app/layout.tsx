import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Toaster } from 'react-hot-toast';
import { ModalProvider } from '@/components/modal-provider';
import { CartHydration } from "@/components/providers/cart-hydration";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'J.Antunes - Locação de Toalhas Premium',
  description: 'Elegância e sofisticação em cada detalhe. Toalhas, guardanapos e trilhos de mesa para eventos especiais.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body id="root" className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider />
          <Navigation />
          <CartHydration>
            <main>{children}</main>
          </CartHydration>
          <Footer />
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}