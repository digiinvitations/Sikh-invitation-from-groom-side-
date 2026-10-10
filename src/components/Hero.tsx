import { motion } from "motion/react";
import { Heart, ArrowDown } from "lucide-react";
import { WeddingData } from "../types";
import { IkOnkarSymbol } from "./IkOnkarSymbol";
import { useState, useRef, useEffect } from "react";

interface HeroProps {
  data: WeddingData;
  shouldPlayVideo?: boolean;
  onVideoEnd?: () => void;
}

export function Hero({ data, shouldPlayVideo = true, onVideoEnd }: HeroProps) {
  // Full text is immediately visible when entering the website - no delay, no blank screen
  const [showText, setShowText] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ensure instant video playback as soon as component mounts or video is ready
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startPlay = () => {
      video.play().catch(() => {
        // Fallback handled smoothly
      });
    };

    if (shouldPlayVideo) {
      startPlay();
    }

    video.addEventListener("canplay", startPlay);
    video.addEventListener("loadedmetadata", startPlay);

    return () => {
      video.removeEventListener("canplay", startPlay);
      video.removeEventListener("loadedmetadata", startPlay);
    };
  }, [shouldPlayVideo]);

  return (
    <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden bg-white transform-gpu">
      {/* Background Video or Fallback Image */}
      <div className="absolute inset-0 z-0 bg-white">
        {data.heroVideoUrl ? (
          <video
            ref={videoRef}
            data-hero-video="true"
            src={data.heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onEnded={onVideoEnd}
            className="w-full h-full object-cover transform-gpu will-change-transform"
          />
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop')" }}
          />
        )}
        
        {/* Luminous Translucent White Veil - Video stays vividly visible while text is crystal clear */}
        <div className="absolute inset-0 bg-white/45 backdrop-blur-[0.5px]" />

        {/* Soft bottom gradient smoothly transitioning into the next section */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-blush-main via-white/70 to-transparent pointer-events-none z-10" />
      </div>

      {/* Content - 100% visible immediately when entering website */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center w-full max-w-md mx-auto pt-10 pb-6 min-h-[100svh]">
        
        <div className="flex-1 flex flex-col items-center justify-center w-full mt-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            {/* Sacred Sikh Invocation / Background-Removed Religious Logo */}
            <div className="flex flex-col items-center mb-3">
              <IkOnkarSymbol
                customLogoUrl={data.heroLogoUrl}
                className="h-16 md:h-20 w-auto max-w-[200px] object-contain drop-shadow-md select-none pointer-events-none transition-transform duration-300"
              />
              <span className="text-[10px] tracking-[0.25em] uppercase text-wine-dark/85 font-serif mt-1.5 font-bold">
                Ik Onkar • Satgur Prasad
              </span>
            </div>

            {/* Special Invitation Callout - Big & Bold */}
            <div className="mb-2 px-4 py-2.5 rounded-2xl bg-white/95 border border-pink-border/90 shadow-2xs backdrop-blur-xs flex flex-col items-center justify-center text-center">
              <span className="text-[8px] sm:text-[9px] font-serif uppercase tracking-[0.25em] text-wine-dark/75 font-semibold mb-0.5">
                Special Invitation
              </span>
              <span className="text-base sm:text-lg md:text-xl font-serif font-extrabold text-burgundy tracking-wide leading-snug drop-shadow-2xs">
                {data.invitedBy || "Tirajveer Singh & Mehrajveer Singh"}
              </span>
            </div>

            {/* Prominent Ceremony Badge in Hero Section */}
            <div className="mb-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#8F1736] via-[#A91F3D] to-[#8F1736] text-white shadow-xs flex items-center justify-center gap-1.5 ring-2 ring-pink-accent/30">
              <span className="text-[11px] sm:text-xs font-serif font-extrabold uppercase tracking-[0.2em] drop-shadow-xs">
                💍 Sagan &amp; Ring Ceremony 💍
              </span>
            </div>

            <p className="font-serif text-wine-dark text-[14px] sm:text-[15px] italic mb-4 max-w-[320px] leading-relaxed font-normal opacity-95 whitespace-pre-line drop-shadow-2xs">
              {data.heroMessage}
            </p>
            
            <div className="flex items-center justify-center gap-3 opacity-60 mb-5">
              <div className="h-[1px] w-12 bg-wine-dark"></div>
              <Heart className="w-3 h-3 text-wine-dark fill-wine-dark" />
              <div className="h-[1px] w-12 bg-wine-dark"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col items-center justify-center w-full"
          >
            {/* Groom First */}
            <h1 className="font-script text-6xl text-wine-dark drop-shadow-sm leading-none">
              {data.groom.name}
            </h1>
            <div className="font-serif flex flex-col items-center gap-1 mt-2.5 mb-5 text-center px-2">
              <p className="text-sm sm:text-base md:text-[17px] font-bold text-burgundy tracking-wide leading-snug max-w-[340px]">
                {data.groom.parents}
              </p>
              {data.groom.education && <p className="text-xs text-wine-dark/80">{data.groom.education}</p>}
              {data.groom.profession && <p className="text-xs text-wine-dark/80">{data.groom.profession}</p>}
            </div>
            
            <span className="font-script text-3xl text-pink-accent my-1">&amp;</span>
            
            {/* Bride Just Below Groom */}
            <h1 className="font-script text-6xl text-wine-dark drop-shadow-sm leading-none mt-3">
              {data.bride.name}
            </h1>
            <div className="font-serif flex flex-col items-center gap-1 mt-2.5 text-center px-2">
              <p className="text-sm sm:text-base md:text-[17px] font-bold text-burgundy tracking-wide leading-snug max-w-[340px]">
                {data.bride.parents}
              </p>
              {data.bride.education && <p className="text-xs text-wine-dark/80">{data.bride.education}</p>}
              {data.bride.profession && <p className="text-xs text-wine-dark/80">{data.bride.profession}</p>}
            </div>

            {/* Auspicious Ceremony Celebration Callout */}
            <div className="mt-4 px-4 py-1.5 rounded-full bg-white/90 border border-pink-border/80 text-burgundy font-serif text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] shadow-2xs backdrop-blur-xs flex items-center gap-1.5">
              <span>✨</span>
              <span>Ring Ceremony &amp; Sagan Celebration</span>
              <span>✨</span>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-6 flex flex-col items-center"
        >
          <span className="text-[10px] font-serif text-wine-dark uppercase tracking-[0.3em] mb-2 font-semibold">Scroll</span>
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-4 h-4 text-wine-dark" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
