/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { SPONSORS } from '../data';

export default function SponsorsSection() {
  const { t } = useLanguage();
  const [hoveredSponsor, setHoveredSponsor] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <section id="sponsors-section" className="relative py-24 bg-[#0D0D0D] border-t border-white/5 select-none overflow-hidden">
      <div className="absolute right-[-10%] bottom-[10%] w-[350px] h-[350px] bg-[#00FF88]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono text-zinc-500 tracking-[0.25em] uppercase">
            {t('OFFICIAL SPONSOR', 'SPONSOR RESMI')}
          </span>
          <h3 className="text-2xl md:text-5xl font-sans font-black text-white uppercase tracking-tight mt-3">
            {t('OFFICIAL', '')} <span className="text-[#00FF88]">{t('SPONSOR', 'SPONSOR RESMI')}</span>
          </h3>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {SPONSORS.map((sponsor) => {
            const showLogo = sponsor.logo && !imgErrors[sponsor.name];
            return (
              <div
                id={`sponsor-badge-${sponsor.initials}`}
                key={sponsor.name}
                onMouseEnter={() => setHoveredSponsor(sponsor.name)}
                onMouseLeave={() => setHoveredSponsor(null)}
                className={`relative flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-2xl border transition-all duration-300 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-md min-h-[240px] ${
                  hoveredSponsor === sponsor.name
                    ? 'border-[#00FF88] scale-102 shadow-[0_0_20px_rgba(0,255,136,0.15)] bg-[#050505]'
                    : 'border-white/5'
                }`}
              >
                <div className="absolute top-3 left-3 text-[6px] font-mono text-white/20">
                  ERIC_PARTNER_2026
                </div>

                {showLogo ? (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    onError={() => setImgErrors(prev => ({ ...prev, [sponsor.name]: true }))}
                    className="max-h-48 max-w-72 w-auto h-auto object-contain"
                  />
                ) : (
                  <div
                    className={`text-2xl font-sans font-black tracking-widest transition-colors duration-300 ${
                      hoveredSponsor === sponsor.name ? 'text-white' : 'text-zinc-500'
                    }`}
                  >
                    {sponsor.initials}
                  </div>
                )}

                <div
                  className={`text-[10px] font-mono text-center mt-3 uppercase tracking-tight max-w-xs transition-colors duration-200 ${
                    hoveredSponsor === sponsor.name ? 'text-[#00FF88]' : 'text-zinc-400'
                  }`}
                >
                  {sponsor.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
