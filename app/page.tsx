"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Player } from "@remotion/player";
import { HeroAnimation } from "@/components/hero-animation";
import { ProductShowcase } from "@/components/product-showcase";
import { Features } from "@/components/features";
import { Testimonials } from "@/components/testimonials";
import { Contact } from "@/components/contact";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function Home() {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [compositionSize, setCompositionSize] = useState({
    width: 1920,
    height: 1080,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateCompositionSize = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      const baseWidth = 1920;
      const baseHeight = 1080;

      if (aspectRatio < baseWidth / baseHeight) {
        setCompositionSize({
          width: Math.round(baseWidth),
          height: Math.round(baseWidth / aspectRatio),
        });
      } else {
        setCompositionSize({
          width: Math.round(baseHeight * aspectRatio),
          height: Math.round(baseHeight),
        });
      }
    };

    updateCompositionSize();
    window.addEventListener("resize", updateCompositionSize);

    return () => {
      window.removeEventListener("resize", updateCompositionSize);
    };
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full overflow-x-hidden">
      <WhatsAppButton />
      {/* Seção Hero */}
    
<motion.section
  ref={heroRef}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative h-[100svh] w-full flex items-center justify-center overflow-hidden"
  >
  <div className="absolute inset-0">
  <Player
  key={currentTheme}
  component={HeroAnimation}
  durationInFrames={300}
  compositionWidth={compositionSize.width}
  compositionHeight={compositionSize.height}
  fps={30}
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }}
  loop
  autoPlay

  inputProps={{ 
    theme: currentTheme || '',
    width: 1920
  }}
/>

  </div>
</motion.section>


      {/* Seções adicionais */}
      <ProductShowcase />
      <Features />
      <Testimonials />
      <Contact />
    </div>
  );
}
