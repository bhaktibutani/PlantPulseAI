import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import { UserType } from './UserTypeSelection.tsx';
import { translations, Language } from '../data/translations.ts';
import {
  Activity,
  Calendar,
  CloudSun,
  Droplets,
  HeartPulse,
  MapPin,
  Mic,
  Scan,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Home,
  Layers,
  Thermometer,
  Wind,
  ArrowLeft,
} from 'lucide-react';

interface DashboardScreenProps {
  userType: UserType;
  setUserType: (type: UserType) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenScan: () => void;
  onOpenDoctor: (topic: 'health' | 'watering' | 'disease' | 'speak') => void;
  onBackToLanding: () => void;
  onChangePersona: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userType,
  setUserType,
  lang,
  onLanguageChange,
  onOpenScan,
  onOpenDoctor,
  onBackToLanding,
  onChangePersona,
}) => {
  const [activeNav, setActiveNav] = useState('Overview');
  const t = translations[lang];

  // Specific contextual data for Farmer vs Urban Gardener
  const profileDetails = {
    farmer: {
      location: 'Rajkot, Gujarat (Plot 4B)',
      cropName: 'Tomato (Vaibhav Hybrid)',
      cropSub: 'Acreage: 3.5 Acres · Field Stage: Fruit Setting',
      greeting: t.greetingFarmer,
      weatherTemp: '31°C',
      weatherCondition: 'Sunny Intervals',
      humidity: '68%',
      soilMoisture: '42% (Normal)',
      wind: '12 km/h WNW',
      soilNote: 'Nitrogen levels slightly deficient in sub-zone 2. Potassium and phosphorus nominal.',
    },
    urban: {
      location: 'Ahmedabad (Terrace & Balcony Garden)',
      cropName: 'Potted Cherry Tomato',
      cropSub: 'Container: 12-inch Terracotta · Age: 42 Days',
      greeting: t.greetingUrban,
      weatherTemp: '29°C',
      weatherCondition: 'Warm & Humid',
      humidity: '64%',
      soilMoisture: '54% (Moist)',
      wind: '8 km/h NW',
      soilNote: 'Organic potting mix requires light vermicompost top-dressing before weekend flowering.',
    },
  }[userType];

  const navItems = [
    { name: t.navOverview, id: 'Overview' },
    { name: t.navMyPlants, id: 'My Plants' },
    { name: t.navScanPlant, id: 'Scan Plant', isAction: true },
    { name: t.navPlantDoctor, id: 'PlantPulse AI' },
    { name: t.navWeatherWater, id: 'Weather & Water' },
    { name: t.navSoilInsights, id: 'Soil Insights' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col selection:bg-[#E8F1E7] selection:text-[#245C43]">
      {/* Mentor Prototype Banner Bar */}
      <div className="bg-[#245C43] text-[#E8F1E7] text-xs px-4 py-2 flex flex-wrap items-center justify-between border-b border-[#8FAF91]/30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E5A93D] animate-ping" />
          <span className="font-semibold">{t.prototypeNotice}</span>
          <span className="hidden sm:inline text-[#8FAF91]">·</span>
          <span className="hidden sm:inline text-[#E8F1E7]/80">
            Currently in {userType === 'farmer' ? '🌾 Farmer View' : '🪴 Urban Gardener View'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onChangePersona}
            className="text-xs text-[#E5A93D] hover:underline font-medium"
          >
            Switch Persona
          </button>
          <span className="text-[#8FAF91]">·</span>
          <button
            onClick={onBackToLanding}
            className="text-xs text-[#E8F1E7] hover:underline font-medium"
          >
            Landing Screen
          </button>
        </div>
      </div>

      {/* Main App Bar (Top Bar Contract: 3 zones) */}
      <header className="bg-white border-b border-[#8FAF91]/25 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Zone 1: Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToLanding}
              className="text-left focus:outline-none"
              title="Return to Welcome"
            >
              <Logo size="sm" />
            </button>

            {/* Persona Switcher Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-[#F7F5EF] p-1 rounded-xl border border-[#8FAF91]/30">
              <button
                onClick={() => setUserType('farmer')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  userType === 'farmer'
                    ? 'bg-[#245C43] text-white shadow-xs'
                    : 'text-[#476353] hover:text-[#245C43]'
                }`}
              >
                <span>🌾</span>
                <span>Farmer</span>
              </button>
              <button
                onClick={() => setUserType('urban')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  userType === 'urban'
                    ? 'bg-[#245C43] text-white shadow-xs'
                    : 'text-[#476353] hover:text-[#245C43]'
                }`}
              >
                <span>🪴</span>
                <span>Urban</span>
              </button>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#476353]">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction) {
                    onOpenScan();
                  } else {
                    setActiveNav(item.id);
                  }
                }}
                className={`transition-colors py-1 ${
                  activeNav === item.id
                    ? 'text-[#245C43] font-bold border-b-2 border-[#245C43]'
                    : 'hover:text-[#245C43]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Zone 3: Quick Language Toggle & Action */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-[#F7F5EF] p-1 rounded-lg border border-[#8FAF91]/30 text-xs">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded font-medium ${
                  lang === 'en' ? 'bg-[#245C43] text-white' : 'text-[#476353]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('gu')}
                className={`px-2 py-0.5 rounded font-medium ${
                  lang === 'gu' ? 'bg-[#245C43] text-white' : 'text-[#476353]'
                }`}
              >
                ગુજ
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-0.5 rounded font-medium ${
                  lang === 'hi' ? 'bg-[#245C43] text-white' : 'text-[#476353]'
                }`}
              >
                हिं
              </button>
            </div>

            <button
              onClick={onOpenScan}
              className="inline-flex items-center gap-1.5 bg-[#245C43] hover:bg-[#1a4431] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{t.scanPlantCTA}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Top Header Card: Greeting + Weather & Location Widget */}
        <section className="bg-white rounded-2xl border border-[#8FAF91]/30 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9A7653] uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#9A7653]" />
              <span>{profileDetails.location}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#245C43] font-display">
              {profileDetails.greeting} 👋
            </h2>
            <p className="text-sm text-[#476353] mt-1">
              {userType === 'farmer'
                ? 'Field sensors and aerial weather models are synchronized.'
                : 'Your balcony microclimate is warm and well-lit today.'}
            </p>
          </div>

          {/* Compact Weather Summary */}
          <div className="flex items-center gap-4 bg-[#F7F5EF] p-4 rounded-xl border border-[#8FAF91]/30">
            <div className="text-3xl" role="img" aria-label="Weather">
              🌤️
            </div>
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#245C43] font-display">
                  {profileDetails.weatherTemp}
                </span>
                <span className="text-xs text-[#546b5e] font-medium">
                  {profileDetails.weatherCondition}
                </span>
              </div>
              <div className="text-xs text-[#546b5e] flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-[#245C43]" />
                  <span>Humidity {profileDetails.humidity}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-[#245C43]" />
                  <span>{profileDetails.wind}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Grid: 2 Primary Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): SIGNATURE HEALTH PULSE CARD */}
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-[#8FAF91]/35 p-6 sm:p-7 shadow-xs relative overflow-hidden">
              {/* Subtle top indicator */}
              <div className="flex items-center justify-between border-b border-[#8FAF91]/20 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl" role="img" aria-label="Tomato">
                    🍅
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#245C43]">
                      {profileDetails.cropName}
                    </h3>
                    <p className="text-xs text-[#546b5e]">
                      {profileDetails.cropSub}
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="inline-flex items-center gap-1.5 bg-[#E8F1E7] text-[#245C43] px-3 py-1 rounded-full text-xs font-bold border border-[#8FAF91]/30">
                  <span className="w-2 h-2 rounded-full bg-[#245C43]" />
                  <span>{t.healthy}</span>
                </div>
              </div>

              {/* Main Health Pulse Score Block */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[#FAF8F3] p-5 rounded-xl border border-[#8FAF91]/25 mb-6">
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-[#9A7653] mb-1">
                    {t.healthPulseLabel}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-[#245C43] font-mono tracking-tight">
                      87
                    </span>
                    <span className="text-lg text-[#546b5e] font-semibold">
                      / 100
                    </span>
                  </div>
                  <span className="text-xs text-[#245C43] font-medium mt-1 block">
                    ● Peak photosynthesis & cell turgor
                  </span>
                </div>

                {/* Animated Health Pulse Waveform Graphic */}
                <div className="w-full sm:w-48 h-16 bg-white rounded-lg p-2 border border-[#8FAF91]/25 flex items-center justify-center">
                  <svg
                    viewBox="0 0 160 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <path
                      d="M10 25H40L48 10L58 40L68 5L78 45L88 20L96 25H150"
                      stroke="#245C43"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-pulse-line"
                    />
                    <circle cx="68" cy="5" r="3" fill="#E5A93D" />
                  </svg>
                </div>
              </div>

              {/* Key Indicators Matrix (Water, Disease, Weather, Soil) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {/* Water */}
                <div className="p-3 rounded-xl bg-[#E8F1E7]/60 border border-[#8FAF91]/30 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#245C43]">
                      {t.waterLabel}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#245C43]" />
                  </div>
                  <div className="text-xs font-bold text-[#245C43]">
                    {t.optimal}
                  </div>
                </div>

                {/* Disease */}
                <div className="p-3 rounded-xl bg-[#E8F1E7]/60 border border-[#8FAF91]/30 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#245C43]">
                      {t.diseaseLabel}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#245C43]" />
                  </div>
                  <div className="text-xs font-bold text-[#245C43]">
                    {t.clear}
                  </div>
                </div>

                {/* Weather */}
                <div className="p-3 rounded-xl bg-[#E8F1E7]/60 border border-[#8FAF91]/30 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#245C43]">
                      {t.weatherLabel}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#245C43]" />
                  </div>
                  <div className="text-xs font-bold text-[#245C43]">
                    {t.favorable}
                  </div>
                </div>

                {/* Soil (Warning state) */}
                <div className="p-3 rounded-xl bg-[#E5A93D]/15 border border-[#E5A93D]/40 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#9A7653]">
                      {t.soilLabel}
                    </span>
                    <AlertTriangle className="w-3.5 h-3.5 text-[#E5A93D]" />
                  </div>
                  <div className="text-xs font-bold text-[#E5A93D]">
                    {t.soilAttention} ⚠
                  </div>
                </div>
              </div>

              {/* Soil Insight Detail Bar */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/30 text-xs text-[#395045] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#E5A93D] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#245C43]">Soil Diagnostic: </span>
                  {profileDetails.soilNote}
                </div>
              </div>

              {/* Big Scan CTA inside the Health card */}
              <div className="mt-6 pt-5 border-t border-[#8FAF91]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#546b5e]">
                  Last scanned 3 hours ago · Next automated check at sunset
                </span>
                <button
                  onClick={onOpenScan}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#245C43] hover:bg-[#1b4834] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <Scan className="w-4 h-4" />
                  <span>{t.scanPlantCTA}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Right Column (5 cols): SIGNATURE AI ASSISTANT / PLANT DOCTOR */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#8FAF91]/35 p-6 sm:p-7 shadow-xs">
              {/* Doctor Brand Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#245C43] flex items-center justify-center text-[#F7F5EF] shadow-xs">
                  <Sparkles className="w-5 h-5 text-[#E5A93D]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#245C43] font-display">
                    PlantPulse AI
                  </h3>
                  <div className="text-xs font-semibold text-[#9A7653] uppercase tracking-wide">
                    Your Plant Doctor
                  </div>
                </div>
              </div>

              {/* Signature invitation prompt */}
              <div className="p-4 rounded-xl bg-[#E8F1E7]/60 border border-[#8FAF91]/30 mb-5">
                <p className="text-sm font-medium text-[#245C43] italic">
                  “{t.plantDoctorSubtitle}”
                </p>
                <p className="text-xs text-[#546b5e] mt-1">
                  Ask questions in Gujarati, Hindi or English with text or voice.
                </p>
              </div>

              {/* 4 Quick Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => onOpenDoctor('health')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#8FAF91]/30 bg-[#FAF8F3] hover:bg-[#E8F1E7]/70 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🌱</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#245C43]">
                      {t.actionCheckHealth}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8FAF91] group-hover:text-[#245C43] transition-colors" />
                </button>

                <button
                  onClick={() => onOpenDoctor('watering')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#8FAF91]/30 bg-[#FAF8F3] hover:bg-[#E8F1E7]/70 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💧</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#245C43]">
                      {t.actionWatering}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8FAF91] group-hover:text-[#245C43] transition-colors" />
                </button>

                <button
                  onClick={() => onOpenDoctor('disease')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#8FAF91]/30 bg-[#FAF8F3] hover:bg-[#E8F1E7]/70 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🐛</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#245C43]">
                      {t.actionDisease}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8FAF91] group-hover:text-[#245C43] transition-colors" />
                </button>

                <button
                  onClick={() => onOpenDoctor('speak')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-[#245C43] bg-[#245C43] text-white hover:bg-[#1a4431] transition-colors text-left shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-[#E5A93D] animate-pulse" />
                    <div>
                      <span className="text-xs sm:text-sm font-bold block">
                        {t.actionSpeak}
                      </span>
                      <span className="text-[11px] text-[#E8F1E7]/80 block">
                        Audio consultation in Gujarati / Hindi / English
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#E8F1E7] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Quick Prototype Navigation Pills */}
            <div className="bg-white rounded-2xl border border-[#8FAF91]/30 p-5 shadow-xs">
              <div className="text-xs font-bold text-[#9A7653] uppercase tracking-wide mb-3">
                Feature Roadmap Preview
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F7F5EF] text-[#476353]">
                  <span className="font-semibold text-[#245C43] block">🌿 Plant Health History</span>
                  <span className="text-[11px]">Timeline pulse tracking</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F7F5EF] text-[#476353]">
                  <span className="font-semibold text-[#245C43] block">🌦️ Weather-Aware Watering</span>
                  <span className="text-[11px]">ET evaporation curves</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F7F5EF] text-[#476353]">
                  <span className="font-semibold text-[#245C43] block">🧪 Soil N-P-K Profiler</span>
                  <span className="text-[11px]">Sensor & leaf correlation</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F7F5EF] text-[#476353]">
                  <span className="font-semibold text-[#245C43] block">🌐 Gujarati & Hindi AI</span>
                  <span className="text-[11px]">Voice & Vernacular LLM</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-[#8FAF91]/25 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B8576] gap-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#245C43]">PlantPulse AI</span>
          <span>·</span>
          <span>Check the Pulse. Understand the Plant. Grow Better.</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onBackToLanding} className="hover:text-[#245C43] underline">
            Landing View
          </button>
          <button onClick={onChangePersona} className="hover:text-[#245C43] underline">
            Change Persona
          </button>
        </div>
      </footer>
    </div>
  );
};
