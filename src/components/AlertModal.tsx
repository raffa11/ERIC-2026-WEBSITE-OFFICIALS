import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X, CheckCircle, Trash2 } from 'lucide-react';

interface AlertOptions {
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
}

interface ConfirmOptions {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(null);
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);

  const showAlert = useCallback(({ message, type = 'error' }: AlertOptions) => {
    setAlert({ message, type });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setConfirm(options);
  }, []);

  const closeAlert = () => setAlert(null);
  const closeConfirm = () => setConfirm(null);

  const handleConfirm = () => {
    confirm?.onConfirm();
    setConfirm(null);
  };

  const handleCancel = () => {
    confirm?.onCancel?.();
    setConfirm(null);
  };

  const accentColor = alert?.type === 'error' ? 'red' 
    : alert?.type === 'success' ? '#00FF88'
    : alert?.type === 'warning' ? '#FFD700'
    : '#0047AB';

  const borderColor = alert?.type === 'error' ? 'border-red-500/30'
    : alert?.type === 'success' ? 'border-[#00FF88]/30'
    : alert?.type === 'warning' ? 'border-[#FFD700]/30'
    : 'border-[#0047AB]/30';

  const confirmAccent = confirm?.type === 'danger' ? 'red'
    : confirm?.type === 'warning' ? '#FFD700'
    : '#0047AB';

  const confirmBorder = confirm?.type === 'danger' ? 'border-red-500/30'
    : confirm?.type === 'warning' ? 'border-[#FFD700]/30'
    : 'border-[#0047AB]/30';

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Alert Modal */}
      <AnimatePresence>
        {alert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={closeAlert} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-950 border rounded-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)] z-10"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none rounded-2xl" />
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[${accentColor}] to-transparent rounded-t-2xl`} />

              <button
                onClick={closeAlert}
                className="absolute top-3 right-3 p-1.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer z-20"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-4 pt-2">
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
                  alert.type === 'error' ? 'bg-red-950/30 border-red-500/20' 
                  : alert.type === 'success' ? 'bg-[#00FF88]/10 border-[#00FF88]/20'
                  : alert.type === 'warning' ? 'bg-[#FFD700]/10 border-[#FFD700]/20'
                  : 'bg-[#0047AB]/10 border-[#0047AB]/20'
                }`}>
                  {alert.type === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : alert.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-[#00FF88]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#FFD700]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-sans font-bold text-white leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={closeAlert}
                  className={`px-6 py-2.5 font-sans font-black text-xs tracking-widest uppercase rounded-xl transition-all cursor-pointer ${
                    alert.type === 'error'
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : alert.type === 'success'
                        ? 'bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] hover:bg-[#00FF88]/20'
                        : 'bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/20'
                  }`}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={handleCancel} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-950 border rounded-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)] z-10"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none rounded-2xl" />
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[${confirmAccent}] to-transparent rounded-t-2xl`} />

              <button
                onClick={handleCancel}
                className="absolute top-3 right-3 p-1.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer z-20"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-4 pt-2">
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
                  confirm.type === 'danger' ? 'bg-red-950/30 border-red-500/20'
                  : confirm.type === 'warning' ? 'bg-[#FFD700]/10 border-[#FFD700]/20'
                  : 'bg-[#0047AB]/10 border-[#0047AB]/20'
                }`}>
                  {confirm.type === 'danger' ? (
                    <Trash2 className="w-5 h-5 text-red-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#FFD700]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-sans font-bold text-white leading-relaxed">
                    {confirm.message}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 font-sans font-black text-xs tracking-widest uppercase rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                >
                  {confirm.cancelLabel || 'BATAL'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-6 py-2.5 font-sans font-black text-xs tracking-widest uppercase rounded-xl transition-all cursor-pointer ${
                    confirm.type === 'danger'
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/20'
                  }`}
                >
                  {confirm.confirmLabel || 'HAPUS'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
