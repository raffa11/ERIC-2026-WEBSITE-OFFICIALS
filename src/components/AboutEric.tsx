/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { CORE_VISION_MISSION, STATISTICS } from '../data';
import { BookOpen, Target, ArrowRight } from 'lucide-react';

export default function AboutEric() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'latar' | 'tujuan'>('latar');

  const tabs = [
    { id: 'latar', label: t('BACKGROUND', 'LATAR BELAKANG'), icon: BookOpen },
    { id: 'tujuan', label: t('OBJECTIVES', 'TUJUAN'), icon: Target },
  ] as const;

  return (
    <section id="about-section" className="relative py-28 bg-[#0D0D0D] border-t border-white/5 overflow-hidden">
      {/* Light highlights */}
      <div className="absolute left-[-15%] top-[-10%] w-[450px] h-[450px] rounded-full bg-[#0047AB]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Horizontal running heading separator */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 tracking-widest mb-6 uppercase select-none">
          <span>{t('ABOUT THE CHAMPIONSHIP', 'TENTANG KOMPETISI')}</span>
          <div className="h-[1px] bg-zinc-800 grow" />
          <span>ERIC 2026</span>
        </div>

        {/* Dual column editorial grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start lg:items-center">
          
          {/* LEFT COLUMN: Large Photo Grid with Floating Bento Statistics */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              
              {/* Image with slow zoom */}
              <img
                src="/images/gallery/DSC01947.jpg"
                alt="ERIC Competition Documentation"
                referrerPolicy="no-referrer"
                className="w-full max-h-[400px] h-[250px] sm:h-[350px] md:h-[400px] object-cover filter brightness-90 contrast-105 group-hover:scale-103 transition-transform duration-700"
              />

              {/* Grid overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(0,255,136,0.15)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />

            </div>

            {/* Embedded Bento grid statistics below the image */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
              {STATISTICS.slice(0, 2).map((item, idx) => (
                <div id={`stat-bento-${idx}`} key={idx} className="bg-zinc-950 border border-white/5 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-sans font-black text-white tracking-widest">
                    {item.value}
                  </div>
                  <div className="text-[9.5px] font-mono text-[#00FF88] uppercase tracking-wide mt-1.5 leading-tight">
                    {item.label}
                  </div>
                </div>
              ))}
              {STATISTICS.slice(2, 4).map((item, idx) => (
                <div id={`stat-bento-${idx+2}`} key={idx+2} className="bg-zinc-950 border border-white/5 p-4 rounded-xl">
                  <div className="text-2xl md:text-3xl font-sans font-black text-[#C5A059] tracking-widest">
                    {item.value}
                  </div>
                  <div className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-wide mt-1.5 leading-tight">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Large Editorial Narrative Typography */}
          <div className="lg:col-span-6 space-y-8 select-none">
            
            {/* Massive Bold Heading */}
            <div>
              <h3 className="text-3xl md:text-5xl font-sans font-black tracking-tighter text-white uppercase leading-none">
                {t(CORE_VISION_MISSION.aboutTitle, 'MENDOBRAK BATAS OTOMATISASI DAN MEKATRONIKA.')}
              </h3>
            </div>

            {/* Futuristic Tab selectors */}
            <div id="about-tab-buttons" className="flex border-b border-white/5 pb-2 ml-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button
                    id={`btn-about-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-3.5 px-4 font-mono text-[10px] md:text-xs uppercase tracking-wider relative transition-colors duration-300 ${
                      active ? 'text-[#00FF88] font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#00FF88]' : 'text-zinc-500'}`} />
                    {tab.label}
                    {active && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00FF88]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Editorial Description Content Frame */}
            <div id="about-tabs-desc-container" className="min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  {activeTab === 'latar' && (
                    <div className="space-y-4">
                      <p className="text-zinc-300 text-sm md:text-base leading-relaxed uppercase">
                        {t(CORE_VISION_MISSION.latarBelakang, CORE_VISION_MISSION.latarBelakangID)}
                      </p>
                    </div>
                  )}

                  {activeTab === 'tujuan' && (
                    <div className="space-y-3">
                      <div className="text-[10px] font-mono text-[#00FF88] uppercase tracking-widest mb-1">
                        {t('OBJECTIVES', 'TUJUAN')}
                      </div>
                      <ul className="space-y-2.5">
                        {(t(CORE_VISION_MISSION.tujuan as any, CORE_VISION_MISSION.tujuanID as any) as string[]).map((m: string, i: number) => (
                          <li key={i} className="text-zinc-400 text-xs flex items-start gap-2.5 uppercase font-mono">
                            <span className="text-[#00FF88]">0{i + 1}.</span>
                            <span className="text-zinc-300">{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
