/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {SPONSORS.map((sponsor) => {
            const showLogo = sponsor.logo && !imgErrors[sponsor.name];
            return (
              <div
                id={`sponsor-badge-${sponsor.initials}`}
                key={sponsor.name}
                onMouseEnter={() => setHoveredSponsor(sponsor.name)}
                onMouseLeave={() => setHoveredSponsor(null)}
                className={`relative flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-2xl border transition-all duration-300 min-h-[220px] ${
                  hoveredSponsor === sponsor.name
                    ? 'border-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.15)] bg-[#050505]'
                    : 'border-white/5'
                }`}
              >
                {showLogo ? (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    onError={() => setImgErrors(prev => ({ ...prev, [sponsor.name]: true }))}
                    className="max-h-32 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xl font-sans font-black tracking-widest text-zinc-500">
                    {sponsor.initials}
                  </span>
                )}

                <span className="text-[9px] font-mono text-zinc-500 mt-3 uppercase tracking-tight text-center leading-tight">
                  {sponsor.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
