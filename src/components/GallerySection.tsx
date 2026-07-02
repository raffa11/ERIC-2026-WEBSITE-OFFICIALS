/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GALLERY_ITEMS } from '../data';
import { useLanguage } from './LanguageContext';
import { Aperture, Compass, Filter, ZoomIn } from 'lucide-react';

export default function GallerySection() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');

  const categories = [
  { en: 'All', id: 'Semua' },
  { en: 'Diagnostics', id: 'Diagnostik' },
  { en: 'Arena Trials', id: 'Uji Coba Arena' },
  { en: 'Labs', id: 'Laboratorium' },
  { en: 'Kinematics', id: 'Kinematika' }
];

  const filteredItems = filter === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category.toLowerCase().includes(filter.toLowerCase()) || filter.toLowerCase().includes(item.category.toLowerCase()));

  return (
    <section id="gallery-section" className="relative py-24 bg-[#050505] border-t border-white/5 overflow-hidden">
      {/* Light highlights */}
      <div className="absolute right-[5%] bottom-[30%] w-[400px] h-[400px] rounded-full bg-[#4DFFB8]/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 select-none">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#00FF88] tracking-[0.4em] uppercase mb-4">
              <Aperture className="w-4 h-4 animate-spin-slow" />
              <span>Diagnostic Snapshots</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-sans font-black tracking-tighter text-white uppercase leading-none">
              THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#4DFFB8]">GALLERY</span>
            </h2>
          </div>

          {/* Premium Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 mt-6 md:mt-0 bg-[#0D0D0D] border border-white/5 p-1.5 rounded-lg select-none">
            <span className="text-white/40 font-mono text-[9px] uppercase px-3 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.en}
                onClick={() => setFilter(cat.en)}
                className={`px-3 py-1.5 rounded text-xs font-mono uppercase transition-all duration-300 ${
                  filter === cat.en
                    ? 'bg-[#00FF88] text-black font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t(cat.en, cat.id)}
              </button>
            ))}
          </div>
        </div>

        {/* Pinterest style layout Grid */}
        <div id="gallery-masonry" className="grid grid-cols-12 gap-6 items-start">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                id={`gallery-item-${item.id}`}
                className={`${item.aspectClassName} group relative overflow-hidden bg-zinc-950 border border-white/5 rounded-2xl h-96`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                {/* Image under zoom */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-108"
                  />
                  {/* Tint glass dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 group-hover:via-black/25 transition-all duration-300" />
                </div>

                {/* Reticle borders layout */}
                <div className="absolute inset-4 border border-white/10 group-hover:border-[#00FF88]/20 transition-all duration-300 pointer-events-none rounded-xl" />

                {/* Left corner calibration coordinates (Formula E look) */}
                <div className="absolute top-6 left-6 font-mono text-[8px] text-white/30 group-hover:text-[#00FF88]/50 transition-colors duration-300 select-none">
                  CAM_ID_[00{idx + 1}] // FOV_84°
                </div>

                {/* Right corner magnifying indicator */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="flex items-center gap-1.5 bg-black/80 border border-[#00FF88]/20 px-2 py-1 rounded text-[9px] font-mono text-[#00FF88]">
                    <ZoomIn className="w-3 h-3" /> RESOLVE_LENS
                  </span>
                </div>

                {/* Text overlay contents on bottom */}
                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <span className="px-2 py-0.5 bg-zinc-900 border border-white/10 text-white/60 font-mono text-[9px] uppercase tracking-widest rounded">
                    {item.category}
                  </span>
                  <h3 className="text-lg md:text-xl font-sans font-black text-white uppercase tracking-tight leading-none mt-2.5">
                    {item.title}
                  </h3>
                  <div className="h-[1px] bg-white/10 my-3 w-0 group-hover:w-full transition-all duration-500 ease-out" />
                  <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-[10px] font-mono text-zinc-400">
                    <span>LENS_SYS: CALIBRATED</span>
                    <span className="flex items-center gap-1 text-[#00FF88]">
                      <Compass className="w-3.5 h-3.5 animate-spin-slow" /> COORD_STABLE
                    </span>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
