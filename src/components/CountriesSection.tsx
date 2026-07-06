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

  return (
    <section className="relative py-10 md:py-14 bg-[#050505] border-b border-white/[0.03] select-none">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <span className="text-[9px] font-mono text-zinc-600 tracking-[0.3em] uppercase">
            {t('ERIC 2025 INTERNATIONAL PARTICIPANTS', 'PESERTA INTERNASIONAL ERIC 2025')}
          </span>
        </div>

        <div className="flex flex-nowrap items-center justify-center gap-x-6 md:gap-x-10 overflow-x-auto pb-2 scrollbar-none">
          {COUNTRIES.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-3 bg-zinc-900/40 border border-white/5 rounded-xl shrink-0"
            >
              <img src={`https://flagcdn.com/w80/${c.code}.png`} alt={c.name} className="w-6 h-4 sm:w-8 sm:h-5 md:w-10 md:h-7 object-cover rounded shadow-[0_0_6px_rgba(255,255,255,0.08)]" />
              <span className="text-[11px] sm:text-sm md:text-base font-sans font-bold text-zinc-300 uppercase tracking-wider whitespace-nowrap">
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}