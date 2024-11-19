"use client";

import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

export const HeroAnimation = ({ theme }: { theme: string }) => {
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

  return (
    <AbsoluteFill
    style={{
      background: `linear-gradient(${gradientProgress}deg, ${gradientColors[0]}, ${gradientColors[1]})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center", // Centraliza verticalmente
      flexDirection: "column",
    }}
  >
 
  
      {/* Container principal */}
      <div
        style={{
          width: "100%",
          maxWidth: "90vw",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Título */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            textAlign: "center",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(5rem, 13vw, 10rem)', // Ajuste mais simples para mobile
              fontWeight: "bold",
              background: `linear-gradient(to right, ${textGradientColors[0]}, ${textGradientColors[1]}, ${textGradientColors[2]})`,
              backgroundSize: "200% 100%",
              backgroundPosition: `${titleGradientPosition}% 0`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              padding: "0.5rem",
              lineHeight: 1.2,
           
            }}
          >
            J.Antunes
          </h1>
        </div>

        {/* Subtítulo */}
        <div
          style={{
            fontSize: 'clamp(5rem, 12vw, 4.5rem)',
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            textAlign: "center",
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: "min(4.5vw, 1.2rem)", // Ajuste mais simples para mobile
              background: `linear-gradient(to right, ${textGradientColors[0]}, ${textGradientColors[1]}, ${textGradientColors[2]})`,
              backgroundSize: "200% 100%",
              backgroundPosition: `${titleGradientPosition}% 0`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 auto",
              maxWidth: "min(90%, 500px)",
              lineHeight: 1.5,
              padding: "0 0.5rem",
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
