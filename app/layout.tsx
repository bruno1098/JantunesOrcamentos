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
  metadataBase: new URL('https://locacaodetoalhas.vercel.app'),
  title: {
    default: 'J.Antunes Locação',
    template: '%s | J.Antunes Locação'
  },
  description: 'Locação de toalhas e artigos para festas e eventos',
  keywords: ['locação', 'toalhas', 'eventos', 'festas', 'decoração'],
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://locacaodetoalhas.vercel.app',
    siteName: 'J.Antunes Locação',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630
    }]
  }
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
          storageKey="j-antunes-theme"
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