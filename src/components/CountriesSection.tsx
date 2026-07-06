import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';

const COUNTRIES = [
  { code: 'id', name: 'Indonesia' },
  { code: 'my', name: 'Malaysia' },
  { code: 'ph', name: 'Philippines' },
  { code: 'vn', name: 'Vietnam' },
  { code: 'mu', name: 'Mauritius' },
  { code: 'tw', name: 'Taiwan' },
];

export default function CountriesSection() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current && contentRef.current) {
        const diff = contentRef.current.scrollWidth - containerRef.current.clientWidth;
        setScrollDistance(Math.max(0, diff));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <section className="relative py-10 md:py-14 bg-[#050505] border-b border-white/[0.03] select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <span className="text-[9px] font-mono text-zinc-600 tracking-[0.3em] uppercase">
            {t('ERIC 2025 INTERNATIONAL PARTICIPANTS', 'PESERTA INTERNASIONAL ERIC 2025')}
          </span>
        </div>

        <div ref={containerRef} className="overflow-hidden pb-2">
          {scrollDistance > 0 ? (
            <motion.div
              ref={contentRef}
              className="flex flex-nowrap gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-5"
              animate={{ x: [0, -scrollDistance, 0] }}
              transition={{ repeat: Infinity, duration: 28, ease: 'easeInOut' }}
            >
              {COUNTRIES.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-1.5 md:gap-2 px-2 sm:px-2.5 md:px-3 lg:px-3 xl:px-4 py-1.5 md:py-2.5 bg-zinc-900/40 border border-white/5 rounded-xl shrink-0"
                >
                  <img src={`https://flagcdn.com/w80/${c.code}.png`} alt={c.name} className="w-5 h-3.5 sm:w-6 sm:h-4 md:w-7 md:h-5 lg:w-7 lg:h-5 xl:w-9 xl:h-6 object-cover rounded shadow-[0_0_6px_rgba(255,255,255,0.08)]" />
                  <span className="text-[10px] sm:text-xs md:text-sm lg:text-sm xl:text-base font-sans font-bold text-zinc-300 uppercase tracking-wider whitespace-nowrap">
                    {c.name}
                  </span>
                </div>
              ))}
            </motion.div>
          ) : (
            <div
              ref={contentRef}
              className="flex flex-nowrap items-center justify-center gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-5"
            >
              {COUNTRIES.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-1.5 md:gap-2 px-2 sm:px-2.5 md:px-3 lg:px-3 xl:px-4 py-1.5 md:py-2.5 bg-zinc-900/40 border border-white/5 rounded-xl shrink-0"
                >
                  <img src={`https://flagcdn.com/w80/${c.code}.png`} alt={c.name} className="w-5 h-3.5 sm:w-6 sm:h-4 md:w-7 md:h-5 lg:w-7 lg:h-5 xl:w-9 xl:h-6 object-cover rounded shadow-[0_0_6px_rgba(255,255,255,0.08)]" />
                  <span className="text-[10px] sm:text-xs md:text-sm lg:text-sm xl:text-base font-sans font-bold text-zinc-300 uppercase tracking-wider whitespace-nowrap">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}