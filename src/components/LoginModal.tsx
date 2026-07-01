/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { X, LogIn, AlertCircle, Sparkles, Terminal } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; method: string }) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const { t } = useLanguage();
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'google-loading'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // Sign In Trigger
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Please fill out all login files.');
      return;
    }
    setAuthError('');
    const userSession = {
      name: authEmail.split('@')[0].toUpperCase(),
      email: authEmail,
      method: 'email'
    };
    onLoginSuccess(userSession);
    onClose();
  };

  // Sign Up Trigger
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName || !authEmail || !authPassword) {
      setAuthError('All registration items are mandatory.');
      return;
    }
    setAuthError('');
    const userSession = {
      name: authName,
      email: authEmail,
      method: 'email'
    };
    onLoginSuccess(userSession);
    onClose();
  };

  // Google SSO Simulation
  const handleGoogleLogin = () => {
    setAuthMode('google-loading');
    setAuthError('');
    setTimeout(() => {
      const googleSession = {
        name: 'ALFARIZI MUHAMMAD RAFFA',
        email: 'alfarizimuhammadraffa@gmail.com',
        method: 'google'
      };
      onLoginSuccess(googleSession);
      setAuthMode('signin');
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          {/* Backdrop Closer */}
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          {/* Core Card Container */}
          <motion.div
            id="login-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_35px_80px_rgba(0,0,0,0.95)] overflow-hidden z-10"
          >
            {/* Design grid outline */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00FF88] to-[#0047AB]" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <AnimatePresence mode="wait">
              {authMode === 'google-loading' ? (
                <motion.div
                  key="google-loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center space-y-6 select-none"
                >
                  <div className="w-16 h-16 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-sans font-black text-white uppercase tracking-wider">
                      CONNECTING GOOGLE ACCOUNT
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">
                      Redirecting handshake to core accounts.google.com API...
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="auth-forms"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Top Header */}
                  <div className="space-y-2 select-none">
                    <div className="inline-flex items-center gap-1.5 bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" />
                      <span>{t('VERIFIED SECURE HUB', 'PORTAL AMAN TERVERIFIKASI')}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-sans font-black text-white uppercase tracking-tight">
                      {authMode === 'signin' ? t('SIGN IN', 'MASUK AKUN') : t('CREATE ACCOUNT', 'BUAT AKUN')}
                    </h3>
                    <p className="text-xs font-mono text-zinc-400 uppercase leading-relaxed">
                      {t('Sign in to access your dashboard, manage teams, and register for divisions.', 'Masuk untuk mengakses dasbor Anda, mengelola tim, dan mendaftar divisi.')}
                    </p>
                  </div>

                  {/* Switch tabs between Sign In and Sign Up */}
                  <div className="flex gap-4 border-b border-white/5 pb-2">
                    <button
                      onClick={() => {
                        setAuthMode('signin');
                        setAuthError('');
                      }}
                      className={`text-xs font-mono pb-2 uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                        authMode === 'signin' ? 'text-[#00FF88] border-[#00FF88] font-bold' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                      }`}
                    >
                      {t('Sign In', 'Masuk')}
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthError('');
                      }}
                      className={`text-xs font-mono pb-2 uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                        authMode === 'signup' ? 'text-[#00FF88] border-[#00FF88] font-bold' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                      }`}
                    >
                      {t('Create Account', 'Daftar Baru')}
                    </button>
                  </div>

                  {/* Error Indicator */}
                  {authError && (
                    <div className="p-3 border border-red-500/20 bg-red-500/10 rounded-xl flex gap-2 items-center text-[11px] text-red-400 font-mono">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Form fields */}
                  {authMode === 'signin' ? (
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Email Address', 'Alamat Email')}</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g., name@domain.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Password', 'Kata Sandi')}</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-[#00FF88] to-[#4DFFB8] text-black font-sans font-black text-xs tracking-wider uppercase rounded-xl hover:scale-101 transition-all cursor-pointer flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.15)]"
                      >
                        <LogIn className="w-4 h-4 text-black" />
                        <span>{t('SECURE LOGIN', 'MASUK SEKARANG')}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Full Name', 'Nama Lengkap')}</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Alfarizi Raffa"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Email Address', 'Alamat Email')}</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g., alfarizimuhammadraffa@gmail.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">{t('Password', 'Kata Sandi')}</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/5 focus:border-[#00FF88] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-zinc-900 text-[#00FF88] border border-[#00FF88]/30 font-sans font-black text-xs tracking-wider uppercase rounded-xl hover:bg-zinc-950 hover:border-[#00FF88]/50 transition-colors cursor-pointer flex justify-center items-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>{t('CREATE ACCOUNT', 'DAFTAR SEKARANG')}</span>
                      </button>
                    </form>
                  )}

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-3 text-zinc-600 font-mono text-[9px] uppercase">{t('OR CONNECT INSTANTLY', 'ATAU HUBUNGKAN INSTAN')}</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  {/* Google SSO Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-900/80 border border-white/10 hover:border-white/20 text-white font-sans text-xs font-bold tracking-wide uppercase rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>{t('Continue with Google', 'Lanjutkan dengan Google')}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
