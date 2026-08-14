"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { CatalogoPreview } from "@/components/home/catalogo-preview";
import { Features } from "@/components/home/features";
import { Testimonials } from "@/components/home/testimonials";
import { Button } from "@/components/ui/button";
import { CONTATO } from "@/lib/constants";
import { useEffect, useState } from "react";

// Curadoria do cliente (4 vídeos do Pexels, licença livre p/ uso
// comercial). URLs resolvidas manualmente com curl a partir dos links
// de download (`pexels.com/pt-br/download/video/{id}/`, que fazem 302
// pro CDN de vídeo de verdade) — usei aqui direto a URL final do CDN
// pra não depender do redirect em produção. Nos vídeos #8247208 e
// #20203976 troquei pela variante 1280x720 (mesmo conteúdo, arquivo
// bem mais leve — o #20203976 original era 4K/10,6MB, inviável pra
// carregar 4 vídeos ao mesmo tempo); os outros dois só tinham a
// variante 1920x1080 disponível.
//
// Nota: o vídeo #8247208 tem taças de vinho vazias visíveis no quadro
// (mesa posta) — mantive porque agora é escolha explícita sua, não
// mais uma busca minha; só deixando registrado caso não tenha reparado.
//
// `position`: object-position usado só no mobile (crop vertical mais
// agressivo que no desktop — ver className da tag <video> abaixo).
// Defini olhando o frame de cada vídeo (baixei o thumbnail de cada um
// antes de decidir), exceto o #20203976 — a página dele ficou atrás do
// bloqueio anti-bot do Pexels nas minhas tentativas, então o `object-center`
// dele é um chute honesto, não uma posição conferida visualmente. Se no
// mobile a toalha desse vídeo específico sumir do crop, é o primeiro
// candidato a ajustar.
const HERO_VIDEOS = [
  {
    // Mesa redonda posta, levemente à direita do centro do quadro (cadeiras
    // ocupam a esquerda) — puxa o foco pra direita no crop vertical.
    src: "https://videos.pexels.com/video-files/8247208/8247208-hd_1280_720_25fps.mp4",
    position: "object-[65%_center]",
  },
  {
    // Mesa longa em diagonal, começa mais cheia/próxima à esquerda do
    // quadro e se afasta pra direita — puxa o foco pra esquerda.
    src: "https://videos.pexels.com/video-files/28572592/12423709_1920_1080_25fps.mp4",
    position: "object-[40%_center]",
  },
  {
    // Não verificado visualmente (página bloqueada) — default seguro.
    src: "https://videos.pexels.com/video-files/20203976/20203976-hd_1280_720_30fps.mp4",
    position: "object-center",
  },
  {
    // Tecido preto em close-up preenchendo o quadro inteiro — sem um
    // "assunto" fora do centro pra perseguir, centro já funciona bem.
    src: "https://videos.pexels.com/video-files/7677321/7677321-hd_1920_1080_25fps.mp4",
    position: "object-center",
  },
];

const HERO_VIDEO_INTERVAL_MS = 8000;

export default function Home() {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
    }, HERO_VIDEO_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const scrollToCatalogo = () => {
    const el = document.getElementById("catalogo");
    if (!el) return;
    // Offset manual em vez de scrollIntoView puro: a Navigation é fixed
    // (~64px), então scrollIntoView sozinho deixaria o topo da seção
    // escondido atrás do header.
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Seção Hero — 80vh no desktop (não 100vh, inalterado), 60vh no
          mobile (era 88svh — o crop vertical agressivo do object-cover
          num vídeo horizontal cortava a mesa/toalha; menos altura =
          menos crop de largura pra cobrir). Full-bleed (w-full, sem
          container/max-w). Fundo é um carrossel de 4 vídeos com
          crossfade (curadoria do cliente) — todos ficam montados e
          tocando o tempo todo (autoPlay/loop em cada um), só a opacidade
          alterna a cada 8s. É crossfade, não troca de `src`: nunca existe
          um instante sem nenhum vídeo visível, então não pisca tela preta
          entre um clipe e outro. Texto e CTAs em HTML real, z-10, imunes
          à transição (ficam numa camada acima, sempre com opacity-100). */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative flex h-[60vh] w-full items-center justify-center overflow-hidden md:h-[80vh]"
      >
        {HERO_VIDEOS.map((video, index) => (
          <video
            key={video.src}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-1000 ${video.position} md:object-center ${
              index === currentVideoIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src={video.src} type="video/mp4" />
          </video>
        ))}

        {/* Overlay — contraste do texto branco por cima de qualquer um
            dos 4 vídeos, sempre na mesma camada (-z-10), acima dos
            vídeos (-z-20) e abaixo do texto (z-10). */}
        <div className="absolute inset-0 -z-10 bg-black/50" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 mx-auto max-w-3xl px-4 text-center text-white"
        >
          <h1 className="text-5xl font-bold drop-shadow-lg md:text-7xl">J.Antunes</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90 drop-shadow md:text-xl">
            Locação de toalhas e artigos decorativos para festas e eventos. Solicite um
            orçamento agora e transforme seu evento.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={scrollToCatalogo} className="group w-full sm:w-auto">
              Ver Produtos
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-white/60 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:w-auto"
              onClick={() =>
                window.open(
                  `https://wa.me/${CONTATO.whatsapp}?text=Olá! Gostaria de mais informações.`,
                  "_blank"
                )
              }
            >
              <FaWhatsapp className="mr-2 h-5 w-5" />
              Falar no WhatsApp
            </Button>
          </div>
        </motion.div>
      </motion.section>

      {/* Seções adicionais — o formulário de "Entre em Contato" saiu daqui
          de propósito (Fase 7): duplicava /contato e alongava a rolagem
          sem necessidade. */}
      <CatalogoPreview />
      <Features />
      <Testimonials />
    </div>
  );
}
