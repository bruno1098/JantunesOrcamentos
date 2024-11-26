"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ProductShowcase() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
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
    <section ref={ref} className="py-20 px-4 md:px-8 bg-neutral-50 dark:bg-neutral-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="max-w-7xl mx-auto"
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-center mb-12"
        >
          Nossa Coleção Premium
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="relative group">
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

          <motion.div variants={itemVariants} className="relative group">
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

          <motion.div variants={itemVariants} className="relative group">
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
          variants={itemVariants}
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
      </motion.div>
    </section>
  );
}