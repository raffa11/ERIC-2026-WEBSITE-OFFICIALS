/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import NetworkBackground from './NetworkBackground';
import { Shield, ArrowDown, Radio, Award, Compass, Sparkles, Send } from 'lucide-react';

export default function Hero() {
  const { t } = useLanguage();

  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="hero-section" className="relative min-h-dvh bg-[#050505] flex flex-col justify-between pt-28 pb-12 overflow-hidden">

      {/* Real-time Dynamic Cybernetic Canvas Network Background */}
      <NetworkBackground />

      {/* Extreme ambient laser light flares in corners */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#0047AB]/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-gradient-to-b from-[#FFD700]/5 to-transparent blur-[130px] pointer-events-none" />

      {/* Luxury digital scanner overlays (Apple Keynote visual) */}
      <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[150px] bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 w-full grow flex flex-col justify-center relative z-10 select-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">

          {/* LEFT: Mirroring Lando Norris Next-Race Widgets (Gamer telemetry) */}
          <div className="lg:col-span-3 hidden lg:flex flex-col gap-6">

            {/* Heat Info Card */}
            <motion.div
              id="hero-widget-heats"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-black/75 backdrop-blur-md border-l-2 border-[#FFD700] border-y border-r border-white/5 p-4 rounded-r-xl max-w-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-3.5 h-3.5 text-[#FFD700] animate-pulse" />
                <span className="text-[10px] font-mono text-[#FFD700] tracking-widest uppercase">
                  {t('Location', 'Lokasi')}
                </span>
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-2">
                <span className="text-white font-bold">
                  {t('Campus A UNJ, JAKARTA, IND', 'Kampus A UNJ, JAKARTA TIMUR')}</span>
              </div>
            </motion.div>

            {/* Prize pool card */}
            <motion.div
              id="hero-widget-prize"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="bg-black/75 backdrop-blur-md border-l-2 border-[#0047AB] border-y border-r border-white/5 p-4 rounded-r-xl max-w-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-mono text-zinc-300 tracking-widest uppercase">
                  {t('Prize Support', 'Hadiah & Dukungan Dana')}
                </span>
              </div>
              <div className="text-lg font-sans font-black text-white tracking-tight">
                RP 62,000,000+
              </div>
              <div className="text-[9px] font-mono text-[#B3B3B3]">
                {t('Total Door Prize', 'Total Door Prize')}
              </div>
            </motion.div>

          </div>

          {/* MIDDLE: Enormous Luxury Typographic Core & CTAs */}
          <div className="lg:col-span-9 text-left">

            {/* Tagline label */}
            <motion.div
              id="hero-tagline-tag"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 bg-zinc-900 border border-white/5 py-1.5 px-3.5 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-ping" />
              <span className="text-[9.5px] font-mono text-zinc-300 uppercase tracking-[0.22em] font-black">
                {t("ELECTRONICS AND ROBOTICS INNOVATION COMPETITION", "ELECTRONICS AND ROBOTICS INNOVATION COMPETITION")}
              </span>
            </motion.div>

            {/* Huge Headline: ERIC 2026 & BUILD THE FUTURE */}
            <h1 className="leading-none tracking-tighter select-none font-sans uppercase">

              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                className="text-white text-5xl sm:text-7xl md:text-9xl font-black block"
              >
                {t('INTERNATIONAL ERIC 2026', 'INTERNATIONAL ERIC 2026')}
              </motion.div>

              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.7 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFE44D] to-[#0047AB] text-4xl sm:text-6xl md:text-8xl font-black block mt-1"
              >
                {t('BUILD THE FUTURE', 'BUILD THE FUTURE')}
              </motion.div>

            </h1>

            {/* Descriptive paragraph */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-[#B3B3B3] text-sm md:text-lg max-w-xl font-mono uppercase mt-6 leading-relaxed"
            >
              {t(
                "Experience the premier electronics and robotics innovation championship organized by Universitas Negeri Jakarta. Built for the next generation of genius student engineers.",
                "Saksikan ajang kejuaraan inovasi elektronika dan robotika bergengsi yang diselenggarakan oleh Universitas Negeri Jakarta. Dibangun untuk melahirkan generasi penerus insinyur teknologi."
              )}
            </motion.p>

            {/* CTA action cluster button pair */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-10"
            >
              <button
                id="hero-btn-cta-register"
                onClick={() => handleScrollTo('#divisions-section')}
                className="group relative px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-[#002D62] via-[#0047AB] to-[#FFD700] text-white rounded-full font-sans text-xs font-black tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_25px_rgba(255, 215, 0, 0.35)] select-none text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t('REGISTER FOR TRIAL', 'DAFTAR SEKARANG')}
                  <Send className="w-3.5 h-3.5 text-white transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>

              <button
                id="hero-btn-cta-explore"
                onClick={() => handleScrollTo('#about-section')}
                className="group w-full sm:w-auto px-8 py-4 border border-white/10 hover:border-white/30 rounded-full font-mono text-xs text-white uppercase tracking-widest transition-all duration-300 select-none text-center bg-transparent"
              >
                {t('EXPLORE MISSION', 'JELAJAHI MISI')}
              </button>
            </motion.div>

          </div>

        </div>
      </div>

      {/* BOTTOM CONTROL DECK: Animated telemetry bar */}
      <div className="max-w-7xl mx-auto px-6 w-full mt-8 relative z-10 select-none border-t border-white/5 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8 text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#FFD700] animate-spin-slow" /> {t('COORD: 106.8229° E // 6.1944° S', 'KOORD: 106.8229° T // 6.1944° S')}
            </span>
            <span className="hidden md:inline text-white/20">|</span>
            <span className="hidden md:inline">{t('VERSION: F1-ME-2026-v2', 'VERSI: F1-ME-2026-v2')}</span>
          </div>

          <button
            id="hero-scroll-btn"
            onClick={() => handleScrollTo('#about-section')}
            className="flex items-center gap-2 text-xs font-mono text-[#FFD700] hover:text-white transition-colors uppercase animate-bounce"
          >
            <span>{t('SCROLL TO LAUNCH', 'GULIR KE BAWAH')}</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </section>
  );
}
