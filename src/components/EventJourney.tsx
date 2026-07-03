/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { EVENT_DAY_JOURNEY } from '../data';
import { Sparkles, Play, Shield, Timer, Award, CheckCircle } from 'lucide-react';

export default function EventJourney() {
  const { t } = useLanguage();
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  const activeDay = EVENT_DAY_JOURNEY[activeDayIdx];

  // Specific day parameters to style them like a high octane racing log
  const dayAccents = [
    { color: '#FFD700', badge: 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20' },
    { color: '#FFE44D', badge: 'bg-[#FFE44D]/10 text-[#FFE44D] border-[#FFE44D]/20' },
    { color: '#0047AB', badge: 'bg-[#0047AB]/10 text-white border-white/20' }
  ];

  return (
    <section id="journey-section" className="relative py-28 bg-[#050505] border-t border-white/5 overflow-hidden">
      {/* Laser glare from right edge */}
      <div className="absolute right-[-10%] top-[20%] w-[400px] h-[400px] rounded-full bg-[#FFD700]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 select-none">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#FFD700] tracking-[0.4em] uppercase mb-4 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE CHALLENGE EXPERIENCE</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-sans font-black tracking-tighter text-white uppercase leading-none">
              THREE DAYS.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFE44D] to-white">ONE LEGACY.</span>
            </h2>
          </div>
          <p className="text-zinc-500 font-mono text-sm max-w-sm mt-6 md:mt-0 uppercase leading-relaxed">
            The full championship schedule. Follow our dynamic phases, academic tests, and live exhibitions.
          </p>
        </div>

        {/* 3 Large Documentary Day selectors */}
        <div id="journey-day-selectors" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 select-none">
          {EVENT_DAY_JOURNEY.map((day, i) => {
            const active = activeDayIdx === i;
            const accent = dayAccents[i];
            return (
              <button
                id={`btn-journey-day-${i}`}
                key={day.dayNum}
                onClick={() => setActiveDayIdx(i)}
                className={`relative overflow-hidden p-6 text-left rounded-2xl border transition-all duration-300 cursor-pointer ${
                  active
                    ? 'bg-zinc-950 border-white/20 shadow-[0_15px_30px_rgba(0,0,0,0.8)] scale-102'
                    : 'bg-[#0D0D0D] border-white/5 opacity-60 hover:opacity-100 hover:border-white/10'
                }`}
              >
                {/* Visual telemetry light on top of day block */}
                {active && (
                  <motion.div
                    layoutId="dayLightIndicator"
                    className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#FFD700]"
                  />
                )}

                <div className="flex justify-between items-start">
                  <span className="text-sm font-mono text-zinc-500 font-black tracking-wider">
                    {day.dayNum}
                  </span>
                  
                  <span className={`px-2.5 py-0.5 text-[8.5px] font-mono rounded border uppercase ${accent.badge}`}>
                    {active ? 'ACTIVE' : 'SCHEDULED'}
                  </span>
                </div>

                <h3 className="text-2xl font-sans font-black text-white uppercase tracking-tight mt-4">
                  {t(day.phaseName, day.indonesianPhase)}
                </h3>
              </button>
            );
          })}
        </div>

        {/* DAY RUNTIME LOGS SCREEN */}
        <div id="journey-runtime-screen" className="bg-[#0D0D0D] border border-white/5 rounded-3xl p-6 md:p-10 shadow-[0_25px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* Aesthetic grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDayIdx}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10"
            >
              
              {/* Left Column: Descriptive Mission Overview (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                    <Timer className="w-4 h-4 text-[#FFD700]" />
                    <span>TIMELINE SCHEDULE // {activeDay.dayNum}</span>
                  </div>
                  
                  <h4 className="text-3xl font-sans font-black text-white uppercase tracking-tighter">
                    {t(activeDay.phaseName, activeDay.indonesianPhase)}
                  </h4>
                </div>

                <p className="text-[#B3B3B3] text-sm leading-relaxed uppercase font-mono">
                  {t(activeDay.description, activeDay.indonesianDescription)}
                </p>

              </div>

              {/* Right Column: Interactive Step Activities List (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-[10px] font-mono text-[#C5A059] tracking-[0.2em] uppercase block mb-2 font-black">
                  CHAMPIONSHIP AGENDA
                </span>

                <div className="space-y-3.5 select-none">
                  {activeDay.activities.map((act, idx) => (
                    <motion.div
                      id={`day-agenda-item-${idx}`}
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      className="group flex gap-4 items-start p-4 bg-zinc-950 border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-sans font-black text-xs text-zinc-500 group-hover:text-[#FFD700] group-hover:border-[#FFD700]/20 transition-all duration-300 shrink-0">
                        0{idx + 1}
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-mono text-zinc-300 uppercase leading-snug font-bold group-hover:text-white transition-colors">
                          {act}
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-zinc-600">
                          <CheckCircle className="w-3 h-3 text-[#FFD700]/60" />
                          <span>MAPPED TO DIRECT DIVISION RULEBOOK</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

              </div>

            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
