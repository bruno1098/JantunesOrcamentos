"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ShoppingBag, 
  Truck, 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Star,
  Heart
} from "lucide-react";

export default function SobrePage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[400px] mb-16"
      >
        <Image
          src="https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5695+%282%29-1920w.JPG"
          alt="Mesa decorada com toalhas elegantes"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Sobre a J.Antunes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-neutral-200"
            >
              Transformando eventos em momentos inesquecíveis desde 2010
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Nossa História */}
      <section ref={ref} className="px-4 md:px-8 max-w-7xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Nossa História</h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              A J.Antunes nasceu da paixão por transformar eventos em experiências memoráveis. 
              Com mais de uma década de experiência no mercado de locação de toalhas e acessórios 
              para eventos, nos especializamos em oferecer produtos de alta qualidade e um 
              atendimento personalizado que supera expectativas.
            </p>
            <p className="text-neutral-600 dark:text-neutral-300">
              Nossa missão é proporcionar elegância e sofisticação a cada evento, 
              garantindo que cada detalhe seja cuidadosamente pensado e executado.
            </p>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2940"
              alt="Evento decorado"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* Como Funciona */}
      <section className="bg-neutral-50 dark:bg-neutral-900 py-20 px-4 md:px-8 mb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Como Funciona
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              Simplificamos o processo de locação para tornar sua experiência mais agradável
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: "Escolha os Produtos",
                description: "Navegue por nossa seleção de produtos e adicione os itens desejados ao carrinho"
              },
              {
                icon: Calendar,
                title: "Solicite Orçamento",
                description: "Preencha o formulário com as informações do seu evento para receber um orçamento personalizado"
              },
              {
                icon: MessageSquare,
                title: "Atendimento Personalizado",
                description: "Nossa equipe entrará em contato para finalizar os detalhes do seu pedido"
              },
              {
                icon: Clock,
                title: "Acompanhamento",
                description: "Acompanhe o status do seu pedido através da área 'Meus Pedidos'"
              },
              {
                icon: Truck,
                title: "Entrega e Retirada",
                description: "Realizamos a entrega e retirada dos produtos nos horários combinados"
              },
              {
                icon: CheckCircle2,
                title: "Satisfação Garantida",
                description: "Garantimos a qualidade e limpeza de todos os nossos produtos"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-primary/10 rounded-2xl p-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para tornar seu evento especial?
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
            Explore nossa coleção de produtos e solicite um orçamento personalizado para seu evento
          </p>
          <Link href="/produtos">
            <Button size="lg" className="group">
              Ver Produtos
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
} 