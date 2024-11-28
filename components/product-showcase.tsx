"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ProductShowcase() {
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [card1Ref, card1InView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const [card2Ref, card2InView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const [card3Ref, card3InView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const [buttonRef, buttonInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      },
    },
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          ref={headerRef}
          variants={itemVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="text-4xl md:text-5xl font-bold text-center mb-12"
        >
          Nossa Coleção Premium
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            ref={card1Ref}
            variants={itemVariants}
            initial="hidden"
            animate={card1InView ? "visible" : "hidden"}
            className="relative group"
          >
            <div className="relative h-96 overflow-hidden rounded-lg">
              <Image
                src="https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5713-1920w.JPG"
                alt="Toalhas de Mesa"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Toalhas de Mesa</h3>
                <p className="text-neutral-200">Elegância em cada detalhe</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            ref={card2Ref}
            variants={itemVariants}
            initial="hidden"
            animate={card2InView ? "visible" : "hidden"}
            className="relative group"
          >
            <div className="relative h-96 overflow-hidden rounded-lg">
              <Image
                src="https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5643-1920w.JPG"
                alt="Guardanapos"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Guardanapos</h3>
                <p className="text-neutral-200">Sofisticação em cada dobra</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            ref={card3Ref}
            variants={itemVariants}
            initial="hidden"
            animate={card3InView ? "visible" : "hidden"}
            className="relative group"
          >
            <div className="relative h-96 overflow-hidden rounded-lg">
              <Image
                src="https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5627-50625647-1920w.JPG"
                alt="Trilhos de Mesa"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Trilhos de Mesa</h3>
                <p className="text-neutral-200">O toque final perfeito</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          ref={buttonRef}
          variants={itemVariants}
          initial="hidden"
          animate={buttonInView ? "visible" : "hidden"}
          className="text-center mt-12"
        >
          <Link href="/produtos">
            <Button
              size="lg"
              className="group"
            >
              Ver todos os produtos
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}