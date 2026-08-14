"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Shield, 
  Clock, 
  Truck, 
  CreditCard, 
  AlertCircle,
  Sparkles,
  Package,
  CalendarCheck,
  Scale,
  FileWarning,
  BadgeAlert
} from "lucide-react";
import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Home
          </Button>
        </Link>

        <Card className="p-6 md:p-8">
          <div className="prose dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-2">Termos e Condições</h1>
            <p className="text-muted-foreground mb-8">
              Última atualização: {new Date().toLocaleDateString()}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-4 border-primary/20">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-2">Proteção ao Cliente</h3>
                <p className="text-sm text-muted-foreground">
                  Garantimos a qualidade e higiene de todos os produtos locados
                </p>
              </Card>

              <Card className="p-4 border-primary/20">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-2">Prazos</h3>
                <p className="text-sm text-muted-foreground">
                  Compromisso com pontualidade na entrega e retirada
                </p>
              </Card>

              <Card className="p-4 border-primary/20">
                <Truck className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-2">Logística</h3>
                <p className="text-sm text-muted-foreground">
                  Entrega e retirada realizadas por equipe especializada
                </p>
              </Card>

              <Card className="p-4 border-primary/20">
                <CreditCard className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-2">Pagamento</h3>
                <p className="text-sm text-muted-foreground">
                  Diversas formas de pagamento disponíveis
                </p>
              </Card>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold">1. Condições Gerais</h2>
                <Card className="p-4 mt-4">
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Os produtos são disponibilizados mediante contrato de locação</li>
                    <li>O período mínimo de locação é de 24 horas</li>
                    <li>A confirmação da reserva está sujeita à disponibilidade</li>
                    <li>Todos os itens passam por processo de higienização profissional</li>
                    <li>É necessário documento de identificação válido para locação</li>
                  </ul>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">2. Reservas e Pagamentos</h2>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="p-4">
                    <Package className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium mb-2">Reserva</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Antecedência mínima de 7 dias</li>
                      <li>Sujeita à disponibilidade</li>
                      <li>Confirmação após sinal de 50%</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <CreditCard className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium mb-2">Pagamento</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>PIX</li>
                      <li>Cartão de crédito</li>
                      <li>Transferência bancária</li>
                    </ul>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">3. Entrega e Devolução</h2>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="p-4">
                    <Truck className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium mb-2">Logística</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Entrega no local do evento</li>
                      <li>Montagem inclusa quando aplicável</li>
                      <li>Retirada após o evento</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <CalendarCheck className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium mb-2">Horários</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Agendamento prévio</li>
                      <li>Flexibilidade de horários</li>
                      <li>Pontualidade garantida</li>
                    </ul>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">4. Responsabilidades</h2>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="p-4">
                    <Scale className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium mb-2">Do Cliente</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Zelar pelos itens locados</li>
                      <li>Usar conforme instruções</li>
                      <li>Informar danos imediatamente</li>
                      <li>Ressarcir itens danificados</li>
                      <li>Evitar uso inadequado</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <Shield className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium mb-2">Da Empresa</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Qualidade dos produtos</li>
                      <li>Higienização adequada</li>
                      <li>Suporte durante evento</li>
                      <li>Manutenção preventiva</li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-4 mt-4 border-warning/20">
                  <AlertCircle className="h-6 w-6 text-warning mb-2" />
                  <h3 className="font-medium mb-2">Danos e Perdas</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Em caso de perda, dano ou uso inadequado, o contratante se compromete a pagar o valor integral do item conforme tabela de preços vigente</li>
                    <li>Manchas permanentes serão consideradas como dano ao produto</li>
                    <li>Itens não devolvidos serão cobrados como perda total</li>
                    <li>A avaliação dos danos será realizada pela equipe técnica no momento da devolução</li>
                    <li>Fotos e laudos dos danos serão disponibilizados quando solicitado</li>
                  </ul>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">5. Política de Cancelamento</h2>
                <Card className="p-4 mt-4">
                  <FileWarning className="h-6 w-6 text-primary mb-2" />
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Até 7 dias antes: reembolso integral</li>
                    <li>3 a 6 dias antes: reembolso de 50%</li>
                    <li>Menos de 48h: sem reembolso</li>
                    <li>Força maior: análise caso a caso</li>
                  </ul>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">6. Disposições Finais</h2>
                <Card className="p-4 mt-4">
                  <BadgeAlert className="h-6 w-6 text-primary mb-2" />
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Alterações mediante comunicação prévia</li>
                    <li>Casos omissos serão resolvidos pela administração</li>
                    <li>Foro de São Paulo para questões judiciais</li>
                  </ul>
                </Card>
              </section>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 