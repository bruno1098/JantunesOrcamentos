"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    event: "Herbalife Extravaganza",
    location: "Rio de Janeiro",
    image: "https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/10527898_339947799491193_6388993967165438990_n-586w.jpg",
    content: "O Herbalife Extravaganza foi um evento grandioso, e as toalhas fornecidas pela J.Antunes adicionaram um toque de sofisticação que fez toda a diferença. A qualidade do material foi amplamente elogiada por nossos participantes e deixou uma impressão duradoura.",
    client: "Equipe Organizadora Herbalife",
  },
  {
    event: "Jantar de Homenagem Natura",
    location: "Cajamar, SP",
    image: "https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/82830575_1522679404551354_1457114045109764096_o-774dd1c2-435h.jpg",
    content: "No jantar em homenagem aos nossos funcionários, a escolha das toalhas foi essencial para criar um ambiente acolhedor e elegante. A J.Antunes foi impecável, entregando produtos de alta qualidade que atenderam e superaram as nossas expectativas.",
    client: "Equipe de Eventos Natura",
  },
  {
    event: "Evento Sensacional no Golden Hall",
    location: "Golden Hall, WTC",
    image: "https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/13615352_661309920688311_8699594650603769949_n-586w.jpg",
    content: "Nosso evento no Golden Hall precisava de um padrão elevado, e as toalhas fornecidas pela J.Antunes se destacaram pela sofisticação e acabamento impecável. Os elogios dos participantes foram inúmeros, e temos certeza de que essa parceria continuará nos próximos eventos.",
    client: "Equipe de Produção",
  },
];



export function Testimonials() {
  // Ref para o título
  const [titleRef, titleInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Criar refs individuais para cada depoimento
  const [testimonial1Ref, testimonial1InView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [testimonial2Ref, testimonial2InView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [testimonial3Ref, testimonial3InView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const testimonialRefs = [
    { ref: testimonial1Ref, inView: testimonial1InView },
    { ref: testimonial2Ref, inView: testimonial2InView },
    { ref: testimonial3Ref, inView: testimonial3InView },
  ];

  const titleVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      filter: "blur(10px)"
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0,
      x: -100,
      rotateY: 45
    },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: {
        duration: 0.8,
        delay: i * 0.2,
        ease: [0.23, 1, 0.32, 1]
      }
    })
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={titleRef}
          variants={titleVariants}
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            O que dizem nossos clientes
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            A satisfação de nossos clientes é nossa maior recompensa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              ref={testimonialRefs[index].ref}
              variants={cardVariants}
              initial="hidden"
              animate={testimonialRefs[index].inView ? "visible" : "hidden"}
              className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.event}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.event}</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {testimonial.location} 
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}