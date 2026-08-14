"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-bold mb-2">Política de Privacidade</h1>
            <p className="text-muted-foreground mb-8">
              Última atualização: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold">1. Informações que Coletamos</h2>
                <p className="text-muted-foreground mb-4">
                  Para processar seu pedido de orçamento e garantir o melhor atendimento, coletamos:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Dados do Cliente</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Nome completo</li>
                      <li>Endereço de email</li>
                      <li>Telefone para contato</li>
                      <li>Endereço de entrega</li>
                      <li>CEP</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Dados do Evento</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Data de entrega</li>
                      <li>Data de retirada</li>
                      <li>Local do evento</li>
                      <li>Itens selecionados</li>
                      <li>Observações específicas</li>
                    </ul>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">2. Uso das Informações</h2>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Finalidades Principais</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Elaboração de orçamentos</li>
                      <li>Agendamento de entregas</li>
                      <li>Comunicação sobre o pedido</li>
                      <li>Atendimento via WhatsApp</li>
                      <li>Histórico de solicitações</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Melhorias do Serviço</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Análise de preferências</li>
                      <li>Aprimoramento do site</li>
                      <li>Comunicações relevantes</li>
                      <li>Pesquisas de satisfação</li>
                      <li>Suporte ao cliente</li>
                    </ul>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">3. Proteção de Dados</h2>
                <p className="text-muted-foreground mb-4">
                  Implementamos medidas para proteger suas informações:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Segurança Digital</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Conexão segura (HTTPS)</li>
                      <li>Proteção contra invasões</li>
                      <li>Backups regulares</li>
                      <li>Acesso controlado</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Práticas Internas</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Confidencialidade</li>
                      <li>Treinamento da equipe</li>
                      <li>Processos seguros</li>
                      <li>Política de privacidade</li>
                    </ul>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">4. Compartilhamento</h2>
                <p className="text-muted-foreground mb-4">
                  Suas informações são compartilhadas apenas com:
                </p>
                <Card className="p-4">
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>Nossa equipe de entrega para logística</li>
                    <li>Serviço de email para comunicações</li>
                    <li>WhatsApp Business para atendimento</li>
                    <li>Funcionários autorizados</li>
                  </ul>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">5. Seus Direitos</h2>
                <p className="text-muted-foreground mb-4">
                  Você tem direito a:
                </p>
                <Card className="p-4">
                  <ul className="list-disc list-inside text-muted-foreground grid md:grid-cols-2 gap-2">
                    <li>Acessar seus dados</li>
                    <li>Solicitar correções</li>
                    <li>Excluir suas informações</li>
                    <li>Cancelar comunicações</li>
                    <li>Tirar dúvidas</li>
                    <li>Fazer reclamações</li>
                  </ul>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">6. Contato</h2>
                <p className="text-muted-foreground mb-4">
                  Para questões sobre privacidade:
                </p>
                <Card className="p-4">
                  <ul className="space-y-2 text-muted-foreground">
                    <li>WhatsApp: (11) 94022-4459</li>
                    <li>Email: j.antunes@gmail.com</li>
                    <li>Horário: Segunda a Sexta, 9h às 18h</li>
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