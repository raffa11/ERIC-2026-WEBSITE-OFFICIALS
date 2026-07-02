import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { SUPPORTED_BY } from '../data';

export default function SupportedBySection() {
  const { t } = useLanguage();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <section className="relative py-12 md:py-16 bg-[#0A0A0A] border-t border-b border-white/[0.03] select-none">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-[9px] font-mono text-zinc-600 tracking-[0.3em] uppercase">
            {t('SUPPORTED BY', 'DIDUKUNG OLEH')}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
          {SUPPORTED_BY.map((org) => {
            const showLogo = org.logo && !imgErrors[org.name];
            return (
              <div
                key={org.name}
                className="flex items-center justify-center"
              >
                {showLogo ? (
                  <img
                    src={org.logo}
                    alt={org.name}
                    onError={() => setImgErrors(prev => ({ ...prev, [org.name]: true }))}
                    className="h-20 md:h-28 w-auto object-contain opacity-100"
                  />
                ) : (
                  <span className="text-sm md:text-base font-sans font-black text-zinc-500 opacity-80 uppercase tracking-widest">
                    {org.initials}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



