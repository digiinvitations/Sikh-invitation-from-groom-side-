import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { FadeInSection } from "./FadeInSection";
import { EventDetails, TimelineItem } from "../types";
import { Clock, MapPin, CalendarHeart, Calendar, Sparkles } from "lucide-react";

interface TimelineProps {
  events?: EventDetails[];
  timeline?: TimelineItem[];
}

export function Timeline({ events = [], timeline = [] }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Automatic dragging lotus calculation linked to user scroll progress through timeline
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 35%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
    restDelta: 0.001
  });

  // Calculate percentage top position along the timeline track
  const lotusTop = useTransform(smoothProgress, [0, 1], ["2%", "98%"]);

  // Use timeline items if available, else events
  const displayItems = timeline && timeline.length > 0 
    ? timeline 
    : (events && events.length > 0 ? events.map(e => ({
        id: e.id,
        title: e.title,
        date: "Nov 10, 2026",
        time: e.time,
        description: e.description || "Auspicious ceremonial celebrations at River Stone Resort Orchha."
      })) : []);

  if (displayItems.length === 0) return null;

  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-blush-main via-[#FDF5F6] to-blush-main flex flex-col items-center overflow-hidden">
      <FadeInSection className="w-full max-w-3xl flex flex-col items-center">
        <CalendarHeart className="w-7 h-7 text-burgundy mb-3 opacity-90" strokeWidth={1.5} />
        <h2 className="font-serif text-3xl sm:text-4xl uppercase tracking-widest text-burgundy text-center drop-shadow-sm font-bold">
          Program Timeline
        </h2>
        <p className="font-serif text-xs uppercase tracking-[0.2em] text-wine-dark/70 mt-1">
          Sagan &amp; Ring Ceremony Schedule
        </p>
        
        <HeartDivider />

        <div ref={containerRef} className="w-full mt-12 relative pb-8">
          {/* Central Vertical Track Line */}
          <div className="absolute left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-[#D9A6B2]/30 via-[#C9788D] to-[#D9A6B2]/30 transform -translate-x-1/2 rounded-full" />

          {/* Automatic Dragging Lotus 🪷 on Scroll */}
          <motion.div
            style={{ top: lotusTop }}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center justify-center filter drop-shadow-md"
          >
            <motion.div 
              animate={{ rotate: [-6, 6, -6], scale: [1, 1.06, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 border-2 border-burgundy shadow-lg flex items-center justify-center text-xl sm:text-2xl ring-4 ring-pink-accent/30 backdrop-blur-xs select-none"
            >
              🪷
            </motion.div>
            <span className="text-[8.5px] uppercase tracking-widest font-serif font-extrabold text-burgundy bg-white/95 px-2 py-0.5 rounded-full border border-pink-border/80 shadow-2xs mt-1 whitespace-nowrap">
              Auspicious Schedule
            </span>
          </motion.div>

          {/* Timeline Milestones */}
          {displayItems.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <FadeInSection 
                key={item.id || index}
                delay={index * 90}
                threshold={0.12}
                rootMargin="0px 0px -40px 0px"
                className={`mb-12 relative w-full flex flex-row items-center ${isEven ? 'justify-start' : 'justify-end'}`}
              >
                {/* Node Milestone Indicator */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-white border-2 border-pink-accent shadow-xs z-10 text-[11px] font-bold text-burgundy font-serif">
                  {index + 1}
                </div>
                
                {/* Content Card */}
                <div className={`w-[46%] sm:w-[44%] ${isEven ? 'pr-3 sm:pr-8 text-right' : 'pl-3 sm:pl-8 text-left'} relative z-0`}>
                  <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-pink-border/80 shadow-xs hover:shadow-md transition-shadow relative">
                    
                    <span className="text-[10px] uppercase tracking-widest font-serif font-bold text-pink-accent block mb-1">
                      Milestone {index + 1}
                    </span>

                    <h3 className="font-serif font-bold text-lg sm:text-xl text-burgundy mb-2 leading-snug">
                      {item.title}
                    </h3>
                    
                    {/* Systematic Date & Auspicious Time Badges */}
                    <div className={`flex flex-col gap-1.5 mb-2.5 ${isEven ? 'items-end' : 'items-start'}`}>
                      <div className={`flex flex-wrap gap-2 items-center ${isEven ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-burgundy font-bold font-serif text-xs sm:text-[13px] tracking-wide flex items-center gap-1 bg-blush-light px-2.5 py-0.5 rounded-full border border-pink-border/60">
                          <Calendar className="w-3.5 h-3.5 text-pink-accent" />
                          <span>{item.date || "Nov 10, 2026"}</span>
                        </span>
                        
                        <span className="text-[#8F1736] font-extrabold font-serif text-xs sm:text-[13px] tracking-wide flex items-center gap-1 bg-[#8F1736]/10 px-2.5 py-0.5 rounded-full border border-[#8F1736]/20">
                          <Clock className="w-3.5 h-3.5 text-pink-accent" />
                          <span>{item.time}</span>
                        </span>
                      </div>

                      <p className="text-wine-dark/75 font-medium font-serif text-[11px] tracking-wider flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-pink-accent flex-shrink-0" />
                        <span>River Stone Resort Orchha</span>
                      </p>
                    </div>

                    {item.description && (
                      <p className="text-xs sm:text-[13px] text-text-body font-serif italic leading-relaxed pt-2 border-t border-pink-border/40">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </FadeInSection>
            );
          })}
        </div>
      </FadeInSection>
    </section>
  );
}
