import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Language, translations } from '../data/translations.ts';
import { Logo } from './Logo.tsx';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user?: any, token?: string) => void;
  lang: Language;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(t.extra.authEmailInvalid);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(t.extra.authInvalidCredentials);
      }

      if (data.token) {
        localStorage.setItem('plantpulse_auth_token', data.token);
      }

      onSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err instanceof TypeError ? t.extra.authConnectionError : (err.message || t.extra.authInvalidCredentials));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#F7F5EF] rounded-2xl shadow-2xl border border-[#8FAF91]/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#8FAF91]/25">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-left">
            <h3 className="text-xl font-bold text-[#245C43] font-display">
              {t.signIn}
            </h3>
            <p className="text-xs text-[#546b5e] mt-1">
              {t.extra.signInDescription}
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-[#245C43]">
              {t.extra.emailAddressLabel}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8FAF91] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.extra.emailPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#8FAF91]/40 bg-white focus:outline-none focus:ring-2 focus:ring-[#245C43]"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-[#245C43]">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8FAF91] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.extra.passwordPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#8FAF91]/40 bg-white focus:outline-none focus:ring-2 focus:ring-[#245C43]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#245C43] hover:bg-[#1a4431] disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.checkingCredentials}</span>
              </>
            ) : (
              <>
                <span>{t.signIn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => onSuccess(null, undefined)}
              className="text-xs text-[#245C43] hover:underline font-semibold"
            >
              {t.extra.guestMode}
            </button>
          </div>
        </form>

        <div className="px-6 py-3 bg-[#E8F1E7]/50 border-t border-[#8FAF91]/25 text-center text-xs text-[#546b5e]">
          {t.extra.securityDescription}
        </div>
      </div>
    </div>
  );
};
