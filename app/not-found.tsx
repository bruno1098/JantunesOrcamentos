"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Home } from "lucide-react";

// Função para gerar número aleatório
const random = (seed: string) => {
  const x = Math.sin(seed.split('').reduce((a, b) => {
    return a + b.charCodeAt(0);
  }, 0)) * 10000;
  return x - Math.floor(x);
};

// Animação de partículas flutuantes
const NotFoundAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const x = random(`x-${i}`) * 100;
        const y = random(`y-${i}`) * 100;
        const size = random(`size-${i}`) * 20;
        
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              opacity: 0.2,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2 + random(`duration-${i}`) * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

export default function NotFound() {
  const numberRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animação do número 404
      gsap.from(numberRef.current, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "bounce.out",
      });

      // Animação do texto
      gsap.from(textRef.current, {
        x: -50,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
      });

      // Animação do botão
      gsap.from(buttonRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        delay: 1,
        ease: "back.out(1.7)",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Animação de fundo */}
      <NotFoundAnimation />

      {/* Conteúdo */}
      <div className="relative z-10 text-center px-4">
        <div ref={numberRef} className="mb-8">
          <motion.h1 
            className="text-[150px] md:text-[200px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50"
            animate={{ 
              textShadow: ["0 0 20px var(--primary)", "0 0 0px var(--primary)"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            404
          </motion.h1>
        </div>

        <div ref={textRef} className="mb-12">
          <motion.p 
            className="text-2xl md:text-3xl font-medium text-muted-foreground"
            animate={{ 
              opacity: [0.5, 1],
              y: [5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            Ops! Página não encontrada
          </motion.p>
        </div>

        <div ref={buttonRef}>
          <Link href="/">
            <motion.button
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium inline-flex items-center gap-2 hover:scale-105 transition-transform"
              whileHover={{ 
                boxShadow: "0 0 20px var(--primary)",
              }}
            >
              <Home className="w-5 h-5" />
              Voltar para Home
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
} 