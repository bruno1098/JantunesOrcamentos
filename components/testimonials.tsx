"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Organizadora de Eventos",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787",
    content: "A qualidade das toalhas e o atendimento da J.Antunes são excepcionais. Sempre que preciso para meus eventos, é minha primeira escolha.",
  },
  {
    name: "João Santos",
    role: "Chef de Cozinha",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2787",
    content: "Os produtos da J.Antunes elevam a apresentação dos meus eventos gastronômicos. A atenção aos detalhes é impressionante.",
  },
  {
    name: "Ana Costa",
    role: "Decoradora",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2788",
    content: "Trabalho com a J.Antunes há anos e nunca me decepcionei. A variedade e qualidade dos produtos são incomparáveis.",
  },
];

export function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.4 }
    }
  };

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
    <section ref={ref} className="py-20 px-4 md:px-8 bg-neutral-50 dark:bg-neutral-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="max-w-7xl mx-auto"
      >
        <motion.div
          variants={titleVariants}
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
              custom={index}
              variants={cardVariants}
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
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}