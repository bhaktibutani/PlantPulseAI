import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import { HeroBotanicalComposition } from './BotanicalVisuals.tsx';
import { Language, translations } from '../data/translations.ts';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  Droplets,
  Eye,
  Globe,
  HeartPulse,
  HelpCircle,
  Layers,
  Leaf,
  LineChart,
  MessageSquare,
  Microscope,
  Scan,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Trees,
  Wind,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreGuest: () => void;
  onSelectPersona: (persona: 'farmer' | 'urban') => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onExploreGuest,
  onSelectPersona,
  lang,
  onLanguageChange,
}) => {
  const t = translations[lang];
  const [activePhilosophyStep, setActivePhilosophyStep] = useState(0);

  // The Core PlantPulse Philosophy: OBSERVE → UNDERSTAND → ASK → ANALYZE → RECOMMEND → TRACK → IMPROVE
  const philosophySteps = [
    {
      label: 'OBSERVE',
      tagline: 'High-Res Optical Leaf Capture',
      desc: 'Capture microscopic chlorophyll pigmentation, fungal pustules, leaf edge necrosis and moisture turgor in seconds.',
      icon: Eye,
      metric: '0.4s Ingestion',
    },
    {
      label: 'UNDERSTAND',
      tagline: 'Environmental Weather & Soil Correlation',
      desc: 'Correlate visual leaf cues with real-time hyper-local rainfall, evapotranspiration rates, humidity and soil substrate metrics.',
      icon: Compass,
      metric: '94.8% Precision',
    },
    {
      label: 'ASK',
      tagline: 'Multilingual Vernacular Plant Doctor',
      desc: 'Engage in natural voice or text consultations in Gujarati, Hindi or English to narrow down root symptoms with structured inquiries.',
      icon: MessageSquare,
      metric: 'Voice & Regional Native',
    },
    {
      label: 'ANALYZE',
      tagline: 'Differential Pathogen & Stress Classifier',
      desc: 'Calculate the proprietary Plant Health Pulse (0–100) separating infectious blight, pests, soil nutrient deficit and sun scorch.',
      icon: Microscope,
      metric: 'Vitality Pulse Score',
    },
    {
      label: 'RECOMMEND',
      tagline: 'Agronomic Treatment & Weather-Smart Timing',
      desc: 'Generate precise actionable guidance — whether to withhold irrigation ahead of rainfall or apply bio-pesticide before sunset.',
      icon: Sparkles,
      metric: 'Actionable Directives',
    },
    {
      label: 'TRACK',
      tagline: 'Longitudinal Botanical Health Ledger',
      desc: 'Monitor recovery trajectories across crop cycles or indoor pot seasons with historical vegetative health curves.',
      icon: LineChart,
      metric: 'Timeline History',
    },
    {
      label: 'IMPROVE',
      tagline: 'Yield Maximization & Plant Longevity',
      desc: 'Elevate farm harvest yields and keep urban balcony plants thriving with continuous proactive vigilance.',
      icon: Sprout,
      metric: '+28% Target Yield',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17382B] flex flex-col selection:bg-[#E8F1E7] selection:text-[#245C43]">
      {/* Top Navigation Bar adhering to the Top Bar Contract */}
      <header className="sticky top-0 z-50 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#8FAF91]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Zone 1: Brand Wordmark */}
          <Logo size="md" />

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#345243]">
            <a href="#product" className="hover:text-[#245C43] transition-colors">
              Product
            </a>
            <a href="#philosophy" className="hover:text-[#245C43] transition-colors">
              How It Works
            </a>
            <button
              onClick={() => onSelectPersona('farmer')}
              className="hover:text-[#245C43] transition-colors text-left"
            >
              For Farmers
            </button>
            <button
              onClick={() => onSelectPersona('urban')}
              className="hover:text-[#245C43] transition-colors text-left"
            >
              For Urban Gardeners
            </button>
            <a href="#about" className="hover:text-[#245C43] transition-colors">
              About
            </a>
          </nav>

          {/* Zone 3: Actions + Language Selector */}
          <div className="flex items-center gap-4">
            {/* Professional Language Switcher */}
            <div className="flex items-center gap-1 bg-[#E8F1E7] p-1 rounded-xl border border-[#8FAF91]/40 text-xs">
              <Globe className="w-3.5 h-3.5 ml-1.5 text-[#245C43]" />
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                  lang === 'en' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('gu')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                  lang === 'gu' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
                }`}
              >
                ગુજરાતી
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                  lang === 'hi' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <button
              onClick={onSignIn}
              className="hidden sm:inline-flex text-sm font-semibold text-[#245C43] hover:text-[#17382B] px-3.5 py-2 rounded-xl hover:bg-[#E8F1E7]/70 transition-colors"
            >
              {t.signIn}
            </button>

            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-150 transform hover:-translate-y-0.5"
            >
              <span>{t.getStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: Editorial Depth & Visual Storytelling */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-[#8FAF91]/25">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-6 flex flex-col items-start text-left max-w-xl">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#245C43] bg-[#E8F1E7] border border-[#8FAF91]/40 px-3.5 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-[#245C43] animate-pulse" />
                <span>AI-POWERED PLANT HEALTH</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#17382B] font-display leading-[1.08] mb-6">
                CHECK THE PULSE.{' '}
                <span className="text-[#245C43] block">UNDERSTAND THE PLANT.</span>{' '}
                <span className="text-[#9A7653]">GROW BETTER.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-[#324b3e] leading-relaxed mb-8 font-normal">
                PlantPulse AI combines plant images, local weather, soil insights and intelligent conversations to help farmers and urban gardeners make better plant-care decisions.
              </p>

              {/* CTAs */}
              <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center justify-center gap-2.5 bg-[#245C43] hover:bg-[#1a4431] text-white text-base font-semibold px-7 py-3.5 rounded-xl shadow-md transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Start Growing Smarter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onExploreGuest}
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#245C43] bg-white hover:bg-[#E8F1E7]/60 border border-[#8FAF91]/50 px-6 py-3.5 rounded-xl shadow-xs transition-colors"
                >
                  <span>Explore PlantPulse</span>
                </button>
              </div>

              {/* Proof / Adjacency Trust Signal */}
              <div className="w-full pt-6 border-t border-[#8FAF91]/25 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-2xl font-bold text-[#245C43] font-mono">0.4s</div>
                  <div className="text-xs text-[#546b5e] font-medium">Optical Pulse Scan</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#245C43] font-mono">3 Languages</div>
                  <div className="text-xs text-[#546b5e] font-medium">EN · ગુજરાતી · हिन्दी</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#245C43] font-mono">2 Personas</div>
                  <div className="text-xs text-[#546b5e] font-medium">Farmer & Balcony</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Botanical Composition with Floating Product UI */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <HeroBotanicalComposition />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: THE PLANTPULSE PHILOSOPHY */}
      <section id="philosophy" className="py-20 bg-white border-b border-[#8FAF91]/25">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-[#9A7653] mb-2 block">
              THE VITALITY CYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#17382B] font-display mb-4">
              More than a disease detector. A complete botanical intelligence loop.
            </h2>
            <p className="text-sm sm:text-base text-[#476353]">
              PlantPulse isn't just “photo in, diagnosis out.” It guides every decision from early cellular stress detection to optimal harvest.
            </p>
          </div>

          {/* Interactive Pipeline Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-8">
            {philosophySteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activePhilosophyStep === idx;
              return (
                <button
                  key={step.label}
                  onClick={() => setActivePhilosophyStep(idx)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    isActive
                      ? 'border-[#245C43] bg-[#E8F1E7] shadow-sm transform -translate-y-1'
                      : 'border-[#8FAF91]/30 bg-[#F7F5EF] hover:border-[#8FAF91] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-[#9A7653]">
                      0{idx + 1}
                    </span>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#245C43]' : 'text-[#8FAF91]'}`} />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider block text-[#17382B]">
                      {step.label}
                    </span>
                    <span className="text-[11px] text-[#546b5e] font-medium block truncate">
                      {step.metric}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Philosophy Deep-Dive Banner */}
          <div className="p-7 rounded-3xl bg-[#FAF8F3] border border-[#8FAF91]/35 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1 max-w-2xl text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#245C43] text-white">
                  Step 0{activePhilosophyStep + 1} · {philosophySteps[activePhilosophyStep].label}
                </span>
                <span className="text-sm font-bold text-[#245C43]">
                  {philosophySteps[activePhilosophyStep].tagline}
                </span>
              </div>
              <p className="text-sm text-[#395045] pt-1">
                {philosophySteps[activePhilosophyStep].desc}
              </p>
            </div>

            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C43] bg-white border border-[#8FAF91]/40 px-4 py-2.5 rounded-xl hover:bg-[#E8F1E7] transition-colors whitespace-nowrap shadow-2xs"
            >
              <span>Experience in Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: DUAL PERSONA ARCHITECTURE (Farmer vs Urban) */}
      <section id="product" className="py-20 bg-[#F7F5EF] border-b border-[#8FAF91]/25">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-[#9A7653] mb-2 block">
              CALIBRATED EXPERIENCES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#17382B] font-display mb-3">
              Built for Acreage Fields. Perfected for Balcony Pots.
            </h2>
            <p className="text-sm sm:text-base text-[#476353]">
              Different growing environments face completely different risks. PlantPulse adapts its telemetry accordingly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Persona 1: Farmer */}
            <div className="bg-white rounded-3xl border border-[#8FAF91]/35 p-8 shadow-xs flex flex-col justify-between text-left hover:border-[#245C43] transition-all group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9A7653] bg-[#FAF8F3] px-3 py-1 rounded-full border border-[#8FAF91]/30">
                    <span>🌾 Agricultural Intelligence</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#546b5e]">Acreage Scale</span>
                </div>

                <h3 className="text-2xl font-bold text-[#245C43] font-display mb-2">
                  For Commercial Farmers
                </h3>
                <p className="text-sm text-[#476353] leading-relaxed mb-6">
                  Protect cash crops, synchronize drip irrigation with rainfall forecasts, detect early blight before field outbreaks, and track soil nitrogen-phosphorus balance.
                </p>

                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-xs text-[#245C43] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0" />
                    <span>Field-scale weather forecasting & irrigation delay alerts</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#245C43] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0" />
                    <span>Early blight & rust fungal detection with high confidence</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#245C43] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0" />
                    <span>Gujarati & Hindi voice interaction for non-English speakers</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectPersona('farmer')}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                <span>Explore Farmer Experience</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Persona 2: Urban Gardener */}
            <div className="bg-white rounded-3xl border border-[#8FAF91]/35 p-8 shadow-xs flex flex-col justify-between text-left hover:border-[#245C43] transition-all group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9A7653] bg-[#FAF8F3] px-3 py-1 rounded-full border border-[#8FAF91]/30">
                    <span>🪴 Balcony & Home Botanicals</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#546b5e]">Container Scale</span>
                </div>

                <h3 className="text-2xl font-bold text-[#245C43] font-display mb-2">
                  For Urban Gardeners
                </h3>
                <p className="text-sm text-[#476353] leading-relaxed mb-6">
                  Nurture balcony tomatoes, terrace herbs, Tulsi and indoor tropicals. Get reminders adapted to sun hours, potting mix moisture, and seasonal care.
                </p>

                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-xs text-[#245C43] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0" />
                    <span>Container moisture & potting soil aeration diagnostics</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#245C43] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0" />
                    <span>Sunlight & shade hour calibration per apartment orientation</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#245C43] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0" />
                    <span>Gentle conversational plant doctor for quick troubleshooting</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectPersona('urban')}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                <span>Explore Urban Gardener Experience</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer id="about" className="mt-auto bg-white border-t border-[#8FAF91]/25 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#546b5e]">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="text-[#8FAF91]">|</span>
            <span>Check the Pulse. Understand the Plant. Grow Better.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button onClick={() => onSelectPersona('farmer')} className="hover:text-[#245C43]">
              Farmer Mode
            </button>
            <button onClick={() => onSelectPersona('urban')} className="hover:text-[#245C43]">
              Urban Mode
            </button>
            <button onClick={onSignIn} className="hover:text-[#245C43]">
              Account Access
            </button>
            <span>© 2026 PlantPulse AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
