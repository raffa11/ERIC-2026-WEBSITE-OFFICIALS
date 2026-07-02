import { useLanguage } from './LanguageContext';

const COUNTRIES = [
  { emoji: '🇮🇩', name: 'Indonesia' },
  { emoji: '🇲🇾', name: 'Malaysia' },
  { emoji: '🇵🇭', name: 'Philippines' },
  { emoji: '🇻🇳', name: 'Vietnam' },
];

export default function CountriesSection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-10 md:py-14 bg-[#050505] border-b border-white/[0.03] select-none">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <span className="text-[9px] font-mono text-zinc-600 tracking-[0.3em] uppercase">
            {t('INTERNATIONAL PARTICIPANTS', 'PESERTA INTERNASIONAL')}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {COUNTRIES.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2 px-5 py-3 bg-zinc-900/40 border border-white/5 rounded-xl"
            >
              <span className="text-2xl md:text-3xl leading-none">{c.emoji}</span>
              <span className="text-sm md:text-base font-sans font-bold text-zinc-300 uppercase tracking-wider">
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}