"use client";

import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export const HeroAnimation = ({ theme, width: initialWidth }: { theme: string; width: number }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [gradientKey, setGradientKey] = useState(0);
  const toalhaRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (toalhaRef.current) {
      gsap.set(toalhaRef.current, {
        scaleY: 0.3,
        scaleX: 0.8,
        rotation: -25,
        transformOrigin: "right top",
        x: 100,
        y: -50
      });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" }
      });

      tl.to(toalhaRef.current, {
        scaleY: 1,
        scaleX: 1,
        rotation: -5,
        x: 0,
        y: 0,
        duration: 1.2,
        ease: "power2.inOut"
      })
      .to(toalhaRef.current, {
        rotation: 0,
        duration: 0.8,
        ease: "elastic.out(0.8, 0.3)"
      }, "-=0.3")
      .to(toalhaRef.current, {
        scaleY: 0.98,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      }, "-=0.4");

      gsap.to(toalhaRef.current, {
        rotation: -2,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }
  }, []);

  const frame = useCurrentFrame();
  const isDark = theme === "dark";

  const gradientColors = isDark
    ? ["#1a1a1a", "#2a2a2a"]
    : ["#ffffff", "#e0e0e0"];

  const gradientProgress = interpolate(
    frame,
    [0, 150],
    [0, 360],
    {
      extrapolateRight: "extend",
      easing: Easing.inOut(Easing.quad),
    }
  );

  const titleGradientPosition = interpolate(
    frame,
    [0, 100],
    [0, 100],
    {
      extrapolateRight: "extend",
      easing: Easing.inOut(Easing.quad),
    }
  );

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleScale = interpolate(
    frame,
    [0, 30],
    [0.95, 1],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleY = interpolate(
    frame,
    [20, 50],
    [10, 0],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const getTitleSize = () => {
    if (isMobile) {
      return "clamp(16rem, 35vw, 20rem)";
    }
    return "clamp(15rem, 15vw, 10rem)";
  };

  const getSubtitleSize = () => {
    if (isMobile) {
      return "clamp(5rem, 8vw, 5rem)";
    }
    return "clamp(0.3rem, 5vw, 2.5rem)";
  };

  const textGradient = theme === "dark"
    ? "linear-gradient(to right, #ffffff, #cccccc, #ffffff)"
    : "linear-gradient(to right, #000000, #333333, #000000)";

  const h1Style = {
    fontSize: getTitleSize(),
    fontWeight: "bold",
    background: textGradient,
    backgroundSize: "300% 100%",
    backgroundPosition: `${titleGradientPosition}% 0`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    lineHeight: 1.1,
    transition: "background 0.3s ease",
    filter: isDark ? "none" : "contrast(1.5)",
  };

  const pStyle = {
    fontSize: getSubtitleSize(),
    background: textGradient,
    backgroundSize: "300% 100%",
    backgroundPosition: `${titleGradientPosition}% 0`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 auto",
    maxWidth: isMobile ? "100%" : "min(95%, 800px)",
    lineHeight: isMobile ? 1.3 : 1.4,
    transition: "background 0.3s ease",
    filter: isDark ? "none" : "contrast(1.5)",
  };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientProgress}deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "300vw",
          padding: isMobile ? "4rem 1rem" : "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ position: "relative" }}>
          <svg
            ref={toalhaRef}
            width="200"
            height="300"
            viewBox="0 0 200 300"
            style={{
              position: "absolute",
              right: "-1%",
              top: "30%",
              transform: "translateY(-50%)",
              zIndex: 1,
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden"
            }}
          >
            <defs>
              <linearGradient id="red-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: isDark ? "#ff4d4d" : "#ff6666", stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: isDark ? "#ff3333" : "#ff4d4d", stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: isDark ? "#cc0000" : "#ff3333", stopOpacity: 1}} />
              </linearGradient>
              
              <linearGradient id="fold-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: "#000000", stopOpacity: 0.2}} />
                <stop offset="50%" style={{stopColor: "#000000", stopOpacity: 0}} />
                <stop offset="100%" style={{stopColor: "#000000", stopOpacity: 0.2}} />
              </linearGradient>
            </defs>

            <path 
              d="M40,50 
                 C45,45 55,40 70,45
                 C85,50 95,45 110,50
                 C125,45 135,50 150,45
                 C165,40 175,45 180,50
                 
                 L185,200
                 
                 C180,205 175,210 170,205
                 Q160,200 150,205
                 Q140,210 130,205
                 Q120,200 110,205
                 Q100,210 90,205
                 Q80,200 70,205
                 Q60,210 50,205
                 C45,200 40,205 35,200
                 
                 L40,50"
              fill="url(#red-gradient)"
              filter="drop-shadow(3px 3px 5px rgba(0,0,0,0.2))"
            />

            <path
              d="M35,210
                 Q45,200 55,210
                 Q65,220 75,210
                 Q85,200 95,210
                 Q105,220 115,210
                 Q125,200 135,210
                 Q145,220 155,210
                 Q165,200 175,110"
              fill="none"
              stroke="url(#fold-shadow)"
              strokeWidth="2"
              opacity="0.4"
            />

            <path
              d="M35,230
                 Q45,220 55,230
                 Q65,240 75,230
                 Q85,220 95,230
                 Q105,240 115,230
                 Q125,220 135,230
                 Q145,240 155,230
                 Q165,220 175,230"
              fill="none"
              stroke="url(#fold-shadow)"
              strokeWidth="2"
              opacity="0.5"
            />

            <path
              d="M35,250
                 Q45,240 55,250
                 Q65,260 75,250
                 Q85,240 95,250
                 Q105,260 115,250
                 Q125,240 135,250
                 Q145,260 155,250
                 Q165,240 175,250"
              fill="none"
              stroke="url(#fold-shadow)"
              strokeWidth="2"
              opacity="0.6"
            />

            <path
              d="M70,60
                 C73,90 73,120 70,150
                 C68,180 68,210 70,240"
              fill="none"
              stroke="url(#fold-shadow)"
              strokeWidth="1.5"
              opacity="0.3"
            />

            <path
              d="M100,60
                 C103,90 103,120 100,150
                 C98,180 98,210 100,240"
              fill="none"
              stroke="url(#fold-shadow)"
              strokeWidth="1.5"
              opacity="0.3"
            />

            <path
              d="M130,60
                 C133,90 133,120 130,150
                 C128,180 128,210 130,240"
              fill="none"
              stroke="url(#fold-shadow)"
              strokeWidth="1.5"
              opacity="0.3"
            />

            <path
              d="M40,100
                 C960,95 100,95 140,100
                 C160,102 180,100 185,98"
              fill="none"
              stroke="url(#fold-shadow)"
              strokeWidth="1.5"
              opacity="0.3"
            />

            <path
              d="M35,150
                 C55,145 95,145 135,150
                 C155,152 175,150 180,148"
              fill="none"
              stroke="url(#fold-shadow)"
              strokeWidth="1.5"
              opacity="0.3"
            />
          </svg>
          

          <div
            style={{
              opacity: titleOpacity,
              transform: `scale(${titleScale})`,
              textAlign: "center",
              width: "100%",
              position: "relative",
              zIndex: 2,
            }}
          >
            <h1
              key={gradientKey}
              style={h1Style}
            >
              J.Antunes
            </h1>
          </div>
        </div>

        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            textAlign: "center",
            width: "100%",
          }}
        >
          <p
            key={gradientKey}
            style={pStyle}
          >
            Elegância em cada detalhe. Transformando momentos especiais com nossa
            coleção premium de toalhas e acessórios.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
