import React from 'react';
import { Logo } from './Logo.tsx';
import { FarmerCardGraphic, UrbanCardGraphic } from './BotanicalVisuals.tsx';
import { Language, translations } from '../data/translations.ts';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Layers, Globe } from 'lucide-react';

export type UserType = 'farmer' | 'urban';

interface UserTypeSelectionProps {
  selectedType: UserType;
  onSelectType: (type: UserType) => void;
  onContinue: () => void;
  onBack: () => void;
  onSignIn: () => void;
  onContinueGuest: () => void;
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({
  selectedType,
  onSelectType,
  onContinue,
  onBack,
  onSignIn,
  onContinueGuest,
  lang,
  onLanguageChange,
}) => {
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col justify-between selection:bg-[#E8F1E7] selection:text-[#245C43]">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#8FAF91]/30">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          {onLanguageChange && (
            <div className="flex items-center gap-1 bg-[#E8F1E7] p-1 rounded-xl border border-[#8FAF91]/40 text-xs">
              <Globe className="w-3.5 h-3.5 ml-1 text-[#245C43]" />
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                  lang === 'en' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('gu')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                  lang === 'gu' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
                }`}
              >
                ગુજરાતી
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                  lang === 'hi' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
                }`}
              >
                हिन्दी
              </button>
            </div>
          )}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C43] hover:text-[#17382B] py-2 px-3.5 rounded-xl hover:bg-[#E8F1E7]/70 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backBtn}</span>
          </button>
        </div>
      </header>

      {/* Main Choice Body */}
      <main className="w-full max-w-5xl mx-auto px-6 py-10 lg:py-14 flex-1 flex flex-col items-center justify-center">
        {/* Editorial Heading */}
        <div className="text-center max-w-xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#9A7653] bg-[#FAF8F3] px-3.5 py-1.5 rounded-full border border-[#8FAF91]/35 mb-3">
            <span>
              {lang === 'gu'
                ? 'પ્રોફાઇલ કેલિબ્રેશન'
                : lang === 'hi'
                ? 'प्रोफाइल कैलिब्रेशन'
                : 'ONBOARDING CALIBRATION'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#17382B] font-display mb-3">
            {t.howDoYouGrow}
          </h2>
          <p className="text-base text-[#476353] font-normal">
            {t.selectSubtitle}
          </p>
        </div>

        {/* Two Large Premium Visual Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Card 1: Farmer */}
          <div
            onClick={() => onSelectType('farmer')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectType('farmer');
              }
            }}
            className={`cursor-pointer text-left rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden ${
              selectedType === 'farmer'
                ? 'border-[#245C43] bg-white shadow-xl ring-4 ring-[#8FAF91]/25 transform -translate-y-1.5'
                : 'border-[#8FAF91]/35 bg-[#FAF8F3] hover:border-[#8FAF91] hover:bg-white/90 hover:shadow-md'
            }`}
          >
            {/* Top Selection Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌾</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9A7653]">
                  {lang === 'gu' ? 'ખેતીવાડી કામગીરી' : lang === 'hi' ? 'कृषि कार्य' : 'Agricultural Operations'}
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  selectedType === 'farmer'
                    ? 'bg-[#245C43] border-[#245C43] text-white shadow-xs'
                    : 'border-[#8FAF91]/60 bg-white text-transparent'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 fill-current stroke-white" />
              </div>
            </div>

            {/* Visual Graphic Slot */}
            <div className="mb-6 overflow-hidden rounded-2xl">
              <FarmerCardGraphic className="transform transition-transform duration-500 group-hover:scale-102" />
            </div>

            {/* Typography Content */}
            <div>
              <h3 className="text-2xl font-extrabold text-[#17382B] font-display mb-2">
                {t.farmerTitle}
              </h3>
              <p className="text-sm text-[#476353] leading-relaxed mb-5">
                {t.farmerDesc}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-[#8FAF91]/25 text-[#245C43] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245C43]" />
                  <span>{lang === 'gu' ? 'જમીન અને પાક પ્લોટ' : lang === 'hi' ? 'रकबा और फसल प्लॉट' : 'Acreage & Crop Plots'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245C43]" />
                  <span>{lang === 'gu' ? 'વરસાદ સ્માર્ટ સિંચાઈ' : lang === 'hi' ? 'वर्षा स्मार्ट सिंचाई' : 'Rain-Smart Irrigation'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245C43]" />
                  <span>{lang === 'gu' ? 'જમીન N-P-K પોષક તત્વો' : lang === 'hi' ? 'मृदा N-P-K पोषक तत्व' : 'Soil N-P-K Deficits'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245C43]" />
                  <span>{lang === 'gu' ? 'પાક ઉપજ સુરક્ષા ચેતવણી' : lang === 'hi' ? 'उपज सुरक्षा चेतावनी' : 'Yield Outbreak Alerts'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Urban Gardener */}
          <div
            onClick={() => onSelectType('urban')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectType('urban');
              }
            }}
            className={`cursor-pointer text-left rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden ${
              selectedType === 'urban'
                ? 'border-[#245C43] bg-white shadow-xl ring-4 ring-[#8FAF91]/25 transform -translate-y-1.5'
                : 'border-[#8FAF91]/35 bg-[#FAF8F3] hover:border-[#8FAF91] hover:bg-white/90 hover:shadow-md'
            }`}
          >
            {/* Top Selection Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪴</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9A7653]">
                  {lang === 'gu' ? 'બાલ્કની અને ઘરના છોડ' : lang === 'hi' ? 'बालकनी और घरेलू पौधे' : 'Balcony & Home Botanicals'}
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  selectedType === 'urban'
                    ? 'bg-[#245C43] border-[#245C43] text-white shadow-xs'
                    : 'border-[#8FAF91]/60 bg-white text-transparent'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 fill-current stroke-white" />
              </div>
            </div>

            {/* Visual Graphic Slot */}
            <div className="mb-6 overflow-hidden rounded-2xl">
              <UrbanCardGraphic className="transform transition-transform duration-500 group-hover:scale-102" />
            </div>

            {/* Typography Content */}
            <div>
              <h3 className="text-2xl font-extrabold text-[#17382B] font-display mb-2">
                {t.urbanTitle}
              </h3>
              <p className="text-sm text-[#476353] leading-relaxed mb-5">
                {t.urbanDesc}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-[#8FAF91]/25 text-[#245C43] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245C43]" />
                  <span>{lang === 'gu' ? 'કૂંડાં અને કન્ટેનર માવજત' : lang === 'hi' ? 'गमले और कंटेनर देखभाल' : 'Pot & Planter Care'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245C43]" />
                  <span>{lang === 'gu' ? 'બાલ્કની તડકાના કલાકો' : lang === 'hi' ? 'बालकनी धूप के घंटे' : 'Balcony Sunlight Hours'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245C43]" />
                  <span>{lang === 'gu' ? 'પાણી છંટકાવ માર્ગદર્શન' : lang === 'hi' ? 'जल छिड़काव मार्गदर्शन' : 'Water Mist Guidance'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245C43]" />
                  <span>{lang === 'gu' ? 'ઇન્ડોર તાણ વિશ્લેષણ' : lang === 'hi' ? 'इनडोर तनाव विश्लेषण' : 'Indoor Stress Triage'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Progression CTA & Alternative Paths */}
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <button
            onClick={onContinue}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-base font-bold py-4 px-8 rounded-2xl shadow-md transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>
              {t.continueBtn} ({selectedType === 'farmer' ? t.farmerTitle : t.urbanTitle})
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Authentication alternatives */}
          <div className="flex items-center justify-between w-full text-xs text-[#546b5e] pt-2 px-2">
            <button
              onClick={onSignIn}
              className="hover:text-[#245C43] font-bold transition-colors cursor-pointer"
            >
              {t.signInPrompt} <span className="underline underline-offset-4">{t.signIn}</span>
            </button>
            <span>·</span>
            <button
              onClick={onContinueGuest}
              className="hover:text-[#245C43] font-bold transition-colors cursor-pointer"
            >
              {t.continueGuest}
            </button>
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-5 border-t border-[#8FAF91]/25 text-center text-xs text-[#6B8576]">
        <span>
          {lang === 'gu'
            ? 'પ્લાન્ટપલ્સ એઆઈ એન્જિન તમારા ખેતી કે બાગકામના પરિવેશ અનુસાર યોગ્ય સલાહ આપે છે.'
            : lang === 'hi'
            ? 'प्लांटपल्स एआई इंजन आपके कृषि अथवा बागवानी परिवेश के अनुसार सटीक सलाह देता है।'
            : 'PlantPulse Intelligence Engine adapts disease probability models and irrigation curves to your calibrated environment.'}
        </span>
      </footer>
    </div>
  );
};
