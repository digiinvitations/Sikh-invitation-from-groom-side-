import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { WeddingData } from "../types";
import { Users, Heart, Sparkles } from "lucide-react";

interface FamilyDetailsProps {
  data: WeddingData;
}

export function FamilyDetails({ data }: FamilyDetailsProps) {
  const family = data.familyDetails;

  return (
    <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-blush-main via-[#FDF5F6] to-blush-main flex flex-col items-center relative overflow-hidden">
      <div className="w-full max-w-lg flex flex-col items-center">
        
        {/* Sacred Ik Onkar & Heading */}
        <span className="text-2xl text-[#8F1736] font-serif font-bold select-none mb-1">ੴ</span>
        <div className="flex items-center gap-2 text-pink-accent mb-2">
          <Users className="w-5 h-5 text-burgundy" strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl uppercase tracking-widest text-burgundy text-center drop-shadow-sm font-bold">
          With Family Blessings
        </h2>
        <p className="font-serif text-xs uppercase tracking-[0.22em] text-wine-dark/75 mt-1 text-center font-medium">
          Honored Elders &amp; Beloved Family • Sagan &amp; Ring Ceremony Blessings
        </p>

        <HeartDivider />

        {/* Grandparents & Respected Elders Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="w-full mt-6 p-5 sm:p-6 rounded-2xl bg-white/95 border border-pink-border/90 shadow-2xs backdrop-blur-xs flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush-light border border-pink-border text-[10px] sm:text-[10.5px] uppercase tracking-widest font-serif font-bold text-wine-dark mb-3">
            <Sparkles className="w-3 h-3 text-pink-accent" />
            <span>Blessings of Respected Elders</span>
            <Sparkles className="w-3 h-3 text-pink-accent" />
          </div>

          <div className="space-y-3 w-full">
            <div>
              <span className="text-[10.5px] uppercase tracking-widest text-wine-dark/65 font-serif font-semibold block mb-0.5">
                Dada Ji &amp; Dadi Ji (Grandparents)
              </span>
              <p className="font-serif text-lg sm:text-xl font-extrabold text-burgundy tracking-wide leading-snug">
                {family?.groomSide.grandfather || "Late S. Inder Singh Bhusari"} &amp; {family?.groomSide.grandspecialInvitions Sita Rani"}
              </p>
            </div>

            <div className="pt-2 border-t border-pink-border/40">
              <span className="text-[10.5px] uppercase tracking-widest text-wine-dark/65 font-serif font-semibold block mb-0.5">
                Grand Uncle
              </span>
              <p className="font-serif text-base sm:text-lg font-bold text-[#8F1736] tracking-wide">
                {family?.groomSide.grandUncle || "Joginder Singh Bhusari"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Respected Parents Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="w-full mt-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white to-[#FDF4F6] border-2 border-[#D9A6B2]/60 shadow-xs flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8F1736] text-white text-[10.5px] uppercase tracking-widest font-serif font-bold mb-3 shadow-2xs">
            <Heart className="w-3 h-3 fill-current" />
            <span>Respected Parents</span>
            <Heart className="w-3 h-3 fill-current" />
          </div>

          <p className="font-serif text-xl sm:text-2xl font-extrabold text-burgundy tracking-wide leading-snug">
            {family?.groomSide.father || "S. Kuldeep Singh Bhusari"}
          </p>
          <span className="font-script text-2xl text-pink-accent my-0.5">&amp;</span>
          <p className="font-serif text-xl sm:text-2xl font-extrabold text-burgundy tracking-wide leading-snug">
            {family?.groomSide.mother || "Sdn. Ravinder Kaur"}
          </p>
        </motion.div>

        {/* Taya Ji & Tayi Ji */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="w-full mt-4 p-5 rounded-2xl bg-white/95 border border-pink-border/90 shadow-2xs flex flex-col items-center text-center"
        >
          <span className="text-[10px] sm:text-[10.5px] uppercase tracking-widest text-wine-dark/70 font-serif font-bold mb-2">
            Taya Ji &amp; Tayi Ji
          </span>
          <p className="font-serif text-base sm:text-lg font-bold text-burgundy tracking-wide leading-snug">
            Dr. Ranjeet Singh Bhusari &amp; Sdn. Manjeet Kaur
          </p>
        </motion.div>

        {/* Brother & Bhabhi Ji */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full mt-4 p-5 rounded-2xl bg-white/95 border border-pink-border/90 shadow-2xs flex flex-col items-center text-center"
        >
          <span className="text-[10px] sm:text-[10.5px] uppercase tracking-widest text-wine-dark/70 font-serif font-bold mb-2">
            Brother &amp; Sister-in-Law (Bhabhi)
          </span>
          <p className="font-serif text-base sm:text-lg font-bold text-burgundy tracking-wide leading-snug">
            {family?.groomSide.brother || "S. Inderdeep Singh Bhusari"} &amp; {family?.groomSide.brotherWife || "Sdn. Ishavjeet Kaur"}
          </p>
        </motion.div>

        {/* Family Members Doctors Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="w-full mt-4 p-5 rounded-2xl bg-white/95 border border-pink-border/90 shadow-2xs flex flex-col items-center text-center"
        >
          <span className="text-[10px] sm:text-[10.5px] uppercase tracking-widest text-wine-dark/70 font-serif font-bold mb-2">
            With Love &amp; Affection
          </span>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 font-serif text-base sm:text-lg font-bold text-[#8F1736]">
            <span>{family?.groomSide.drTaranpreetSingh || "Dr. Taranpreet Singh Bhusari"}</span>
            <span className="hidden sm:inline text-pink-accent">•</span>
            <span>{family?.groomSide.drHargeetKaur || "Dr. Hargeet Kaur"}</span>
          </div>
        </motion.div>

        {/* Bride's Respected Parents Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full mt-4 p-5 rounded-2xl bg-white/95 border border-pink-border/90 shadow-2xs flex flex-col items-center text-center"
        >
          <span className="text-[10px] sm:text-[10.5px] uppercase tracking-widest text-wine-dark/70 font-serif font-bold mb-1.5">
            Bride&apos;s Respected Parents
          </span>
          <p className="font-serif text-base sm:text-lg font-bold text-burgundy tracking-wide leading-snug">
            {family?.brideSide.father || "S. Paramjeet Singh Gandhi"} &amp; {family?.brideSide.mother || "Sdn. Rupinder Kaur"}
          </p>
        </motion.div>

        {/* Special Invitation Callout */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="w-full mt-5 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-white via-[#FFF5F7] to-white border border-[#D9A6B2] shadow-xs flex flex-col items-center text-center"
        >
          <span className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.22em] text-[#8F1736] font-serif font-extrabold mb-1">
            Special Invitation
          </span>
          <p className="font-serif text-xl sm:text-2xl font-black text-burgundy tracking-wide">
            {family?.Twinklestars || "Tirajveer Singh & Mehrajveer Singh"}
          </p>
        </motion.div>

        {/* Family Name & Regards Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 flex flex-col items-center text-center"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] text-wine-dark/70 font-serif font-semibold mb-1">
            With Love &amp; Regards
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-extrabold text-[#8F1736] tracking-wide">
            {data.familyRegards || "Bhusari Family & Kalra Family"}
          </p>
        </motion.div>

      </div>
    </section>
  );
}