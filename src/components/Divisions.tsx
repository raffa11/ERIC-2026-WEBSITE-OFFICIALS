/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { COMPETITION_DIVISIONS } from '../data';
import * as LucideIcons from 'lucide-react';

interface DivisionsProps {
  onSelectDivision: (divisionId: string) => void;
}

export default function Divisions({ onSelectDivision }: DivisionsProps) {
  const { t } = useLanguage();
  const [isTouchDevice] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );

  // Track hover status per card ID to implement individual glares
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [tiltMap, setTiltMap] = useState<Record<string, { x: number; y: number; gx: number; gy: number }>>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotX = -((y / rect.height) - 0.5) * 16;
    const rotY = ((x / rect.width) - 0.5) * 16;

    const glossX = (x / rect.width) * 100;
    const glossY = (y / rect.height) * 100;

    setTiltMap((prev) => ({
      ...prev,
      [id]: { x: rotX, y: rotY, gx: glossX, gy: glossY },
    }));
  };

  const handleMouseLeave = (id: string) => {
    setHoveredCardId(null);
    setTiltMap((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0, gx: 50, gy: 50 },
    }));
  };

  return (
    <section id="divisions-section" className="relative py-16 md:py-28 bg-[#050505] border-t border-white/5">
      {/* Visual cybernetic backdrops - hidden on touch for performance */}
      {!isTouchDevice && (
        <>
          <div className="absolute right-[5%] top-[-5%] w-[450px] h-[450px] bg-[#FFD700]/5 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute left-[5%] bottom-[10%] w-[380px] h-[380px] bg-[#0047AB]/5 rounded-full blur-[130px] pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12 md:mb-20 select-none">
          <div className="flex items-center gap-3 text-xs font-mono text-[#FFD700] tracking-[0.4em] uppercase mb-4">
            <LucideIcons.Trophy className="w-4 h-4 text-[#FFD700]" />
            <span>{t('COMPETITION DIVISIONS', 'DIVISI PERLOMBAAN')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-7xl font-sans font-black tracking-tighter text-white uppercase leading-none">
            {t('THE', '')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFE44D]">{t('ARENAS', 'ARENA PERTANDINGAN')}</span>
          </h2>
          <p className="text-[#B3B3B3] font-mono text-sm uppercase max-w-xl mt-4">
            {t('9 competition arenas with 12 categories built to test the limits of innovation, design, and practical electronics and robotics application.', '9 arena kompetisi dengan 12 kategori yang dirancang untuk menguji batas inovasi, desain, dan aplikasi elektronika serta robotika praktis.')}
          </p>
        </div>

        {/* Resource Links — plain text on mobile, styled cards on desktop */}
        <div className="mb-14">
          <p className="text-[#B3B3B3] font-mono text-xs uppercase tracking-wider mb-5 select-none">
            {t('Everything you need to compete →', 'Semua yang perlu kamu tahu →')}
          </p>
          {/* MOBILE: plain text links */}
          {isTouchDevice && (
            <div className="grid grid-cols-2 gap-2 max-w-sm">
              {[
                { href: "https://drive.google.com/drive/folders/1co00vzy633xZzgyBG0G4dvWEtvsHenXt", icon: "FileText", label: "All Information", labelId: "Semua Informasi" },
                { href: "https://drive.google.com/drive/folders/10w9yn_Tvfa7Kw7fEdQgRgHy6ARn04N_r?usp=drive_link", icon: "BookOpen", label: "Guidebook", labelId: "Buku Panduan" },
                { href: "https://drive.google.com/drive/folders/1RPDtOuZvIp4wUPghS5LrQXQCm9JYpciU", icon: "Calendar", label: "Event Schedule", labelId: "Jadwal Acara" },
                { href: "https://drive.google.com/drive/folders/1aM7UBB4gHVja5UdD079kXtcBJ3001mTt", icon: "Mail", label: "Official Letters", labelId: "Surat Resmi" },
              ].map((link) => {
                const IconComp = LucideIcons[link.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }> | undefined;
                return (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 break-words min-w-0">
                    {IconComp && <IconComp className="w-4 h-4 shrink-0 text-[#FFD700]" />}
                    <span className="text-[10px] leading-tight font-sans font-black uppercase break-words hyphens-auto">{t(link.label, link.labelId)}</span>
                  </a>
                );
              })}
            </div>
          )}
          {/* DESKTOP: styled cards */}
          {!isTouchDevice && (
            <div className="grid grid-cols-4 gap-4 max-w-4xl select-none">
              {[
                { href: "https://drive.google.com/drive/folders/1co00vzy633xZzgyBG0G4dvWEtvsHenXt", icon: "FileText", label: "All Information", labelId: "Semua Informasi", badge: "INFO" },
                { href: "https://drive.google.com/drive/folders/10w9yn_Tvfa7Kw7fEdQgRgHy6ARn04N_r?usp=drive_link", icon: "BookOpen", label: "Guidebook", labelId: "Buku Panduan", badge: "GUIDE" },
                { href: "https://drive.google.com/drive/folders/1RPDtOuZvIp4wUPghS5LrQXQCm9JYpciU", icon: "Calendar", label: "Event Schedule", labelId: "Jadwal Acara", badge: "SCHEDULE" },
                { href: "https://drive.google.com/drive/folders/1aM7UBB4gHVja5UdD079kXtcBJ3001mTt", icon: "Mail", label: "Official Letters", labelId: "Surat Resmi", badge: "LETTERS" },
              ].map((link) => {
                const IconComp = LucideIcons[link.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }> | undefined;
                return (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-center gap-2.5 px-5 py-4 bg-zinc-950 border border-white/10 rounded-2xl min-h-[60px] hover:border-[#FFD700]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255, 215, 0, 0.1)]">
                    {IconComp && <IconComp className="w-4 h-4 flex-shrink-0 text-[#FFD700]" />}
                    <div className="text-left min-w-0">
                      <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{t(link.badge, link.badge)}</div>
                      <div className="text-xs font-sans font-black uppercase tracking-tight truncate text-white group-hover:text-[#FFD700] transition-colors">{t(link.label, link.labelId)}</div>
                    </div>
                    <LucideIcons.ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500 group-hover:text-[#FFD700] transition-colors" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* 3D Cards Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COMPETITION_DIVISIONS.map((division, idx) => {
            // Dynamically resolve lucide library icon name safely
            const resolvedIconName = (division.icon as keyof typeof LucideIcons) || 'Cpu';
            const IconComponent = (LucideIcons[resolvedIconName] as React.ComponentType<{ className?: string }>) || LucideIcons.Cpu;

            const isHovered = hoveredCardId === division.id;
            const tilt = tiltMap[division.id] || { x: 0, y: 0, gx: 50, gy: 50 };

            return (
              <div
                id={`division-card-${division.id}`}
                key={division.id}
                onClick={() => { if (!division.comingSoon) onSelectDivision(division.id); }}
                onMouseMove={(e) => {
                  if (isTouchDevice || division.comingSoon) return;
                  setHoveredCardId(division.id);
                  handleMouseMove(e, division.id);
                }}
                onMouseLeave={() => {
                  if (isTouchDevice || division.comingSoon) return;
                  handleMouseLeave(division.id);
                }}
                className={`relative select-none ${division.comingSoon ? 'cursor-default opacity-60' : 'cursor-pointer'} ${isTouchDevice ? '' : 'group'} touch-manipulation`}
                style={{ perspective: isTouchDevice ? 'none' : '800px' }}
              >
                {/* Embedded Glow Shadow Behind Card */}
                {!isTouchDevice && !division.comingSoon && (
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-[25px] transition-all duration-300 pointer-events-none"
                    style={{
                      backgroundColor: division.glowColor,
                      transform: `scale(0.95) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    }}
                  />
                )}

                {/* Main Card Shell */}
                <div
                  className={`relative overflow-hidden bg-gradient-to-b from-zinc-900/90 to-black border ${isTouchDevice ? 'border-white/10' : 'border-white/5 group-hover:border-white/20'} p-5 sm:p-8 min-h-[360px] md:min-h-[400px] rounded-2xl flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.6)]`}
                  style={
                    isTouchDevice || division.comingSoon
                      ? {}
                      : {
                          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.03 : 1.0})`,
                          transition: 'transform 0.2s ease-out',
                        }
                  }
                >
                  
                  {/* Dynamic glare ray sweep */}
                  {!isTouchDevice && !division.comingSoon && (
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: isHovered ? 0.28 : 0,
                        background: `radial-gradient(circle 180px at ${tilt.gx}% ${tilt.gy}%, white, transparent)`,
                      }}
                    />
                  )}

                  {/* Corner aesthetic notches */}
                  {!isTouchDevice && !division.comingSoon && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/2 group-hover:bg-[#FFD700]/5 transition-colors duration-300 [clip-path:polygon(100%_0,0_0,100%_100%)] pointer-events-none" />
                  )}

                  {/* Coming Soon Ribbon */}
                  {division.comingSoon && (
                    <div className="absolute top-6 right-6 z-20">
                      <span className="bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        {t('Coming Soon', 'Segera Hadir')}
                      </span>
                    </div>
                  )}

                  {/* Inner Content top part */}
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      {division.image ? (
                        <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl border overflow-hidden bg-zinc-950/80 shrink-0 flex items-center justify-center p-1 sm:p-1.5 ${isTouchDevice ? 'border-white/10' : 'border-white/10 group-hover:border-[#FFD700]/40 transition-colors duration-300'}`}>
                          <img src={division.image} alt={division.title} loading="lazy" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className={`p-2 sm:p-3 bg-zinc-950/80 rounded-xl border text-white ${isTouchDevice ? 'border-white/10' : 'border-white/10 group-hover:text-[#FFD700] group-hover:border-[#FFD700]/40 transition-colors duration-300'}`}>
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                      )}
                      <span className="font-mono text-[9px] text-zinc-500 uppercase">
                        DIVISION 0{idx + 1}
                      </span>
                    </div>

                    {/* Highly responsive Kinetic Text */}
                    <h3 className={`text-2xl font-sans font-black uppercase leading-none tracking-tight ${isTouchDevice ? 'text-white' : 'text-white group-hover:text-[#FFD700] transition-colors'}`}>
                      {division.title}
                    </h3>
                    {/* Localised Description */}
                    <p className="text-zinc-400 text-xs mt-4 leading-relaxed line-clamp-4">
                      {division.comingSoon
                        ? t(division.description, division.indonesianDescription)
                        : t(division.description, division.indonesianDescription)}
                    </p>
                  </div>

                  {/* Spec description bottom section */}
                  <div className="border-t border-white/5 pt-5 select-none space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-500">{division.comingSoon ? t('STATUS', 'STATUS') : t('SPECIFICATION', 'SPESIFIKASI')}</span>
                      <span className={`font-semibold uppercase ${division.comingSoon ? 'text-[#FFD700]' : 'text-white'}`}>{division.specHighlight}</span>
                    </div>

                    {/* Hardware Difficulty intensity bar - hide for coming soon */}
                    {!division.comingSoon && (
                      <div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 mb-1">
                          <span>{t('TECHNICAL INDEX', 'INDEKS TEKNIS')}</span>
                          <span>{division.intensityScore}%</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#0047AB] via-[#FFD700] to-[#FFE44D] transition-all duration-500"
                            style={{ width: isHovered ? `${division.intensityScore}%` : (isTouchDevice ? `${division.intensityScore}%` : '20%') }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Contact Persons */}
                    {division.contactPersons.length > 0 && (
                      <div className="pt-1 border-t border-white/[0.03]">
                        <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 font-bold">
                          {t('CONTACT PERSON', 'CONTACT PERSON')}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {division.contactPersons.map((cp) => (
                            <a
                              key={cp.label}
                              href={`https://wa.me/${cp.waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-[#25D366]/10 border border-[#25D366]/20 rounded-md text-[8.5px] font-mono text-[#25D366] hover:bg-[#25D366]/20 hover:border-[#25D366]/40 transition-all truncate max-w-full"
                            >
                              <LucideIcons.MessageCircle className="w-3 h-3 shrink-0" />
                              <span className="font-bold shrink-0">{cp.label}</span>
                              <span className="text-white/30 shrink-0">/</span>
                              <span className="truncate min-w-0">{cp.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* F1-style sliding CTA banner */}
                    {!division.comingSoon && (
                      <div className="pt-1.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 font-mono text-[8.5px] text-[#FFD700] font-bold tracking-widest uppercase bg-[#FFD700]/5 border border-[#FFD700]/20 px-3 py-1 rounded-full w-full justify-center ${isTouchDevice ? '' : 'opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-300'}`}>
                          <span>{t('REGISTER FOR THIS ARENA', 'DAFTAR DI ARENA INI')}</span>
                          <LucideIcons.ArrowRight className="w-3 h-3 text-[#FFD700]" />
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
