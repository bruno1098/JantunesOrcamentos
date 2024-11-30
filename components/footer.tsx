import { Instagram, Mail, Phone, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Grade Principal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Coluna 1 - Sobre */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              J.Antunes
            </h3>
            <p className="text-sm md:text-base text-neutral-400 leading-relaxed">
              Elegância e sofisticação em cada detalhe para seus eventos especiais.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="https://www.instagram.com/locacaodetoalhas07/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
              >
                <Button size="icon" variant="outline" className="rounded-full bg-transparent border-neutral-700 hover:bg-neutral-800">
                  <Instagram className="w-4 h-4" />
                </Button>
              </a>
              <a 
                href="mailto:j.antunes@gmail.com"
                className="hover:scale-110 transition-transform"
              >
                <Button size="icon" variant="outline" className="rounded-full bg-transparent border-neutral-700 hover:bg-neutral-800">
                  <Mail className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* Coluna 2 - Produtos */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">Produtos</h4>
            <ul className="space-y-2 text-sm">
              {["Toalhas de Mesa", "Guardanapos", "Trilhos de Mesa"].map((item) => (
                <li key={item}>
                  <Link 
                    href="/produtos" 
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3 - Links Úteis */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">Links Úteis</h4>
            <ul className="space-y-2 text-sm">
              {[
                { text: "Sobre Nós", href: "/about" },
                { text: "Contato", href: "/contato" },
                { text: "Dúvidas Frequentes", href: "/duvidas-frequentes" },
                { text: "Termos e Condições", href: "/termos-condicoes" },
                { text: "Política de Privacidade", href: "/politica-privacidade" }
              ].map((link) => (
                <li key={link.text}>
                  <Link 
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4 - Contato */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">Contato & Horários</h4>
            <div className="space-y-3 text-sm text-neutral-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary/60" />
                <span>(11) 94022-4459</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary/60" />
                <span>j.antunes@gmail.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-primary/60 mt-0.5" />
                <div>
                  Segunda a Sexta: 8h às 18h<br />
                  Sábado: 8h às 12h<br />
                  Domingo: Fechado
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separador com gradiente */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

        {/* Copyright */}
        <div className="text-center text-neutral-500 text-xs">
          <p>&copy; {new Date().getFullYear()} J.Antunes. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}