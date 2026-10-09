import React from 'react';
import { Logo } from './Logo.tsx';
import { BotanicalPulseHeroGraphic } from './Illustrations.tsx';
import { translations, Language } from '../data/translations.ts';
import { ArrowRight, Globe, Shield, Sparkles } from 'lucide-react';

interface LandingScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onContinueGuest: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onGetStarted,
  onSignIn,
  onContinueGuest,
  lang,
  onLanguageChange,
}) => {
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col justify-between selection:bg-[#E8F1E7] selection:text-[#245C43]">
      {/* Top Bar following Top Bar Contract: Brand single zone — nav links — language & action */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-[#8FAF91]/25">
        <Logo size="md" />

        <div className="flex items-center gap-4">
          {/* Language selector toggle */}
          <div className="flex items-center gap-1 bg-[#E8F1E7]/70 p-1 rounded-xl text-xs border border-[#8FAF91]/30">
            <Globe className="w-3.5 h-3.5 ml-1.5 text-[#245C43]" />
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                lang === 'en' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('gu')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                lang === 'gu' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
              }`}
            >
              ગુજરાતી
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                lang === 'hi' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
              }`}
            >
              हिन्दी
            </button>
          </div>

          <button
            onClick={onSignIn}
            className="text-sm font-semibold text-[#245C43] hover:text-[#18402e] transition-colors py-2 px-3 rounded-lg hover:bg-[#E8F1E7]/60"
          >
            {t.signIn}
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="w-full max-w-6xl mx-auto px-6 py-10 lg:py-16 flex-1 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left Column: Brand Message & Primary Actions */}
        <div className="flex-1 flex flex-col items-start text-left max-w-xl">
          {/* Subtle badge / kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#245C43] bg-[#E8F1E7] px-3 py-1.5 rounded-full mb-6 border border-[#8FAF91]/30">
            <span className="w-2 h-2 rounded-full bg-[#245C43] animate-pulse" />
            <span>AI Botanical Vitality Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#245C43] font-display leading-[1.12] mb-6">
            “Check the Pulse.{' '}
            <span className="text-[#9A7653] block sm:inline">Understand the Plant.</span>{' '}
            <span className="text-[#245C43]">Grow Better.”</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#395045] leading-relaxed mb-8 max-w-lg font-normal">
            {t.taglineSub}
          </p>

          {/* Action CTAs */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center justify-center gap-2.5 bg-[#245C43] hover:bg-[#1b4834] text-white text-base font-semibold px-7 py-3.5 rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{t.getStarted}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onContinueGuest}
              className="inline-flex items-center justify-center text-sm font-semibold text-[#245C43] bg-[#E8F1E7]/80 hover:bg-[#E8F1E7] border border-[#8FAF91]/40 px-5 py-3.5 rounded-xl transition-colors"
            >
              {t.continueGuest}
            </button>
          </div>

          {/* Secondary Sign In link */}
          <div className="flex items-center gap-2 text-sm text-[#546b5e]">
            <span>{t.signInPrompt}</span>
            <button
              onClick={onSignIn}
              className="font-bold text-[#245C43] hover:underline underline-offset-4"
            >
              {t.signIn}
            </button>
          </div>

          {/* Trust markers */}
          <div className="mt-10 pt-6 border-t border-[#8FAF91]/25 flex flex-wrap items-center gap-6 text-xs text-[#546b5e]">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#245C43]" />
              <span>Field & Balcony Calibrated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#9A7653]" />
              <span>Voice & Multilingual Native</span>
            </div>
          </div>
        </div>

        {/* Right Column: Signature Botanical Pulse Graphic */}
        <div className="flex-1 w-full flex justify-center">
          <BotanicalPulseHeroGraphic className="w-full max-w-md lg:max-w-lg" />
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-[#8FAF91]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B8576] gap-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#245C43]">PlantPulse AI</span>
          <span>·</span>
          <span>First UI/UX Prototype</span>
          <span>·</span>
          <span>Designed for Farmers & Urban Gardeners</span>
        </div>
        <div>
          <span>PlantPulse AI © 2026</span>
        </div>
      </footer>
    </div>
  );
};
