/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import EricLogo from './EricLogo';
import { Mail, MapPin, Heart, Globe, MessageCircle } from 'lucide-react';
import { SUPPORTED_BY } from '../data';

export default function Footer() {
  const { t } = useLanguage();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer-root" className="relative bg-[#050505] border-t border-white/5 pt-20 pb-8 overflow-hidden select-none">
      
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[#0047AB]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Banner */}
        <div className="border-b border-white/5 pb-16 mb-16 overflow-hidden select-none">
          <h2 className="text-[12vw] sm:text-[10vw] font-sans font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 leading-none uppercase text-center pointer-events-none mb-4">
            ERIC 2026
          </h2>
          <div className="text-center font-mono text-[#FFD700] tracking-[0.3em] uppercase text-xs sm:text-sm font-bold">
            WHERE ENGINEERS BECOME CHAMPIONS
          </div>
          <div className="text-center font-mono text-zinc-500 tracking-wider text-[10px] mt-2 block uppercase">
            Electronics and Robotics Innovation Competition // Universitas Negeri Jakarta (UNJ)
          </div>
        </div>

        {/* Upper Brand Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/5">
          
          {/* Logo & Address (4 cols) */}
          <div className="md:col-span-4 space-y-6">
            <EricLogo className="w-24 h-24" src="/images/eric-logo.png" showText={true} title="INTERNATIONAL ERIC" subtitle="ROBOTICS LIGA" />
            
            <p className="text-zinc-500 font-mono text-xs uppercase leading-relaxed max-w-sm">
              {t(
                "Electronics and Robotics Innovation Competition — an international championship organized by Universitas Negeri Jakarta (UNJ), bringing together innovators and engineers from across the globe to compete, collaborate, and shape the future of technology.",
                "Electronics and Robotics Innovation Competition — kejuaraan internasional yang diselenggarakan oleh Universitas Negeri Jakarta (UNJ), mempertemukan inovator dan insinyur dari seluruh dunia untuk berkompetisi, berkolaborasi, dan membentuk masa depan teknologi."
              )}
            </p>

            <div className="space-y-3.5 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>Kampus A Universitas Negeri Jakarta, Jakarta Timur</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#FFD700] shrink-0" />
                <a href="mailto:ericunjofficial2026@gmail.com" className="hover:text-white transition-colors break-all">
                  ericunjofficial2026@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#FFD700] shrink-0" />
                <a href="https://ericunj.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  ericunj.org
                </a>
              </div>
            </div>
          </div>

          {/* Navigation (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <span className="text-[10px] font-mono text-white/40 tracking-[0.2em] uppercase block">
              {t('NAVIGATION', 'NAVIGASI')}
            </span>
            <ul className="space-y-2 text-sm font-sans font-extrabold text-zinc-300 uppercase">
              <li>
                <button onClick={() => handleScrollTo('#about-section')} className="hover:text-[#FFD700] transition-colors">
                  {t('ABOUT', 'TENTANG')}
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo('#divisions-section')} className="hover:text-[#FFD700] transition-colors">
                  {t('DIVISIONS', 'DIVISI')}
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo('#timeline-section')} className="hover:text-[#FFD700] transition-colors">
                  {t('TIMELINE', 'LINI MASA')}
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo('#gallery-section')} className="hover:text-[#FFD700] transition-colors">
                  {t('GALLERY', 'GALERI')}
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo('#contact-section')} className="hover:text-[#FFD700] transition-colors">
                  {t('CONTACT', 'KONTAK')}
                </button>
              </li>
            </ul>
          </div>

          {/* Follow Us (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-[10px] font-mono text-white/40 tracking-[0.2em] uppercase block">
              {t('FOLLOW US', 'IKUTI KAMI')}
            </span>
            <ul className="space-y-2 text-sm font-sans font-extrabold text-zinc-300 uppercase">
              <li>
                <a href="https://instagram.com/ericunj.official" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFD700] transition-colors">
                  INSTAGRAM
                </a>
              </li>
              <li>
                <a href="https://ericunj.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFD700] transition-colors">
                  WEBSITE
                </a>
              </li>
              <li>
                <a href="https://linktr.ee/eric2026" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFD700] transition-colors">
                  LINKTREE
                </a>
              </li>
              <li>
                <a href="https://wa.me/6285176706421" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFD700] transition-colors">
                  WHATSAPP
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Contact (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <span className="text-[10px] font-mono text-white/40 tracking-[0.2em] uppercase block">
              {t('QUICK CONTACT', 'KONTAK CEPAT')}
            </span>
            <p className="text-zinc-500 font-mono text-[11px] uppercase leading-relaxed">
              {t('Reach out to our team for registration assistance, partnership inquiries, or any questions about ERIC 2026.', 'Hubungi tim kami untuk bantuan pendaftaran, kerja sama, atau pertanyaan seputar ERIC 2026.')}
            </p>
            <a
              id="footer-contact-btn"
              href="https://wa.me/6285176706421"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 justify-center w-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-mono text-xs uppercase py-3.5 px-4 rounded-xl transition-all duration-300 hover:border-[#FFD700]/40"
            >
              <MessageCircle className="w-4 h-4 text-[#FFD700]" />
              <span>{t('CONTACT ADMIN', 'HUBUNGI ADMIN')} ↗</span>
            </a>
          </div>

        </div>

        {/* Supported By */}
        <div className="pb-12 border-b border-white/5 mb-8">
          <div className="flex flex-col items-center gap-6">
            <span className="text-[9px] font-mono text-zinc-600 tracking-[0.3em] uppercase">
              {t('SUPPORTED BY', 'DIDUKUNG OLEH')}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {SUPPORTED_BY.map((org) => {
                const showLogo = org.logo && !imgErrors[org.name];
                return (
                  <div key={org.name} className="flex flex-col items-center gap-1.5">
                    {showLogo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        onError={() => setImgErrors(prev => ({ ...prev, [org.name]: true }))}
                        className="h-16 md:h-20 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <span className="text-xs font-sans font-black text-zinc-500 uppercase tracking-wider hover:text-white transition-colors">
                        {org.initials}
                      </span>
                    )}
                    <span className="text-[7px] font-mono text-zinc-600 text-center max-w-[90px] leading-tight">
                      {org.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map Embed */}
        <div className="pb-12 border-b border-white/5 mb-8">
          <a
            href="https://maps.google.com/?q=Jakarta+State+University+UNJ"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full overflow-hidden rounded-2xl border border-white/5 hover:border-white/20 transition-all group cursor-pointer"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.524925131114!2d106.87646361098034!3d-6.194253660659953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f4ed14403213%3A0x2412a91a0f6a01c8!2sJakarta%20State%20University!5e0!3m2!1sen!2sid!4v1782965191096!5m2!1sen!2sid"
              width="100%"
              height="300"
              style={{ border: 0, pointerEvents: 'none' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="UNJ Campus Map"
              className="rounded-2xl"
            />
          </a>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider text-center md:text-left">
            <span>© 2026 Electronics and Robotics Innovation Competition. </span>
            <span className="block md:inline mt-1 md:mt-0 text-white/30">
              Organized by Universitas Negeri Jakarta (UNJ).
            </span>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 hover:text-white transition-colors duration-300">
            <span>{t('CREATED WITH', 'DIBUAT DENGAN')}</span>
            <Heart className="w-3.5 h-3.5 text-[#FFD700] animate-pulse fill-[#FFD700]" />
            <span>{t('FOR THE FUTURE OF ROBOTICS', 'UNTUK MASA DEPAN ROBOTIKA')}</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
