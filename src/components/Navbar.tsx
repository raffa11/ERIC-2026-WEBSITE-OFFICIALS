/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import EricLogo from './EricLogo';
import { Menu, X, Globe, Trophy, LogIn, LogOut, User, Shield } from 'lucide-react';
import { ADMIN_EMAILS } from '../types';
import { SUPPORTED_BY } from '../data';

interface NavbarProps {
  currentUser: { name: string; email: string; method: string } | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onAdminDashboardClick: () => void;
  onMyRegistrationsClick: () => void;
  currentView: 'landing' | 'admin-dashboard';
  onBackToHome: () => void;
}

export default function Navbar({ 
  currentUser, 
  onLogout, 
  onLoginClick,
  onAdminDashboardClick,
  onMyRegistrationsClick,
  currentView,
  onBackToHome
}: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = currentUser && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase());

  // Monitor scroll height
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('ABOUT', 'TENTANG'), href: '#about-section' },
    { label: t('DIVISIONS', 'DIVISI'), href: '#divisions-section' },
    { label: t('TIMELINE', 'LINI MASA'), href: '#timeline-section' },
    { label: t('GALLERY', 'GALERI'), href: '#gallery-section' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      // Offset slightly for sticky navbar
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav
        id="navbar-root"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-4 px-6 ${
          isScrolled
            ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo linkage */}
          <a href="#" className="focus:outline-none">
            <EricLogo className="w-24 h-24" src="/images/eric-logo.png" showText={true} title="INTERNATIONAL ERIC" subtitle="ROBOTICS LIGA" />
          </a>

          {/* Desktop Nav Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  id={`nav-link-${link.href}`}
                  key={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  className="font-sans text-[11px] font-bold tracking-widest text-[#B3B3B3] hover:text-[#00FF88] transition-colors uppercase relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00FF88] transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </div>

            {/* Premium Language Toggler Toggle */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 p-1 rounded-md select-none">
              <button
                id="btn-lang-en"
                onClick={() => setLang('EN')}
                className={`px-2.5 py-1 text-[10px] font-mono rounded transition-all duration-200 ${
                  lang === 'EN'
                    ? 'bg-[#0047AB] text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                EN
              </button>
              <button
                id="btn-lang-id"
                onClick={() => setLang('ID')}
                className={`px-2.5 py-1 text-[10px] font-mono rounded transition-all duration-200 ${
                  lang === 'ID'
                    ? 'bg-[#C5A059] text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                ID
              </button>
            </div>

            {/* Login / Profile action button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 bg-zinc-900 border ${isAdmin ? 'border-[#FFD700]/30' : 'border-white/5'} rounded-full pl-2.5 pr-4 py-1.5 select-none`}>
                  <div className={`w-5 h-5 rounded-full ${isAdmin ? 'bg-gradient-to-tr from-[#D4AF37] to-[#FFD700]' : 'bg-gradient-to-tr from-[#0047AB] to-[#00FF88]'} flex items-center justify-center font-sans font-black text-[9px] text-white`}>
                    {currentUser.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] text-zinc-300 font-bold uppercase max-w-[100px] truncate leading-tight">
                      {currentUser.name}
                    </span>
                    {isAdmin && (
                      <span className="text-[7px] font-mono text-[#FFD700] uppercase font-black tracking-widest leading-none mt-0.5">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>
                <button
                  id="nav-btn-logout"
                  onClick={onLogout}
                  className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-red-500/20 text-zinc-400 hover:text-red-400 rounded-full transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="nav-btn-login"
                onClick={onLoginClick}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[10px] font-bold uppercase px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#00FF88]" />
                <span>{t('LOGIN', 'MASUK')}</span>
              </button>
            )}

            {/* Dashboard / Registrations custom access tabs */}
            {currentUser && (
              isAdmin ? (
                currentView === 'admin-dashboard' ? (
                  <button
                    onClick={onBackToHome}
                    className="px-3.5 py-1.5 bg-[#FFD700]/10 hover:bg-[#FFD700]/25 border border-[#FFD700]/30 hover:border-[#FFD700] text-[10px] font-mono text-[#FFD700] font-bold rounded-full transition-all cursor-pointer uppercase"
                  >
                    {t('BACK TO BERANDA', 'KEMBALI KE BERANDA')}
                  </button>
                ) : (
                  <button
                    onClick={onAdminDashboardClick}
                    className="px-3.5 py-1.5 bg-[#FFD700]/10 hover:bg-[#FFD700]/25 border border-[#FFD700]/30 hover:border-[#FFD700] text-[10px] font-mono text-[#FFD700] font-bold rounded-full transition-all cursor-pointer uppercase animate-pulse"
                  >
                    {t('ADMIN DASHBOARD', 'DASHBOARD ADMIN')}
                  </button>
                )
              ) : (
                <button
                  onClick={onMyRegistrationsClick}
                  className="px-3.5 py-1.5 bg-[#00FF88]/10 hover:bg-[#00FF88]/25 border border-[#00FF88]/30 hover:border-[#00FF88] text-[10px] font-mono text-[#00FF88] font-bold rounded-full transition-all cursor-pointer uppercase"
                >
                  {t('MY REGISTRATIONS', 'PENDAFTARAN SAYA')}
                </button>
              )
            )}

          </div>

          {/* Right Mobile Actions */}
          <div className="flex items-center gap-4 lg:hidden">
            {/* Quick Lang Indicator */}
            <button
              id="mobile-lang-swap"
              onClick={() => setLang(lang === 'EN' ? 'ID' : 'EN')}
              className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/5 px-2 py-1 rounded"
            >
              <Globe className="w-3.5 h-3.5 text-[#00FF88]" />
              <span>{lang}</span>
            </button>

            {/* Menu Hamburger */}
            <button
              id="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 bg-zinc-900 border border-white/10 rounded-lg text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

          {/* Partner Institution Logos Strip - appears on scroll */}
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden lg:flex items-center justify-center gap-6 mt-2 pt-2 border-t border-white/5"
            >
              <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest mr-1">Supported by</span>
              {SUPPORTED_BY.map((org) => (
                <div key={org.name} className="flex items-center opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-[8px] font-sans font-black text-zinc-500 uppercase tracking-wider">{org.initials}</span>
                </div>
              ))}
            </motion.div>
          )}
      </motion.nav>

      {/* FULL SCREEN MOBILE OVERLAY DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-drawer"
            className="fixed inset-0 bg-[#050505] z-45 flex flex-col pt-24 px-8"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
          >
            {/* Background design accents */}
            <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-[#00FF88]/5 blur-[90px] pointer-events-none" />

            <div className="space-y-6 mt-6">
              {navLinks.map((link, idx) => (
                <motion.button
                  id={`mobile-nav-link-${link.href}`}
                  key={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  className="w-full text-left text-3xl font-sans font-black text-white hover:text-[#00FF88] transition-colors uppercase tracking-tight block"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <span className="text-zinc-600 font-mono text-sm mr-4">0{idx + 1}</span>
                  {link.label}
                </motion.button>
              ))}

              {/* Mobile Profile or Login buttons */}
              {currentUser ? (
                <div className="space-y-4 pt-4 border-t border-white/5 select-none">
                  <div className={`flex items-center gap-3 bg-zinc-900 border ${isAdmin ? 'border-[#FFD700]/30' : 'border-white/5'} rounded-2xl p-4`}>
                    <div className={`w-10 h-10 rounded-full ${isAdmin ? 'bg-gradient-to-tr from-[#D4AF37] to-[#FFD700]' : 'bg-gradient-to-tr from-[#0047AB] to-[#00FF88]'} flex items-center justify-center font-sans font-black text-xs text-white`}>
                      {currentUser.name[0]}
                    </div>
                    <div>
                      <div className={`text-[9px] font-mono uppercase tracking-widest font-black ${isAdmin ? 'text-[#FFD700]' : 'text-zinc-500'}`}>
                        {isAdmin ? 'AUTHENTICATED ADMINISTRATOR' : 'AUTHENTICATED USER'}
                      </div>
                      <div className="text-sm font-sans font-black text-white uppercase tracking-tight">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#00FF88]">{currentUser.email}</div>
                    </div>
                  </div>
                  {isAdmin ? (
                    <button
                      id="mobile-nav-admin"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (currentView === 'admin-dashboard') {
                          onBackToHome();
                        } else {
                          onAdminDashboardClick();
                        }
                      }}
                      className="w-full py-3 bg-[#FFD700]/10 border border-[#FFD700]/30 text-xs font-mono text-[#FFD700] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex justify-center items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{currentView === 'admin-dashboard' ? t('BACK TO BERANDA', 'KEMBALI KE BERANDA') : t('ADMIN DASHBOARD', 'DASHBOARD ADMIN')}</span>
                    </button>
                  ) : (
                    <button
                      id="mobile-nav-registrations"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onMyRegistrationsClick();
                      }}
                      className="w-full py-3 bg-[#00FF88]/10 border border-[#00FF88]/20 text-xs font-mono text-[#00FF88] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex justify-center items-center gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>{t('MY REGISTRATIONS', 'PENDAFTARAN SAYA')}</span>
                    </button>
                  )}
                  <button
                    id="mobile-nav-logout"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-3 bg-zinc-950 border border-red-500/10 hover:border-red-500/30 text-xs font-mono text-red-400 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex justify-center items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>DISCONNECT SECURE HUB</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/5">
                  <button
                    id="mobile-nav-login"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLoginClick();
                    }}
                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl border border-white/5 hover:border-white/15 transition-all cursor-pointer flex justify-center items-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-[#00FF88]" />
                    <span>{t('SIGN IN TO HUB', 'MASUK KE PORTAL')}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-auto mb-10 text-xs font-mono text-zinc-500 border-t border-white/5 pt-6 space-y-2 select-none">
              <div>ERIC 2026 // ROBOTICS GRAND CHAMPIONSHIP</div>
              <div>INDONESIA'S PREMIER ELECTRONICS HUB</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
