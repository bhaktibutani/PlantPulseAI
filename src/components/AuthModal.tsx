import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Globe,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../data/translations.ts';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'farmer' | 'urban_planner';
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user?: AuthUser | null, token?: string | null, isGuest?: boolean) => void;
  initialMode?: 'signin' | 'signup';
  initialRole?: 'farmer' | 'urban_planner';
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
  initialRole = 'farmer',
  lang,
  onLanguageChange,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'farmer' | 'urban_planner'>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setError(null);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to register account.');
        }

        if (data.token) {
          localStorage.setItem('plantpulse_auth_token', data.token);
        }

        onSuccess(data.user, data.token, false);
      } else {
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
          throw new Error(data.error || 'Invalid email or password.');
        }

        if (data.token) {
          localStorage.setItem('plantpulse_auth_token', data.token);
        }

        onSuccess(data.user, data.token, false);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#8FAF91]/40 overflow-hidden flex flex-col md:flex-row min-h-[540px]">
        {/* Left Side: Editorial Botanical Scrim & Trust Storytelling */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#1A3D2D] via-[#245C43] to-[#122A1F] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background botanical rings */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full border border-[#8FAF91]/20 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full border border-[#8FAF91]/20 pointer-events-none" />

          {/* Top Brand Mark */}
          <div>
            <Logo size="md" variant="light" />
            <div className="mt-8 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E5A93D] block">
                {mode === 'signin' ? t.welcomeBack : t.joinApp}
              </span>
              <h3 className="text-2xl font-bold font-display leading-tight text-white">
                {t.authHeroTitle}
              </h3>
              <p className="text-xs text-[#E8F1E7]/80 leading-relaxed">
                {t.authHeroDesc}
              </p>
            </div>
          </div>

          {/* Bottom Trust Metric */}
          <div className="pt-6 border-t border-[#8FAF91]/30">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#E8F1E7]">
              <ShieldCheck className="w-4 h-4 text-[#E5A93D]" />
              <span>{t.authTrustMetric}</span>
            </div>
            <div className="text-[11px] text-[#E8F1E7]/70">
              {t.authTrustDesc}
            </div>
          </div>
        </div>

        {/* Right Side: Clean Tactile Authentication Form */}
        <div className="md:w-7/12 bg-[#F7F5EF] p-8 sm:p-10 flex flex-col justify-between text-left overflow-y-auto max-h-[90vh]">
          {/* Top close button, Mode Switcher & Language Switcher */}
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap sm:flex-nowrap">
            {/* Segmented Auth Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#E8F1E7] p-1 rounded-xl text-xs font-bold border border-[#8FAF91]/40">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-[#245C43] text-white shadow-xs'
                    : 'text-[#245C43] hover:text-black'
                }`}
              >
                {t.signIn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#245C43] text-white shadow-xs'
                    : 'text-[#245C43] hover:text-black'
                }`}
              >
                {t.createAccount}
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Language Switcher */}
              {onLanguageChange && (
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#8FAF91]/40 text-xs">
                  <Globe className="w-3.5 h-3.5 text-[#245C43] ml-1" />
                  <button
                    type="button"
                    onClick={() => onLanguageChange('en')}
                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                      lang === 'en' ? 'bg-[#245C43] text-white' : 'text-[#476353]'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange('gu')}
                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                      lang === 'gu' ? 'bg-[#245C43] text-white' : 'text-[#476353]'
                    }`}
                  >
                    ગુજ
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange('hi')}
                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                      lang === 'hi' ? 'bg-[#245C43] text-white' : 'text-[#476353]'
                    }`}
                  >
                    हिं
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 my-auto">
            <div>
              <h4 className="text-xl font-extrabold text-[#17382B] font-display">
                {mode === 'signin' ? t.signInHeading : t.signUpHeading}
              </h4>
              <p className="text-xs text-[#546b5e] mt-1">
                {mode === 'signin' ? t.signInSubtitle : t.signUpSubtitle}
              </p>
            </div>

            {/* Registration Fields */}
            {mode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17382B]">{t.fullNameLabel}</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8FAF91] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === 'gu' ? 'દા.ત. ભક્તિ ભુતાણી' : lang === 'hi' ? 'उदा. भक्ति भुतानी' : 'e.g. Bhakti Butani'}
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#8FAF91]/40 bg-white focus:outline-none focus:ring-2 focus:ring-[#245C43]"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#17382B]">
                    {t.selectRoleLabel} <span className="text-[#9A7653]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        role === 'farmer'
                          ? 'border-[#245C43] bg-[#E8F1E7] ring-2 ring-[#245C43]/20'
                          : 'border-[#8FAF91]/40 bg-white hover:border-[#245C43]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">🌱</span>
                        {role === 'farmer' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#245C43]" />
                        )}
                      </div>
                      <div className="mt-1">
                        <strong className="text-xs font-bold text-[#17382B] block">
                          {t.farmerRoleTitle}
                        </strong>
                        <span className="text-[10px] text-[#546b5e] leading-tight block">
                          {t.farmerRoleSubtitle}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('urban_planner')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        role === 'urban_planner'
                          ? 'border-[#245C43] bg-[#E8F1E7] ring-2 ring-[#245C43]/20'
                          : 'border-[#8FAF91]/40 bg-white hover:border-[#245C43]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">🏙️</span>
                        {role === 'urban_planner' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#245C43]" />
                        )}
                      </div>
                      <div className="mt-1">
                        <strong className="text-xs font-bold text-[#17382B] block">
                          {t.urbanRoleTitle}
                        </strong>
                        <span className="text-[10px] text-[#546b5e] leading-tight block">
                          {t.urbanRoleSubtitle}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17382B]">{t.emailLabel}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8FAF91] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bhaktibutani14@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#8FAF91]/40 bg-white focus:outline-none focus:ring-2 focus:ring-[#245C43]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17382B]">{t.passwordLabel}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8FAF91] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#8FAF91]/40 bg-white focus:outline-none focus:ring-2 focus:ring-[#245C43]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#245C43] hover:bg-[#1a4431] disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'signin' ? t.checkingCredentials : t.creatingAccount}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? t.signIn : t.createAccount}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest fallback option */}
          <div className="pt-4 border-t border-[#8FAF91]/25 flex items-center justify-between text-xs">
            <span className="text-[#546b5e]">
              {lang === 'gu' ? 'માત્ર અજમાયશ માટે?' : lang === 'hi' ? 'केवल देखना चाहते हैं?' : 'Just exploring?'}
            </span>
            <button
              type="button"
              onClick={() => onSuccess(null, null, true)}
              className="font-bold text-[#245C43] hover:underline underline-offset-4 cursor-pointer"
            >
              {t.continueGuest} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
