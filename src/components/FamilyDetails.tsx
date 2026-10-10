import React from "react";
import { WeddingData } from "../types";
import { HeartDivider } from "./HeartDivider";
import { Users, Heart, Sparkles } from "lucide-react";

interface FamilyBlessingsProps {
  data: WeddingData;
}

export function FamilyBlessings({ data }: FamilyBlessingsProps) {
  return (
    <section className="py-16 px-5 bg-gradient-to-b from-[#FFFDF9] via-blush-light to-[#FDF5F6] flex flex-col items-center text-center relative overflow-hidden border-y border-amber-200/50">
      {/* Decorative Golden Ambient Accent */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-200/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-pink-200/25 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto relative z-10 flex flex-col items-center">
        {/* Sacred Ik Onkar Symbol */}
        <span className="text-3xl text-wine-dark font-serif font-bold select-none mb-1">ੴ</span>

        {/* Big & Slightly Bold Heading as requested */}
        <h2 className="font-script text-5xl sm:text-6xl text-wine-dark font-bold drop-shadow-xs tracking-wide mt-1">
          Family Blessings
        </h2>
        
        <p className="font-serif text-sm sm:text-base font-bold text-burgundy tracking-[0.2em] uppercase mt-1">
          Cordial Invitation &amp; Family Honors
        </p>

        <HeartDivider />

        {/* Complete Family Names & Blessings Card */}
        <div className="w-full mt-6 p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#FFFDF8] via-white to-[#FDF7F8] border border-amber-200/90 shadow-sm text-center">
          
          {/* Special Invitation */}
          <div className="mb-5 pb-4 border-b border-amber-100/90">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest font-serif font-bold text-wine-dark/70 block mb-1">
              Special Invitation
            </span>
            <p className="font-serif font-extrabold text-lg sm:text-xl text-burgundy tracking-wide">
              S. Kuldeep Singh Bhusari &amp; Sdn. Ravinder Kaur
            </p>
          </div>

          {/* Grandparents & Elders */}
          <div className="mb-5 pb-4 border-b border-amber-100/90 space-y-1">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest font-serif font-bold text-wine-dark/70 block">
              Respected Grandparents &amp; Elders
            </span>
            <p className="font-serif font-bold text-base sm:text-lg text-wine-dark">
             Late S. Inder Singh Bhusari &amp; Late Sita Rani
            </p>
            <p className="font-serif text-sm sm:text-base text-wine-dark/90 font-medium">
              Grand Uncle: <strong className="text-wine-dark font-bold">Joginder Singh Bhusari</strong>
            </p>
          </div>

          {/* Twinkle Stars of Family */}
          <div className="mb-5 pb-4 border-b border-amber-100/90 space-y-1">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest font-serif font-bold text-wine-dark/70 block">
              Twinkle Stars of Family
            </span>
            <p className="font-serif font-bold text-base sm:text-lg text-wine-dark">
              Tirajveer Singh &amp; Mehrajveer Singh
            </p>
          </div>

          {/* Brother & Sister-in-law */}
          <div className="mb-5 pb-4 border-b border-amber-100/90 space-y-1">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest font-serif font-bold text-wine-dark/70 block">
              Brother &amp; Sister-in-law (Bhabhi Ji)
            </span>
            <p className="font-serif font-bold text-base sm:text-lg text-wine-dark">
              S. Inderdeep Singh Bhusari &amp; Sdn. Ishavjeet Kaur
            </p>
          </div>

          {/* Taya Ji & Tayi Ji & Family */}
          <div className="mb-5 pb-4 border-b border-amber-100/90 space-y-1">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest font-serif font-bold text-wine-dark/70 block">
              Respected Elders &amp; Family
            </span>
            <p className="font-serif font-bold text-sm sm:text-base text-wine-dark">
              Dr. Ranjeet Singh Bhusari (Taya Ji) &amp; Sdn. Manjeet Kaur (Tayi Ji)
            </p>
            <p className="font-serif text-sm sm:text-base text-wine-dark/90 font-medium">
              Dr. Taranpreet Singh Bhusari &amp; Dr. Hargeet Kaur
            </p>
          </div>

          {/* Bride Side Family */}
          <div className="mb-4 space-y-1">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest font-serif font-bold text-wine-dark/70 block">
              Bride Side Respected Family
            </span>
            <p className="font-serif font-bold text-sm sm:text-base text-wine-dark">
              S. Paramjeet Singh Gandhi &amp; Sdn. Rupinder Kaur
            </p>
          </div>

          {/* Closing regards */}
          <div className="mt-5 pt-4 border-t border-amber-200/80">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-serif font-bold text-wine-dark/60 block mb-0.5">
              With Warm Compliments
            </span>
            <p className="font-serif font-bold text-base text-burgundy">
              Bhusari Family &amp; Kalra Family 
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}