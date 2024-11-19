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

export default function Home() {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { theme } = useTheme();
  const [compositionSize, setCompositionSize] = useState({
    width: 1920,
    height: 1080,
  });

  useEffect(() => {
    const updateCompositionSize = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      const baseWidth = 1920;
      const baseHeight = 1080;

      if (aspectRatio < baseWidth / baseHeight) {
        // Tela mais alta que a composição
        setCompositionSize({
          width: baseWidth,
          height: baseWidth / aspectRatio,
        });
      } else {
        // Tela mais larga ou igual à composição
        setCompositionSize({
          width: baseHeight * aspectRatio,
          height: baseHeight,
        });
      }
    };

    updateCompositionSize();
    window.addEventListener("resize", updateCompositionSize);

    return () => {
      window.removeEventListener("resize", updateCompositionSize);
    };
  }, []);
  return (
    <div className="w-full">
      {/* Seção Hero */}
    
<motion.section
  ref={heroRef}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative h-screen w-full flex items-center justify-center overflow-hidden"
  >
  <div className="absolute inset-0 w-full h-full overflow-hidden">
  <div className="absolute inset-0">
  <Player
  component={HeroAnimation}
  durationInFrames={300}
  compositionWidth={1920}
  compositionHeight={1080}
  fps={30}
  style={{
    width: '100%',
    height: '100%',
  }}
  loop
  autoPlay

  inputProps={{ theme: theme || '' }}
/>

  </div>
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
