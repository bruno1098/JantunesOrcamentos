"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, Shield, Truck, Clock } from "lucide-react";

const features = [
  {
    icon: Star,
    title: "Qualidade Premium",
    description: "Tecidos selecionados e acabamento impecável para sua satisfação.",
  },
  {
    icon: Shield,
    title: "Higienização Garantida",
    description: "Processo rigoroso de limpeza e esterilização em todas as peças.",
  },
  {
    icon: Truck,
    title: "Entrega Pontual",
    description: "Compromisso com horários e datas estabelecidas.",
  },
  {
    icon: Clock,
    title: "Atendimento 24/7",
    description: "Suporte completo para suas necessidades a qualquer momento.",
  },
];

export function Features() {
  // Ref para o título
  const [titleRef, titleInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Criar refs individuais para cada card
  const [card1Ref, card1InView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [card2Ref, card2InView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [card3Ref, card3InView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [card4Ref, card4InView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const cardRefs = [
    { ref: card1Ref, inView: card1InView },
    { ref: card2Ref, inView: card2InView },
    { ref: card3Ref, inView: card3InView },
    { ref: card4Ref, inView: card4InView },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      rotateX: 45
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.645, 0.045, 0.355, 1]
      }
    }
  };

  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={titleRef}
          variants={titleVariants}
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Por que escolher a J.Antunes?
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            Excelência em cada detalhe para tornar seu evento ainda mais especial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              ref={cardRefs[index].ref}
              variants={cardVariants}
              initial="hidden"
              animate={cardRefs[index].inView ? "visible" : "hidden"}
              className="text-center p-6 rounded-lg bg-white dark:bg-neutral-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}