/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TIMELINE_EVENTS } from '../data';
import { Calendar, Layers, ChevronRight, CornerDownRight, CheckCircle2, ExternalLink } from 'lucide-react';

export default function TimelineSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeEvent = TIMELINE_EVENTS[activeIdx];

  return (
    <section id="timeline-section" className="relative py-24 bg-[#0D0D0D] border-t border-white/5 overflow-hidden">
      {/* Background glow node */}
      <div className="absolute left-[30%] bottom-[-10%] w-[350px] h-[350px] rounded-full bg-[#0047AB]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 select-none">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#00FF88] tracking-[0.4em] uppercase mb-4">
              <Layers className="w-4 h-4 animate-spin-slow" />
              <span>Critical Milestones</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-sans font-black tracking-tighter text-white uppercase leading-none">
              THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#C5A059]">TIMELINE</span>
            </h2>
          </div>
          <p className="text-zinc-500 font-mono text-xs max-w-sm mt-4 md:mt-0 uppercase">
            Click on a timeline phase below to check official guidelines and important schedules.
          </p>
        </div>

        {/* HORIZONTAL TRACK CONTAINER */}
        <div className="relative mb-12">
          
          {/* Main glowing circuit connecting line */}
          <div className="absolute top-[28px] left-0 right-0 h-[2px] bg-zinc-800 pointer-events-none z-0" />
          
          {/* Highlighted portion of the line */}
          <motion.div
            className="absolute top-[28px] left-0 h-[2.5px] bg-gradient-to-r from-[#0047AB] via-[#00FF88] to-[#C5A059] pointer-events-none z-0 shadow-[0_0_10px_rgba(0,255,136,0.5)]"
            initial={{ width: '0%' }}
            animate={{ width: `${(activeIdx / (TIMELINE_EVENTS.length - 1)) * 100}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          />

          {/* Scrolling timeline buttons scroll wrapper */}
          <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent py-4 flex justify-between gap-4 z-10 select-none">
            {TIMELINE_EVENTS.map((item, idx) => {
              const active = idx === activeIdx;
              const completed = idx < activeIdx;

              return (
                <button
                  id={`btn-time-${idx}`}
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className="flex flex-col items-center text-center min-w-[170px] focus:outline-none group cursor-pointer"
                >
                  {/* Phase bubble */}
                  <div className="relative mb-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        active
                          ? 'bg-black border-[#00FF88] text-[#00FF88] scale-110 shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                          : completed
                          ? 'bg-gradient-to-r from-[#0047AB] to-[#00FF88] border-transparent text-white'
                          : 'bg-[#121212] border-zinc-700 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300'
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <span className="font-sans font-black text-sm tracking-tighter">0{idx + 1}</span>
                      )}
                    </div>

                    {/* Active dynamic ping pulse */}
                    {active && (
                      <span className="absolute -inset-1 rounded-full border border-[#00FF88] animate-ping opacity-45 pointer-events-none" />
                    )}
                  </div>

                  {/* Phase number & Title banner */}
                  <span
                    className={`font-mono text-[9px] tracking-widest uppercase transition-colors duration-300 ${
                      active ? 'text-[#00FF88] font-bold' : 'text-zinc-500'
                    }`}
                  >
                    {item.phase}
                  </span>
                  <span
                    className={`text-xs font-sans font-bold mt-1 max-w-[150px] line-clamp-1 transition-colors duration-300 ${
                      active ? 'text-white font-extrabold scale-102' : 'text-zinc-400 group-hover:text-zinc-300'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600 mt-0.5">{item.date.split(' - ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DISPLAY DETAIL VIEW BOARD (Glassmorphism layout) */}
        <div id="timeline-detail-board" className="relative mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-zinc-950/70 border border-white/5 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start backdrop-blur-md"
            >
              
              {/* Left Column stats projection */}
              <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-8">
                <span className="text-xs font-mono text-[#00FF88] tracking-[0.2em] uppercase block mb-1">
                  Selected Phase
                </span>
                <div className="text-4xl font-sans font-black text-white tracking-tighter mb-4">
                  {activeEvent.phase}
                </div>

                <div className="flex items-center gap-2 text-white/90 bg-[#121212] px-3.5 py-2.5 rounded-lg border border-white/5 mb-4">
                  <Calendar className="w-4 h-4 text-[#00FF88]" />
                  <span className="font-mono text-xs">{activeEvent.date}</span>
                </div>

                <div className="text-[10px] font-mono text-white/40 uppercase">CONFORMITY STATUS</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      activeEvent.status === 'completed'
                        ? 'bg-emerald-500 animate-pulse'
                        : activeEvent.status === 'active'
                        ? 'bg-[#00FF88] animate-pulse'
                        : 'bg-zinc-600'
                    }`}
                  />
                  <span className="text-xs font-mono text-white uppercase font-bold">
                    {activeEvent.status === 'completed'
                      ? 'COMPLETED / SELESAI'
                      : activeEvent.status === 'active'
                      ? 'ACTIVE / PENDAFTARAN DIBUKA'
                      : 'UPCOMING / SEGERA DATANG'}
                  </span>
                </div>
              </div>

              {/* Right Column details descriptions */}
              <div className="md:col-span-8 space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-sans font-extrabold text-white tracking-tight leading-snug">
                    {activeEvent.title}
                  </h3>
                  <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
                    {activeEvent.description}
                  </p>
                </div>

                {/* Event Schedule Button */}
                <a
                  href="https://drive.google.com/drive/folders/1RPDtOuZvIp4wUPghS5LrQXQCm9JYpciU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-5 py-4 bg-zinc-950 border border-white/10 hover:border-[#00FF88]/40 rounded-2xl transition-all duration-300 hover:scale-102 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#00FF88]" />
                    <div>
                      <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">SCHEDULE</div>
                      <div className="text-sm font-sans font-black text-white group-hover:text-[#00FF88] transition-colors uppercase tracking-tight">
                        {t('View Full Event Schedule', 'Lihat Jadwal Lengkap')}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-[#00FF88] transition-colors" />
                </a>

                {/* Sub Indonesian Content panel (Authentic feel) */}
                <div className="border-t border-white/5 pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CornerDownRight className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[10px] font-mono text-[#C5A059] tracking-widest uppercase font-bold">
                      Panduan Teknis (Bahasa Indonesia)
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed italic">
                    {activeEvent.details}
                  </p>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
