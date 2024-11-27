"use client";

import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { useState, useEffect } from "react";

export const HeroAnimation = ({ theme, width: initialWidth }: { theme: string, width: number }) => {
  const [currentWidth, setCurrentWidth] = useState(initialWidth);

  useEffect(() => {
    const handleResize = () => {
      setCurrentWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial width

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const frame = useCurrentFrame();

  const isDark = theme === "dark";

  // Cores baseadas no tema
  const gradientColors = isDark
    ? ["#1a1a1a", "#2a2a2a"]
    : ["#f5f5f5", "#e5e5e5"];

  const textGradientColors = isDark
    ? ["#ffffff", "#cccccc", "#ffffff"]
    : ["#000000", "#333333", "#000000"];

  const lineColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";

  // Animações
  const gradientProgress = interpolate(frame, [0, 150], [0, 360], {
    extrapolateRight: "clamp",
  });

  const titleGradientPosition = interpolate(
    frame,
    [0, 100],
    [0, 200],
    {
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    }
  );

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleScale = interpolate(frame, [0, 30], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleY = interpolate(frame, [20, 50], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const lineWidth = interpolate(frame, [40, 80], [0, 100], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // Função para calcular tamanhos responsivos
  const getTitleSize = () => {
    if (currentWidth <= 768) {
      return 'clamp(16rem, 35vw, 20rem)';
    }
    return 'clamp(15rem, 15vw, 10rem)';
  };

  const getSubtitleSize = () => {
    if (currentWidth <= 768) {
      return 'clamp(5rem, 8vw, 5rem)';
    }
    return 'clamp(0.3rem, 5vw, 2.5rem)';
  };

  

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientProgress}deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "visible",
        minHeight: "100vh",
      }}
    >
      {/* Container principal - Aqui está a div que precisamos ajustar */}
      <div
        style={{
          width: "100%",
          maxWidth: currentWidth <= 768 ? "900vw" : "90vw", // Ajuste dinâmico baseado na largura
          height: "auto",
          padding: currentWidth <= 768 ? "4rem 1rem" : "1rem",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: currentWidth <= 768 ? "3rem" : "1rem",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          overflow: "visible",
        }}
      >
        {/* Título */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            textAlign: "center",
            width: "100%",
            marginBottom: currentWidth <= 768 ? "2rem" : "1rem",
          }}
        >
          <h1
            style={{
              fontSize: getTitleSize(),
              fontWeight: "bold",
              background: `linear-gradient(to right, ${textGradientColors[0]}, ${textGradientColors[1]}, ${textGradientColors[2]})`,
              backgroundSize: "200% 100%",
              backgroundPosition: `${titleGradientPosition}% 0`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              padding: currentWidth <= 768 ? "1rem" : "0.5rem",
              lineHeight: 1.1,
            }}
          >
            J.Antunes
          </h1>
        </div>

        {/* Subtítulo */}
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            textAlign: "center",
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: getSubtitleSize(),
              background: `linear-gradient(to right, ${textGradientColors[0]}, ${textGradientColors[1]}, ${textGradientColors[2]})`,
              backgroundSize: "200% 100%",
              backgroundPosition: `${titleGradientPosition}% 0`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 auto",
              maxWidth: currentWidth <= 768 ? "100%" : "min(95%, 800px)",
              lineHeight: currentWidth <= 768 ? 1.3 : 1.4,
              padding: currentWidth <= 768 ? "0 0.5rem" : "0 1rem",
            }}
          >
            Elegância em cada detalhe. Transformando momentos especiais com nossa
            coleção premium de toalhas e acessórios.
          </p>
        </div>
      </div>

      {/* Círculos decorativos - Reduzidos e simplificados */}
      {Array.from({ length: 2 }).map((_, i) => {
  const circleOpacity = interpolate(
    frame,
    [60 + i * 10, 90 + i * 10],
    [0, 0.08],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      key={i}
      style={{
        position: "absolute",
        width: `${150 + i * 50}%`, // Aumente o tamanho para cobrir mais área
        height: `${150 + i * 50}%`,
        borderRadius: "50%",
        border: `1px solid ${lineColor}`,
        opacity: circleOpacity,
      }}
    />
  );
})}

    </AbsoluteFill>
  );
};
