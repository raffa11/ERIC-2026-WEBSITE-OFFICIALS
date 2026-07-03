/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { X, AlertCircle } from 'lucide-react';
import { getSupabaseAuth } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; method: string }) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const { t } = useLanguage();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setAuthError('');

    const auth = getSupabaseAuth();
    if (!auth) {
      setAuthError('Supabase not configured.');
      setIsGoogleLoading(false);
      return;
    }

    const { error } = await auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });

    if (error) {
      setAuthError(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          <motion.div
            id="login-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_35px_80px_rgba(0,0,0,0.95)] overflow-hidden z-10"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFD700] to-[#0047AB]" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {isGoogleLoading ? (
              <motion.div
                key="google-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center space-y-6 select-none"
              >
                <div className="w-16 h-16 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-wider">
                    CONNECTING GOOGLE ACCOUNT
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">
                    Redirecting to accounts.google.com...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="google-login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 pt-10"
              >
                <div className="text-center space-y-2 select-none">
                  <h3 className="text-2xl md:text-3xl font-sans font-black text-white uppercase tracking-tight">
                    {t('SIGN IN', 'MASUK')}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 uppercase leading-relaxed">
                    {t('Sign in with Google to access your dashboard and register for divisions.', 'Masuk dengan Google untuk mengakses dasbor dan mendaftar divisi.')}
                  </p>
                </div>

                {authError && (
                  <div className="p-3 border border-red-500/20 bg-red-500/10 rounded-xl flex gap-2 items-center text-[11px] text-red-400 font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white font-sans text-sm font-bold tracking-wide uppercase rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>{t('Continue with Google', 'Lanjutkan dengan Google')}</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
