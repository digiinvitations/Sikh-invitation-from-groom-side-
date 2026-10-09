import { useEffect, useRef } from "react";
import { Heart, Instagram, Settings, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { WeddingData } from "../types";

interface FooterProps {
  data: WeddingData;
}

export function Footer({ data }: FooterProps) {
  const hasCelebratedRef = useRef(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = footerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasCelebratedRef.current) {
          hasCelebratedRef.current = true;
          confetti({
            particleCount: 80,
            spread: 75,
            origin: { y: 0.88 },
            colors: ['#D4AF37', '#8F1736', '#D995A5', '#F4C2C2', '#FFFFFF'],
            disableForReducedMotion: true,
            zIndex: 9999,
          });
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="py-12 bg-blush-light border-t border-pink-border flex flex-col items-center text-center px-4 relative overflow-hidden">
      <div className="mb-4 flex flex-col items-center">
        <span className="font-serif text-[11px] uppercase tracking-[0.25em] text-wine-dark/70 font-semibold mb-1">
          Love &amp; Regards
        </span>
        <h4 className="font-serif text-2xl font-bold text-wine-dark tracking-wide">
          {data.familyRegards || "Bhusari Family"}
        </h4>
      </div>

      <h5 className="font-script text-2xl text-wine-dark mb-3">
        {data.groom.name} &amp; {data.bride.name}
      </h5>
      
      <div className="flex items-center gap-2 opacity-60 mb-8">
        <div className="w-8 h-[1px] bg-wine-dark"></div>
        <Heart className="w-3 h-3 text-wine-dark fill-wine-dark" />
        <div className="w-8 h-[1px] bg-wine-dark"></div>
      </div>
      
      {/* Direct Contact Advertisement Card for digiinvitations_ */}
      <div className="w-full max-w-sm mt-6 p-5 sm:p-6 rounded-2xl bg-white/95 border border-pink-border/90 shadow-sm backdrop-blur-xs flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Decorative Top Accent Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush-light border border-pink-border/80 text-[10px] sm:text-[10.5px] uppercase tracking-widest font-serif font-bold text-wine-dark mb-2.5">
          <Sparkles className="w-3 h-3 text-pink-accent" />
          <span>Create Your Digital Invitation</span>
          <Sparkles className="w-3 h-3 text-pink-accent" />
        </div>

        <h4 className="font-serif text-base sm:text-lg font-bold text-burgundy tracking-wide leading-snug">
          Want a Custom E-Card Website for Your Event?
        </h4>
        
        <p className="text-xs font-serif text-wine-dark/75 mt-1 mb-4 leading-relaxed">
          Get your interactive invitation with music, RSVP, countdown &amp; scratch card.
        </p>

        {/* Action Buttons: WhatsApp & Instagram */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {/* Direct WhatsApp Chat Action */}
          <a
            href={`https://wa.me/919456411569?text=${encodeURIComponent("Hello Digi Invitations! I would like to create a custom digital invitation website like this.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-2.5 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-sans text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Chat directly on WhatsApp: +91 9456411569"
          >
            {/* Authentic WhatsApp SVG Icon */}
            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.414z" />
            </svg>
            <span>WhatsApp Us</span>
          </a>

          {/* Direct Instagram Profile Action */}
          <a
            href="https://www.instagram.com/digiinvitations_?igsi=MWh1ZnZhMm1xNnNkdw=="
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white font-sans text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Follow on Instagram: @digiinvitations_"
          >
            <Instagram className="w-4 h-4 flex-shrink-0" />
            <span>@digiinvitations_</span>
          </a>
        </div>

        {/* Required advertisement text */}
        <div className="mt-3.5 pt-3 border-t border-pink-border/50 w-full flex flex-col items-center text-center font-serif text-wine-dark/85">
          <p className="text-[11.5px] font-bold tracking-wider uppercase">
            To Create Yours Contact: <a href="tel:9456411569" className="text-burgundy hover:underline font-extrabold">+91 9456411569</a>
          </p>
          <p className="text-[10px] tracking-widest font-semibold opacity-70 mt-0.5 uppercase">
            Created with ❤️ by digiinvitations_
          </p>
        </div>
      </div>

      <Link 
        to="/admin" 
        className="absolute bottom-4 right-4 opacity-10 hover:opacity-100 transition-opacity p-2 text-wine-dark"
        title="Admin Panel"
      >
        <Settings className="w-4 h-4" />
      </Link>
    </footer>
  );
}
