/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { Mail, MessageCircle, Instagram, Globe, MapPin, Building, ShieldAlert, Link2 } from 'lucide-react';

export default function ContactSection() {
  const { t } = useLanguage();

  const organizerDetails = {
    program: 'Electronics Engineering Education Program',
    programID: 'Program Studi Pendidikan Teknik Elektronika',
    faculty: 'Faculty of Engineering',
    facultyID: 'Fakultas Teknik',
    university: 'Universitas Negeri Jakarta (UNJ)',
    address: 'BEM - Program Studi Pendidikan Teknik Elektronika, Fakultas Teknik - Universitas Negeri Jakarta, Kampus A (Kampus Utama), Jl. Rawamangun Muka, Jakarta Timur 13220, Indonesia',
    addressEN: 'Student Executive Board (BEM) - Electronics Engineering Education Program, Faculty of Engineering - Jakarta State University (UNJ), Main Campus (Kampus A), Jl. Rawamangun Muka, East Jakarta 13220, Indonesia'
  };

  const contactChannels = [
    {
      id: 'website',
      icon: Globe,
      label: 'WEBSITE ERIC',
      value: 'ericunj.org',
      href: 'https://ericunj.org',
      accentColor: '#FFD700',
      hoverGlow: 'rgba(255, 215, 0, 0.15)'
    },
    {
      id: 'instagram',
      icon: Instagram,
      label: 'INSTAGRAM',
      value: '@ericunj.official',
      href: 'https://instagram.com/ericunj.official',
      accentColor: '#0047AB',
      hoverGlow: 'rgba(0, 71, 171, 0.15)'
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WHATSAPP ADMIN',
      value: 'wa.me/+6285176706421 (Ariful)',
      href: 'https://wa.me/6285176706421',
      accentColor: '#FFE44D',
      hoverGlow: 'rgba(77, 255, 184, 0.15)'
    },
    {
      id: 'email-resmi',
      icon: Mail,
      label: 'EMAIL RESMI',
      value: 'ericunjofficial2026@gmail.com',
      href: 'mailto:ericunjofficial2026@gmail.com',
      accentColor: '#C5A059',
      hoverGlow: 'rgba(197, 160, 89, 0.15)'
    },
    {
      id: 'linktree',
      icon: Link2,
      label: 'LINKTREE',
       value: 'linktr.ee/eric2026',
      href: 'https://linktr.ee/eric2026',
      accentColor: '#C5A059',
      hoverGlow: 'rgba(197, 160, 89, 0.15)'
    },
    {
      id: 'hotel',
      icon: Building,
      label: 'HOTEL INFO',
      value: 'Hotel Information',
      href: 'https://drive.google.com/drive/folders/1WWtwQr2UulH9DyvNvscbGtvGo9_Q-oLl',
      accentColor: '#FFE44D',
      hoverGlow: 'rgba(77, 255, 184, 0.15)'
    }
  ];

  return (
    <section id="contact-section" className="relative py-28 bg-[#0D0D0D] border-t border-white/5 overflow-hidden">
      {/* Light highlights */}
      <div className="absolute left-[10%] bottom-[-10%] w-[450px] h-[450px] rounded-full bg-[#0047AB]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Section Heading */}
        <div className="mb-16 select-none">
          <div className="flex items-center gap-3 text-xs font-mono text-[#FFD700] tracking-[0.4em] uppercase mb-4">
            <ShieldAlert className="w-4 h-4 text-[#FFD700]" />
            <span>COMPETITION INFORMATION</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-sans font-black tracking-tighter text-white uppercase leading-none">
            HAVE ANY QUESTIONS? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFE44D]">WE'RE READY TO HELP!</span>
          </h2>
          <p className="text-zinc-400 font-mono text-sm uppercase tracking-wider mt-4 max-w-2xl leading-relaxed">
            Use the following contacts to reach the appropriate team.
          </p>
        </div>

        {/* Left-Right Dual Column Editorial Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT: Organizer details with high impact metal plates */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-950 border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.8)]">

              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <Building className="w-5 h-5 text-[#FFD700]" />
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest font-black">
                  OFFICIAL ORGANIZER
                </span>
              </div>

              <div className="space-y-4 select-none">
                <div>
                  <h4 className="text-sm font-mono text-[#FFD700] uppercase tracking-wide">
                    {t('DEPARTMENT', 'PROGRAM STUDI')}
                  </h4>
                  <p className="text-white text-lg font-sans font-extrabold tracking-tight uppercase leading-snug">
                    {t(organizerDetails.program, organizerDetails.programID)}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-mono text-zinc-500 uppercase tracking-wide">
                    {t('FACULTY & INSTITUTION', 'FAKULTAS & UNIVERSITAS')}
                  </h4>
                  <p className="text-zinc-200 text-sm font-mono uppercase font-black leading-snug">
                    {t(organizerDetails.faculty, organizerDetails.facultyID)}
                  </p>
                  <p className="text-zinc-400 text-xs font-mono uppercase mt-1">
                    {organizerDetails.university}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4 flex gap-3 items-start mt-6">
                  <MapPin className="w-4 h-4 text-[#C5A059] mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wide font-black">
                      CAMPUS HEADQUARTERS ADDRESS
                    </h4>
                    <p className="text-zinc-300 text-xs leading-relaxed uppercase font-mono mt-1">
                      {t(organizerDetails.addressEN, organizerDetails.address)}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT: Grid of premium contact channel hover cards (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
            {contactChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <motion.a
                  id={`contact-card-${channel.id}`}
                  key={channel.id}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-6 bg-zinc-950 border border-white/5 rounded-2xl flex flex-col justify-between min-h-[180px] hover:border-white/20 transition-all duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  whileHover={{ y: -4 }}
                >
                  {/* Glowing background */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-[20px] transition-opacity duration-300 rounded-2xl pointer-events-none"
                    style={{ backgroundColor: channel.hoverGlow }}
                  />

                  {/* Corner tag lines */}
                  <div className="absolute top-4 right-4 text-[7px] font-mono text-white/15 uppercase font-bold tracking-widest select-none">
                    OFFICIAL
                  </div>

                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-transparent transition-colors duration-300"
                    style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  >
                    <Icon
                      className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ color: channel.accentColor }}
                    />
                  </div>

                  {/* Value definitions */}
                  <div className="space-y-1 relative z-10">
                    <span className="text-[9.5px] font-mono text-zinc-500 tracking-wider block font-bold">
                      {channel.label}
                    </span>
                    <span className="text-sm font-mono text-white group-hover:text-[#FFD700] transition-colors font-black block leading-none">
                      {channel.value}
                    </span>
                    <span className="text-[8.5px] font-mono text-zinc-600 group-hover:text-zinc-400 block pt-1 uppercase">
                      Connect instantly ↗
                    </span>
                  </div>

                </motion.a>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
