export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">J.Antunes</h3>
            <p className="text-neutral-400">
              Elegância e sofisticação em cada detalhe para seus eventos especiais.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Produtos</h4>
            <ul className="space-y-2">
              <li>
                <a href="/produtos" className="text-neutral-400 hover:text-white transition-colors">
                  Toalhas de Mesa
                </a>
              </li>
              <li>
                <a href="/produtos" className="text-neutral-400 hover:text-white transition-colors">
                  Guardanapos
                </a>
              </li>
              <li>
                <a href="/produtos" className="text-neutral-400 hover:text-white transition-colors">
                  Trilhos de Mesa
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-neutral-400 hover:text-white transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="/contato" className="text-neutral-400 hover:text-white transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="/duvidas-frequentes" className="text-neutral-400 hover:text-white transition-colors">
                  Dúvidas Frequentes
                </a>
              </li>
              <li>
                <a href="/termos-condicoes" className="text-neutral-400 hover:text-white transition-colors">
                  Termos e Condições
                </a>
              </li>
              <li>
                <a href="/politica-privacidade" className="text-neutral-400 hover:text-white transition-colors">
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Horário de Atendimento</h4>
            <p className="text-neutral-400">
              Segunda a Sexta: 8h às 18h<br />
              Sábado: 8h às 12h<br />
              Domingo: Fechado
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-400">
          <p>&copy; {new Date().getFullYear()} J.Antunes. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}