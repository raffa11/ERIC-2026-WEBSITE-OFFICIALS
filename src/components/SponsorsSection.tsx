/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { SPONSORS } from '../data';
import { MessageCircle } from 'lucide-react';

const TIER_CONFIG: Record<string, { label: string; imgClass: string }> = {
  titanium: {
    label: 'TITANIUM',
    imgClass: 'max-h-32 md:max-h-44'
  },
  platinum: {
    label: 'PLATINUM',
    imgClass: 'max-h-28 md:max-h-40'
  },
  gold: {
    label: 'GOLD',
    imgClass: 'max-h-24 md:max-h-32'
  },
  silver: {
    label: 'SILVER',
    imgClass: 'max-h-20 md:max-h-28'
  }
};

export default function SponsorsSection() {
  const { t } = useLanguage();
  const [hoveredSponsor, setHoveredSponsor] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const sorted = [...SPONSORS].sort((a, b) => {
    const order = ['silver', 'gold', 'platinum', 'titanium'];
    return order.indexOf(a.tier) - order.indexOf(b.tier);
  });

  return (
    <section id="sponsors-section" className="relative py-24 bg-[#0D0D0D] border-t border-white/5 select-none overflow-hidden">
      <div className="absolute right-[-10%] bottom-[10%] w-[350px] h-[350px] bg-[#FFD700]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono text-zinc-500 tracking-[0.25em] uppercase">
            {t('OFFICIAL SPONSOR', 'SPONSOR RESMI')}
          </span>
          <h3 className="text-2xl md:text-5xl font-sans font-black text-white uppercase tracking-tight mt-3">
            {t('OFFICIAL', '')} <span className="text-[#FFD700]">{t('SPONSOR', 'SPONSOR RESMI')}</span>
          </h3>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sorted.map((sponsor) => {
              const cfg = TIER_CONFIG[sponsor.tier] || TIER_CONFIG.silver;
              const showLogo = sponsor.logo && !imgErrors[sponsor.name];
              return (
                <div
                  id={`sponsor-badge-${sponsor.initials}`}
                  key={sponsor.name}
                  onMouseEnter={() => setHoveredSponsor(sponsor.name)}
                  onMouseLeave={() => setHoveredSponsor(null)}
                  className={`relative flex flex-col items-center justify-center p-8 bg-zinc-950 rounded-2xl border transition-all duration-300 min-h-[220px] md:min-h-[260px] ${
                    hoveredSponsor === sponsor.name
                      ? 'border-[#FFD700] shadow-[0_0_20px_rgba(255, 215, 0, 0.15)] bg-[#050505]'
                      : 'border-white/5'
                  }`}
                >
                  {/* Tier badge */}
                  <span
                    className="absolute top-3 left-3 text-[7px] font-mono font-bold uppercase tracking-[0.2em] border px-2 py-0.5 rounded-full"
                    style={{
                      color: sponsor.tier === 'silver' ? '#a0a0a0' : sponsor.tier === 'gold' ? '#FFD700' : sponsor.tier === 'platinum' ? '#C5A059' : '#FFD700',
                      backgroundColor: sponsor.tier === 'silver' ? 'rgba(160,160,160,0.1)' : sponsor.tier === 'gold' ? 'rgba(255,215,0,0.1)' : sponsor.tier === 'platinum' ? 'rgba(197,160,89,0.1)' : 'rgba(255,215,0,0.12)',
                      borderColor: sponsor.tier === 'silver' ? 'rgba(160,160,160,0.2)' : sponsor.tier === 'gold' ? 'rgba(255,215,0,0.2)' : sponsor.tier === 'platinum' ? 'rgba(197,160,89,0.2)' : 'rgba(255,215,0,0.25)'
                    }}
                  >
                    {cfg.label}
                  </span>

                  {showLogo ? (
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      onError={() => setImgErrors(prev => ({ ...prev, [sponsor.name]: true }))}
                      className={`w-auto object-contain transition-all duration-300 ${cfg.imgClass}`}
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

        {/* Sponsor CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-6 md:p-8 bg-zinc-950 border border-white/5 rounded-2xl max-w-xl mx-auto">
            <p className="text-xs font-mono text-zinc-400 uppercase leading-relaxed">
              {t(
                'Want to become a sponsor? Contact us below.',
                'Ingin bergabung menjadi sponsor? Hubungi kontak di bawah.'
              )}
            </p>
            <a
              href="https://wa.me/62895374385030"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/20 hover:border-[#FFD700]/40 text-xs font-mono text-[#FFD700] font-bold rounded-xl transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" />
              0895374385030 / Alle
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
