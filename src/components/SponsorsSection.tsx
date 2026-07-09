import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { SPONSORS } from '../data';
import { MessageCircle } from 'lucide-react';

const DUPLICATED = [...SPONSORS, ...SPONSORS];

export default function SponsorsSection() {
  const { t } = useLanguage();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <section id="sponsors-section" className="relative py-24 bg-[#0D0D0D] border-t border-white/5 select-none overflow-hidden">
      <div className="absolute right-[-10%] bottom-[10%] w-[350px] h-[350px] bg-[#FFD700]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono text-zinc-500 tracking-[0.25em] uppercase">
            {t('OUR SPONSORS', 'SPONSOR KAMI')}
          </span>
          <h3 className="text-2xl md:text-5xl font-sans font-black text-white uppercase tracking-tight mt-3">
            {t('OFFICIAL', '')} <span className="text-[#FFD700]">{t('SPONSORS', 'SPONSOR')}</span>
          </h3>
        </div>

        {/* Infinite Scroll Carousel */}
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex w-max animate-scroll gap-16 md:gap-24 items-center py-8 hover:[animation-play-state:paused]">
            {DUPLICATED.map((sponsor, i) => {
              const showLogo = sponsor.logo && !imgErrors[sponsor.name + i];
              return (
                <div key={`${sponsor.name}-${i}`} className="flex items-center justify-center shrink-0">
                  {showLogo ? (
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      onError={() => setImgErrors(prev => ({ ...prev, [sponsor.name + i]: true }))}
                      className="h-28 md:h-36 w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0"
                    />
                  ) : (
                    <span className="text-lg font-sans font-black tracking-widest text-zinc-600">
                      {sponsor.initials}
                    </span>
                  )}
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
