import { HeartDivider } from "./HeartDivider";
import { FadeInSection } from "./FadeInSection";
import { VenueDetails } from "../types";
import { MapPin } from "lucide-react";

interface VenueProps {
  venue: VenueDetails;
}

export function Venue({ venue }: VenueProps) {
  return (
    <section className="py-16 px-6 bg-blush-light flex flex-col items-center overflow-hidden">
      <FadeInSection className="w-full max-w-md flex flex-col items-center text-center relative">
        <MapPin className="w-6 h-6 text-wine-dark mb-4 opacity-80" strokeWidth={1.5} />
        <h2 className="font-script text-4xl text-wine-dark">
          Venue
        </h2>
        
        <HeartDivider />

        <FadeInSection delay={100} className="mt-4 w-full flex flex-col items-center relative z-10 gap-4">
          <span className="text-2xl text-wine-dark font-serif font-bold mb-1 select-none">ੴ</span>
          
          {/* Main Ceremony Venue Card */}
          <div className="w-full p-6 rounded-2xl bg-white/95 border border-pink-border/90 shadow-2xs text-center flex flex-col items-center">
            <span className="text-[10.5px] font-serif uppercase tracking-[0.2em] text-[#A92543] font-bold mb-1.5">
              Sagan &amp; Ring Ceremony Venue
            </span>
            <h3 className="font-serif font-bold text-2xl text-burgundy mb-1">
              River Stone Resort Orchha
            </h3>
            <p className="text-text-body text-xs sm:text-sm opacity-85 max-w-[280px] leading-relaxed">
              {venue.addressLine1}
              {venue.addressLine2 && <><br />{venue.addressLine2}</>}
            </p>
            <a 
              href={venue.mapUrl || "https://maps.app.goo.gl/9gwG8qpYAZz97mko8?g_st=ac"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-burgundy hover:bg-wine-dark text-white text-xs font-serif font-semibold tracking-wider uppercase transition-all shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Get Resort Directions</span>
            </a>
          </div>

          {/* Celebratory Hospitality Card */}
          <div className="w-full p-5 rounded-2xl bg-white/80 border border-pink-border/80 shadow-2xs text-center flex flex-col items-center">
            <span className="text-[10px] font-serif uppercase tracking-widest text-wine-dark/70 font-semibold mb-2">
              Ceremonial Details &amp; Hospitality
            </span>
            <p className="text-xs text-wine-dark/90 font-serif leading-relaxed italic max-w-xs">
              We look forward to welcoming you for an enchanting evening filled with traditional Sagan blessings, joyful ring exchange, royal banquet, and celebratory music by the Betwa river.
            </p>
          </div>
        </FadeInSection>

        {/* Gurudwara Sahib Silhouette / Line Art */}
        <FadeInSection delay={150} className="w-full max-w-[280px] h-28 mt-8 mb-6 opacity-30 flex items-end justify-center pointer-events-none">
          <svg viewBox="0 0 200 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-wine-dark" strokeWidth="1.2">
            {/* Central Dome */}
            <path d="M100 8 C92 20 82 28 82 46 V85 H118 V46 C118 28 108 20 100 8 Z" />
            <path d="M100 8 V2" />
            {/* Nishan Sahib pole & flag */}
            <line x1="100" y1="2" x2="100" y2="-6" strokeWidth="1.5" />
            <polygon points="100,-6 108,-1 100,4" fill="currentColor" strokeWidth="0" />
            <circle cx="100" cy="8" r="2.5" />
            {/* Kalasa finials */}
            <circle cx="100" cy="2" r="1.5" />
            
            {/* Left Pavilion Dome */}
            <path d="M50 35 C44 43 38 48 38 58 V85 H62 V58 C62 48 56 43 50 35 Z" />
            <line x1="50" y1="35" x2="50" y2="30" />
            <circle cx="50" cy="30" r="1.2" />

            {/* Right Pavilion Dome */}
            <path d="M150 35 C144 43 138 48 138 58 V85 H162 V58 C162 48 156 43 150 35 Z" />
            <line x1="150" y1="35" x2="150" y2="30" />
            <circle cx="150" cy="30" r="1.2" />

            {/* Central Arch Door */}
            <path d="M92 85 V62 C92 57 96 53 100 53 C104 53 108 57 108 62 V85" />

            {/* Base platform */}
            <line x1="15" y1="85" x2="185" y2="85" strokeWidth="1.5" />
            <line x1="5" y1="89" x2="195" y2="89" strokeWidth="1" />
          </svg>
        </FadeInSection>

        {/* Celebration Hospitality & Guidelines */}
        <FadeInSection delay={200} className="w-full max-w-sm my-6 p-5 rounded-2xl bg-white/85 border border-pink-border/80 shadow-xs text-left">
          <h4 className="font-serif font-bold text-xs uppercase tracking-[0.18em] text-wine-dark text-center mb-3.5 flex items-center justify-center gap-2">
            <span>ੴ</span> Celebration Guidelines &amp; Hospitality <span>ੴ</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-text-body font-serif leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-sm leading-none mt-0.5">💍</span>
              <span><strong>Auspicious Event:</strong> Sagan &amp; Ring Ceremony starting promptly at 8:00 PM with traditional blessings and ring exchange.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-sm leading-none mt-0.5">👔</span>
              <span><strong>Dress Code:</strong> Festive Traditional / Indo-Western Celebration Attire.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-sm leading-none mt-0.5">🍽️</span>
              <span><strong>Royal Banquet:</strong> Grand celebratory dinner and beverages following the ring ceremony.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-sm leading-none mt-0.5">🚗</span>
              <span><strong>Valet &amp; Parking:</strong> Convenient valet parking available at the River Stone Resort entrance.</span>
            </li>
          </ul>
        </FadeInSection>

        <FadeInSection delay={250} className="w-full flex justify-center">
          <a 
            href={venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-burgundy text-white px-8 py-3 rounded-full font-serif text-xs uppercase tracking-widest shadow-md hover:bg-wine-dark transition-colors active:scale-95 mt-2 inline-block"
          >
            View on Google Maps
          </a>
        </FadeInSection>

      </FadeInSection>
    </section>
  );
}
