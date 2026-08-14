 "use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Cookies from "js-cookie";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar se o consentimento já foi dado
    const consent = Cookies.get("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    // Salvar consentimento nos cookies
    Cookies.set("cookieConsent", "accepted", { expires: 365 }); // Expira em 1 ano
    setShowBanner(false);

    // Inicializar serviços de analytics aqui
    if (typeof window !== "undefined") {
      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtag = (...args: any[]) => {
        (window as any).dataLayer.push(args);
      };
      gtag("js", new Date());
      gtag("config", "SEU-ID-DO-GA");
    }
  };

  const declineCookies = () => {
    // Salvar recusa nos cookies
    Cookies.set("cookieConsent", "declined", { expires: 365 }); // Expira em 1 ano
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm md:text-base">
              <p>
                Utilizamos cookies para melhorar sua experiência em nosso site.
                Ao continuar navegando, você concorda com nossa{" "}
                <Link
                  href="/politica-privacidade"
                  className="text-primary hover:underline"
                >
                  Política de Privacidade
                </Link>{" "}
                e{" "}
                <Link
                  href="/termos-condicoes"
                  className="text-primary hover:underline"
                >
                  Termos e Condições
                </Link>
                .
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={declineCookies}
                className="whitespace-nowrap"
              >
                Recusar
              </Button>
              <Button onClick={acceptCookies} className="whitespace-nowrap">
                Aceitar Cookies
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
