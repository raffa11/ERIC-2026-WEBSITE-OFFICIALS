/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SIDE CONNECT — Landing Page Section
 */

import React from 'react';
import { useLanguage } from './LanguageContext';
import { SIDE_CONNECT_DIVISIONS } from '../data';
import { Lightbulb, BookOpen, Compass, Zap, Globe, Users, ArrowRight } from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Lightbulb, BookOpen, Compass,
};

interface SideConnectProps {
  onRegisterClick: () => void;
}

export default function SideConnect({ onRegisterClick }: SideConnectProps) {
  const { t } = useLanguage();

  return (
    <section id="side-connect-section" className="relative py-16 md:py-28 bg-[#050505] border-t border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FF88]/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono text-[#00FF88] tracking-[0.4em] uppercase mb-4 bg-[#00FF88]/5 border border-[#00FF88]/15 rounded-full px-4 py-1.5">
            <Zap className="w-3 h-3" />
            <span>{t('FREE SIDE EVENT', 'SIDE EVENT GRATIS')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-sans font-black tracking-tighter text-white uppercase leading-none mb-3">
            {t('SIDE', '')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC6A]">{t('CONNECT', 'CONNECT')}</span>
          </h2>
          <p className="text-[#B3B3B3] font-mono text-xs sm:text-sm uppercase max-w-2xl mx-auto leading-relaxed">
            {t(
              '3 sub-competitions \u2022 100% Online \u2022 Open to all ages & countries \u2022 Individual or Teams (Max 3)',
              '3 sub-kompetisi \u2022 100% Daring \u2022 Terbuka untuk semua usia & negara \u2022 Individual atau Tim (Maks 3)'
            )}
          </p>
        </div>

        {/* Date Banner */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[#00FF88]/30" />
          <span className="text-[10px] font-mono text-[#00FF88] tracking-widest uppercase bg-[#00FF88]/5 border border-[#00FF88]/15 rounded-full px-4 py-1.5">
            {t('AUGUST 24 \u2013 SEPTEMBER 15', '24 AGUSTUS \u2013 15 SEPTEMBER')}
          </span>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[#00FF88]/30" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {SIDE_CONNECT_DIVISIONS.map((div) => {
            const Icon = ICON_MAP[div.icon] || Lightbulb;
            return (
              <div
                key={div.id}
                className="group relative bg-zinc-900/30 border border-white/5 rounded-2xl p-6 hover:border-[#00FF88]/20 hover:bg-zinc-900/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-[#00FF88]/5 border border-[#00FF88]/10 rounded-xl group-hover:bg-[#00FF88]/10 transition-colors">
                    <Icon className="w-5 h-5 text-[#00FF88]" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">{div.title}</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t(div.description, div.descriptionID)}
                </p>
              </div>
            );
          })}
        </div>

        {/* What to Submit */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-6 mb-10">
          <h3 className="text-xs font-mono text-[#FFD700] uppercase tracking-widest mb-4">{t('WHAT TO SUBMIT?', 'APA YANG HARUS DISUBMISI?')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {[
              t('Product Description', 'Deskripsi Produk'),
              t('How It Works', 'Cara Kerja'),
              t('Product Design', 'Desain Produk'),
              t('Benefits', 'Manfaat'),
              t('Experience', 'Pengalaman'),
              t('Certificate & New Skills', 'Sertifikat & Skill Baru'),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Who Can Join */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Globe, label: t('Open to all ages & countries', 'Terbuka untuk semua usia & negara') },
            { icon: Users, label: t('Individual or Teams (Max 3)', 'Individual atau Tim (Maks 3)') },
            { icon: Zap, label: t('100% Online & FREE', '100% Daring & GRATIS') },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-zinc-900/20 border border-white/5 rounded-xl px-4 py-3">
              <item.icon className="w-4 h-4 text-[#00FF88] shrink-0" />
              <span className="text-xs text-zinc-300">{item.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onRegisterClick}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#00FF88] text-black font-black text-sm uppercase tracking-wider rounded-2xl hover:bg-[#00CC6A] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] cursor-pointer"
          >
            {t('REGISTER NOW — FREE', 'DAFTAR SEKARANG — GRATIS')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
