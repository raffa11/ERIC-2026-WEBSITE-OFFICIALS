import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { COMPETITION_DIVISIONS } from '../data';
import { Registration } from '../types';
import { getGoogleScriptUrl } from '../lib/googleSheet';
import {
  Camera, Search, CheckCircle, XCircle, AlertCircle,
  ArrowLeft, User, Hash, Trophy, Loader2, Smartphone,
  QrCode, MessageCircle, ExternalLink
} from 'lucide-react';

declare function require(name: string): any;

interface CheckInPanelProps {
  registrations: Registration[];
  onUpdateRegistrations: (newRegs: Registration[]) => void;
  onBack: () => void;
}

export default function CheckInPanel({ registrations, onUpdateRegistrations, onBack }: CheckInPanelProps) {
  const { t } = useLanguage();

  const [mode, setMode] = useState<'scanner' | 'manual' | 'result'>('scanner');
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [participant, setParticipant] = useState<Registration | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraReady(true);
        setCameraError('');
      }
    } catch (err: any) {
      setCameraError('Camera access denied or not available. Please use manual input.');
      setCameraReady(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const findParticipant = useCallback((code: string): Registration | null => {
    const trimmed = code.trim().toUpperCase();
    return registrations.find((r) => r.refCode.toUpperCase() === trimmed) || null;
  }, [registrations]);

  const handleScannedCode = useCallback((code: string) => {
    if (!code) return;
    stopCamera();

    const found = findParticipant(code);
    setScannedCode(code);
    setParticipant(found);
    setMode('result');

    if (!found) {
      setError('Participant not found. The registration code is invalid.');
    } else {
      setError('');
    }
  }, [findParticipant, stopCamera]);

  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      setError('Please enter a registration code.');
      return;
    }
    const found = findParticipant(manualCode);
    setScannedCode(manualCode.trim().toUpperCase());
    setParticipant(found);
    setMode('result');

    if (!found) {
      setError('Participant not found. The registration code is invalid.');
    } else {
      setError('');
    }
  };

  const handleCheckIn = async () => {
    if (!participant) return;

    const updated = {
      ...participant,
      paymentStatus: 'CHECKED IN',
    };

    // Optimistically update local state
    const newRegs = registrations.map((r) =>
      r.id === participant.id ? updated : r
    );
    onUpdateRegistrations(newRegs);
    setSuccessMsg(`${participant.teamName} — ${t('CHECKED IN successfully!', 'BERHASIL CHECK IN!')}`);
    setParticipant(updated);

    // Persist to Google Sheets
    const scriptUrl = getGoogleScriptUrl();
    if (scriptUrl) {
      try {
        const res = await fetch(`${scriptUrl}?action=checkin&refCode=${encodeURIComponent(participant.refCode)}`);
        const json = await res.json();
        if (json.status === 'error') {
          console.warn('Sheet sync failed:', json.message);
        }
      } catch (err) {
        console.warn('Sheet sync error:', err);
      }
    }
  };

  const handleReset = () => {
    stopCamera();
    setMode('scanner');
    setScannedCode('');
    setManualCode('');
    setParticipant(null);
    setError('');
    setSuccessMsg('');
    setCameraError('');
    startCamera();
  };

  const handleScanAgain = () => {
    setSuccessMsg('');
    handleReset();
  };

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const jsQR = (window as any).jsQR;
    if (jsQR) {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        handleScannedCode(code.data);
      }
    }
  }, [handleScannedCode]);

  useEffect(() => {
    if (mode === 'scanner') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, startCamera, stopCamera]);

  useEffect(() => {
    if (cameraReady && videoRef.current) {
      const loadJsQR = async () => {
        const jsqrModule = await import('jsqr');
        (window as any).jsQR = jsqrModule.default;
        scanTimerRef.current = window.setInterval(scanFrame, 300);
      };
      loadJsQR();
    }
    return () => {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
      }
    };
  }, [cameraReady, scanFrame]);

  const divObj = participant ? COMPETITION_DIVISIONS.find((d) => d.id === participant.divisionId) : null;

  const checkedInCount = registrations.filter((r) => r.paymentStatus === 'CHECKED IN').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[9px] font-mono text-[#FFD700] uppercase tracking-widest font-black block">
              CHECK-IN OPERATOR
            </span>
            <h3 className="text-xl md:text-2xl font-sans font-black text-white uppercase tracking-tight">
              {t('PARTICIPANT SCANNER', 'SCANNER PESERTA')}
            </h3>
          </div>
        </div>
        <div className="px-4 py-2 bg-zinc-900 border border-[#00FF88]/30 rounded-xl text-center">
          <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">{t('CHECKED IN', 'HADIR')}</div>
          <div className="text-lg font-sans font-black text-[#00FF88]">{checkedInCount}/{registrations.length}</div>
        </div>
      </div>

      {mode === 'scanner' && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-2xl overflow-hidden border border-white/10 aspect-video max-w-md mx-auto">
            {cameraError ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Camera className="w-10 h-10 text-zinc-600 mb-3" />
                <p className="text-xs font-mono text-zinc-500 uppercase">{cameraError}</p>
                <button
                  onClick={() => setMode('manual')}
                  className="mt-4 px-4 py-2 bg-zinc-900 border border-white/10 text-xs font-mono rounded-xl hover:border-white/20 transition-all cursor-pointer"
                >
                  {t('USE MANUAL INPUT', 'GUNAKAN INPUT MANUAL')}
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-[3px] border-[#00FF88]/40 rounded-2xl pointer-events-none" />
                <div className="absolute inset-x-0 top-4 flex justify-center">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[9px] font-mono text-[#00FF88] uppercase tracking-wider flex items-center gap-1.5 border border-[#00FF88]/20">
                    <QrCode className="w-3 h-3" />
                    {t('SCAN QR CODE', 'SCAN QR CODE')}
                  </span>
                </div>
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => { stopCamera(); setMode('manual'); }}
              className="px-5 py-2.5 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Smartphone className="w-3.5 h-3.5" />
              {t('MANUAL INPUT', 'INPUT MANUAL')}
            </button>
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div className="p-5 bg-zinc-900/30 border border-white/5 rounded-2xl space-y-4">
            <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider font-bold flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" />
              {t('ENTER REGISTRATION CODE', 'MASUKAN KODE REGISTRASI')}
            </span>
            <input
              type="text"
              placeholder="e.g. ERIC-REG-SUMO-A1B2"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') handleManualSearch(); }}
              className="w-full bg-zinc-950 border border-white/10 focus:border-[#FFD700] rounded-xl px-4 py-3 text-sm text-white font-mono tracking-wider focus:outline-none uppercase"
              autoFocus
            />
            <button
              onClick={handleManualSearch}
              className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-[#FFEA85] text-black font-sans font-black text-xs tracking-widest uppercase rounded-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t('FIND PARTICIPANT', 'CARI PESERTA')}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setMode('scanner')}
              className="px-5 py-2.5 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Camera className="w-3.5 h-3.5" />
              {t('USE CAMERA SCANNER', 'GUNAKAN SCANNER KAMERA')}
            </button>
          </div>
        </div>
      )}

      {mode === 'result' && participant && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto w-full space-y-4"
        >
          {successMsg && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-sans font-black text-emerald-300 uppercase tracking-tight">
                {successMsg}
              </p>
            </div>
          )}

          <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl space-y-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${participant.paymentStatus === 'CHECKED IN' ? 'bg-emerald-500' : 'bg-[#FFD700]'}`} />

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${participant.paymentStatus === 'CHECKED IN' ? 'bg-emerald-950/30 border border-emerald-500/30' : 'bg-zinc-900 border border-white/10'}`}>
                {participant.paymentStatus === 'CHECKED IN' ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                ) : (
                  <User className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                  {participant.teamName}
                </h4>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  {divObj?.title || participant.divisionId}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
              <div className="p-3 bg-zinc-900/50 rounded-xl space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider">{t('Leader', 'Ketua')}</span>
                <div className="text-white font-bold uppercase">{participant.leader.name}</div>
              </div>
              <div className="p-3 bg-zinc-900/50 rounded-xl space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider">{t('Institution', 'Institusi')}</span>
                <div className="text-white font-bold uppercase">{participant.leader.institution}</div>
              </div>
              <div className="p-3 bg-zinc-900/50 rounded-xl space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider">{t('Code', 'Kode')}</span>
                <div className="text-[#C5A059] font-bold select-all">{participant.refCode}</div>
              </div>
              <div className="p-3 bg-zinc-900/50 rounded-xl space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider">{t('Status', 'Status')}</span>
                <div className={`font-bold uppercase ${participant.paymentStatus === 'CHECKED IN' ? 'text-emerald-400' : 'text-[#FFD700]'}`}>
                  {participant.paymentStatus}
                </div>
              </div>
            </div>

            {divObj?.whatsappGroup && (
              <a
                href={divObj.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-400/40 rounded-xl text-[10px] font-mono text-emerald-300 hover:text-emerald-200 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {t('WHATSAPP GROUP', 'GRUP WHATSAPP')} — {divObj.title.toUpperCase()}
              </a>
            )}

            <div className="flex gap-2 pt-2">
              {participant.paymentStatus !== 'CHECKED IN' ? (
                <button
                  onClick={handleCheckIn}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-sans font-black text-xs tracking-widest uppercase rounded-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('CHECK IN', 'CHECK IN')}
                </button>
              ) : (
                <div className="flex-1 py-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 font-sans font-black text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 select-none">
                  <CheckCircle className="w-4 h-4" />
                  {t('ALREADY CHECKED IN', 'SUDAH CHECK IN')}
                </div>
              )}
              <button
                onClick={handleScanAgain}
                className="px-5 py-3 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer hover:border-white/20"
              >
                {t('SCAN AGAIN', 'SCAN LAGI')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {mode === 'result' && !participant && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center space-y-6"
        >
          <div className="p-8 bg-red-950/20 border border-red-500/20 rounded-2xl space-y-4">
            <XCircle className="w-14 h-14 text-red-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                {t('PARTICIPANT NOT FOUND', 'PESERTA TIDAK DITEMUKAN')}
              </h4>
              <p className="text-xs font-mono text-zinc-500 uppercase">
                {t('Code', 'Kode')}: <span className="text-[#C5A059] font-bold">{scannedCode}</span>
              </p>
              <p className="text-[10px] font-mono text-zinc-500 uppercase leading-relaxed">
                {t('No registration matches this code. Please try again or contact the registration desk.', 'Tidak ada pendaftaran yang cocok dengan kode ini. Coba lagi atau hubungi meja pendaftaran.')}
              </p>
            </div>
          </div>
          <button
            onClick={handleScanAgain}
            className="px-6 py-3 bg-zinc-900 border border-white/10 text-xs font-mono text-white hover:border-white/20 rounded-xl transition-all cursor-pointer"
          >
            {t('TRY AGAIN', 'COBA LAGI')}
          </button>
        </motion.div>
      )}
    </div>
  );
}
