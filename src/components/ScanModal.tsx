import React, { useState, useEffect } from 'react';
import { X, Camera, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { Language, translations } from '../data/translations.ts';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userType: 'farmer' | 'urban';
}

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  lang,
  userType,
}) => {
  const [scanning, setScanning] = useState(true);
  const [analyzed, setAnalyzed] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      setAnalyzed(false);
      const timer = setTimeout(() => {
        setScanning(false);
        setAnalyzed(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#F7F5EF] rounded-2xl shadow-2xl border border-[#8FAF91]/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#8FAF91]/25">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8F1E7] flex items-center justify-center text-[#245C43]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#245C43]">
                {t.scanPlantCTA}
              </h3>
              <p className="text-xs text-[#546b5e]">
                AI Optical Pulse & Leaf Diagnostic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Simulation */}
        <div className="p-6">
          <div className="relative aspect-video sm:aspect-[4/3] rounded-xl overflow-hidden bg-[#1E2E25] flex items-center justify-center border-2 border-[#8FAF91]">
            {/* Visual Leaf Silhouette in Scanner */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path
                  d="M50 10C30 20 15 40 20 70C35 85 65 85 80 65C85 45 75 25 50 10Z"
                  fill="#245C43"
                  stroke="#8FAF91"
                  strokeWidth="2"
                />
                <path d="M50 12C45 40 40 65 35 80" stroke="#8FAF91" strokeWidth="1.5" />
                <path d="M47 35C58 35 68 38 72 32" stroke="#8FAF91" strokeWidth="1.2" />
                <path d="M45 50C55 52 65 55 70 50" stroke="#8FAF91" strokeWidth="1.2" />
              </svg>

              {/* Scanning laser beam overlay */}
              {scanning && (
                <div className="absolute inset-0 flex flex-col justify-start">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#E5A93D] to-transparent shadow-[0_0_12px_#E5A93D] animate-bounce" />
                </div>
              )}

              {/* Bounding box reticle */}
              <div className="absolute inset-2 border-2 border-dashed border-[#8FAF91]/70 rounded-lg pointer-events-none" />
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#E5A93D]" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#E5A93D]" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#E5A93D]" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#E5A93D]" />
            </div>

            {/* Scanning Status Badge */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-lg">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${scanning ? 'bg-[#E5A93D] animate-ping' : 'bg-emerald-400'}`} />
                {scanning ? 'Detecting leaf chlorophyll & cellular pulse...' : 'Scan Complete · Health Pulse Calculated'}
              </span>
              <span className="font-mono text-[11px] text-[#8FAF91]">
                {userType === 'farmer' ? 'Acreage Lens: Crop' : 'Balcony Lens: Pot'}
              </span>
            </div>
          </div>

          {/* Results Card */}
          {analyzed ? (
            <div className="mt-4 p-4 rounded-xl bg-white border border-[#8FAF91]/30">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{userType === 'farmer' ? '🍅' : '🪴'}</span>
                  <div>
                    <h4 className="font-bold text-[#245C43] text-base">
                      {userType === 'farmer' ? 'Tomato (Lycopersicon esculentum)' : 'Potted Tomato / Cherry'}
                    </h4>
                    <p className="text-xs text-[#546b5e]">Foliage analysis: 98.4% confidence</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#9A7653] uppercase block">Health Pulse</span>
                  <span className="text-xl font-extrabold text-[#245C43] font-mono">87 / 100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E8F1E7]/70 text-[#245C43]">
                  <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0" />
                  <span>Early Blight: Negative</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E8F1E7]/70 text-[#245C43]">
                  <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0" />
                  <span>Leaf Vitality: High</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E8F1E7]/70 text-[#245C43]">
                  <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0" />
                  <span>Hydration: Normal</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E5A93D]/15 text-[#9A7653]">
                  <AlertTriangle className="w-4 h-4 text-[#E5A93D] shrink-0" />
                  <span>Soil: Low Nitrogen</span>
                </div>
              </div>

              <div className="text-xs text-[#395045] bg-[#FAF8F3] p-2.5 rounded-lg border border-[#8FAF91]/20">
                <span className="font-semibold text-[#245C43]">Doctor Recommendation:</span> Apply light vermicompost or organic bio-fertilizer within 48 hours to maintain high fruit-setting yield.
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-white border border-[#8FAF91]/30 flex items-center justify-center gap-2 text-xs text-[#546b5e]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#245C43]" />
              <span>Calibrating spectral reflection and ambient light...</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#8FAF91]/25 flex items-center justify-between">
          <button
            onClick={() => {
              setScanning(true);
              setAnalyzed(false);
              setTimeout(() => {
                setScanning(false);
                setAnalyzed(true);
              }, 1800);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245C43] hover:text-black"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Scan</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Save to Plant Log
          </button>
        </div>
      </div>
    </div>
  );
};
