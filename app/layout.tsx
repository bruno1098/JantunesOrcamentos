import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Toaster } from 'react-hot-toast';
import { ModalProvider } from '@/components/modal-provider';
import { CartHydration } from "@/components/providers/cart-hydration";
import Script from 'next/script';
import { CookieConsent } from '@/components/CookieConsent';
import StyledComponentsRegistry from '@/lib/registry';

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
  keywords: ['locação', 'toalhas', 'eventos', 'festas', 'decoração', 'locação de toalhas', 'toalhas para eventos', 'decoração de festas', 'toalhas para festas', 'artigos decorativos', 'locação de artigos para eventos', 'J.Antunes Locação'],
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
      url: '/images/logo.png',
      width: 1200,
      height: 630,
      alt: 'J.Antunes Locação - Toalhas para eventos e festas'
    }]
  },
  icons: {
    icon: '/images/logo.png', // Caminho para o favicon
  },

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <Script
          id="business-json-ld" 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "J.Antunes Locação",
              "description": "Locação de toalhas e artigos decorativos para festas e eventos.",
              "url": "https://locacaodetoalhas.vercel.app",
              "image": "https://locacaodetoalhas.vercel.app/images/logo.png",
            }),
          }}
        />
      </head>
      <body id="root" className={`${inter.variable} font-sans antialiased overflow-x-hidden w-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="j-antunes-theme"
        >
          <div className="relative w-full overflow-x-hidden">
            <ModalProvider />
            <Navigation />
            <CartHydration>
              <main className="w-full overflow-x-hidden">{children}</main>
            </CartHydration>
            <Footer />
            <Toaster position="top-right" />
            <CookieConsent />
          </div>
        </ThemeProvider>  
        
      </body>
    </html>
  );
}