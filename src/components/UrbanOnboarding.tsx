import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import { GUJARAT_DISTRICTS, INITIAL_URBAN_PLANTS, URBAN_GROWING_LOCATIONS } from '../data/gujaratLocations.ts';
import { Language, translations } from '../data/translations.ts';
import { ArrowLeft, ArrowRight, Check, MapPin, Sun, Droplets, Home, Globe } from 'lucide-react';

export interface UrbanOnboardingData {
  state: string;
  districtId: string;
  districtName: string;
  cityArea: string;
  growingLocationId: string;
  growingLocationName: string;
  plantId: string;
  plantName: string;
}

interface UrbanOnboardingProps {
  initialData?: Partial<UrbanOnboardingData>;
  onComplete: (data: UrbanOnboardingData) => void;
  onBack: () => void;
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const UrbanOnboarding: React.FC<UrbanOnboardingProps> = ({
  initialData,
  onComplete,
  onBack,
  lang,
  onLanguageChange,
}) => {
  const t = translations[lang];

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
    initialData?.districtId || 'rajkot'
  );

  const currentDistrict =
    GUJARAT_DISTRICTS.find((d) => d.id === selectedDistrictId) || GUJARAT_DISTRICTS[0];

  const [selectedCityArea, setSelectedCityArea] = useState<string>(
    initialData?.cityArea || currentDistrict.cities[lang][0]
  );

  const [growingLocationId, setGrowingLocationId] = useState<string>(
    initialData?.growingLocationId || 'balcony'
  );

  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    initialData?.plantId || 'tomato'
  );

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distId = e.target.value;
    setSelectedDistrictId(distId);
    const districtObj = GUJARAT_DISTRICTS.find((d) => d.id === distId);
    if (districtObj) {
      setSelectedCityArea(districtObj.cities[lang][0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const locObj = URBAN_GROWING_LOCATIONS.find((l) => l.id === growingLocationId) || URBAN_GROWING_LOCATIONS[1];
    const plantObj = INITIAL_URBAN_PLANTS.find((p) => p.id === selectedPlantId) || INITIAL_URBAN_PLANTS[0];

    onComplete({
      state: 'Gujarat',
      districtId: selectedDistrictId,
      districtName: currentDistrict.name[lang],
      cityArea: selectedCityArea,
      growingLocationId,
      growingLocationName: locObj.name[lang],
      plantId: selectedPlantId,
      plantName: plantObj.name[lang],
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col justify-between selection:bg-[#E8F1E7] selection:text-[#245C43]">
      {/* Top Bar */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#8FAF91]/30">
        <Logo size="md" />
        <div className="flex items-center gap-3">
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

      {/* Main Container */}
      <main className="w-full max-w-3xl mx-auto px-6 py-10 flex-1 flex flex-col justify-center text-left">
        {/* Onboarding Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#9A7653] bg-[#FAF8F3] px-3.5 py-1.5 rounded-full border border-[#8FAF91]/35 mb-3">
            <span>
              {lang === 'gu'
                ? '🪴 અર્બન ગાર્ડનર કેલિબ્રેશન · પગલું ૨/૨'
                : lang === 'hi'
                ? '🪴 शहरी योजनाकार कैलिब्रेशन · चरण २/२'
                : '🪴 URBAN GARDENER CALIBRATION · STEP 2 OF 2'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17382B] font-display">
            {t.onboardingUrbanTitle}
          </h2>
          <p className="text-sm text-[#476353] mt-1.5">
            {t.onboardingUrbanSub}
          </p>
        </div>

        {/* Card Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-[#8FAF91]/35 p-6 sm:p-8 shadow-xs space-y-6"
        >
          {/* Step 1: State & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#17382B] block mb-1.5">
                {t.stateLabel}
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/30 text-xs font-bold text-[#245C43]">
                <MapPin className="w-4 h-4 text-[#9A7653] shrink-0" />
                <span>Gujarat (ગુજરાત)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17382B] block mb-1.5">
                {t.districtLabel}
              </label>
              <select
                value={selectedDistrictId}
                onChange={handleDistrictChange}
                className="w-full p-3 text-xs sm:text-sm font-semibold rounded-xl border border-[#8FAF91]/40 bg-white text-[#17382B] focus:outline-none focus:ring-2 focus:ring-[#245C43]"
              >
                {GUJARAT_DISTRICTS.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {dist.name[lang]} ({dist.name.en})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: City / Urban Area */}
          <div>
            <label className="text-xs font-bold text-[#17382B] block mb-1.5">
              {t.cityLabel} ({currentDistrict.name[lang]})
            </label>
            <select
              value={selectedCityArea}
              onChange={(e) => setSelectedCityArea(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm font-semibold rounded-xl border border-[#8FAF91]/40 bg-white text-[#17382B] focus:outline-none focus:ring-2 focus:ring-[#245C43]"
            >
              {currentDistrict.cities[lang].map((city, idx) => (
                <option key={idx} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Growing Location */}
          <div>
            <label className="text-xs font-bold text-[#17382B] block mb-2">
              {t.growingLocationLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {URBAN_GROWING_LOCATIONS.map((loc) => {
                const isSelected = growingLocationId === loc.id;
                return (
                  <button
                    type="button"
                    key={loc.id}
                    onClick={() => setGrowingLocationId(loc.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-[#245C43] bg-[#E8F1E7] ring-2 ring-[#245C43] shadow-xs'
                        : 'border-[#8FAF91]/35 bg-[#FAF8F3] hover:border-[#8FAF91] hover:bg-white'
                    }`}
                  >
                    <span className="text-2xl">{loc.icon}</span>
                    <span className="text-xs font-bold text-[#17382B]">
                      {loc.name[lang]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Primary Urban Plant Selection */}
          <div>
            <label className="text-xs font-bold text-[#17382B] block mb-2">
              {t.plantLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {INITIAL_URBAN_PLANTS.map((plant) => {
                const isSelected = selectedPlantId === plant.id;
                return (
                  <button
                    type="button"
                    key={plant.id}
                    onClick={() => setSelectedPlantId(plant.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-[#245C43] bg-[#E8F1E7] ring-2 ring-[#245C43] shadow-xs'
                        : 'border-[#8FAF91]/35 bg-[#FAF8F3] hover:border-[#8FAF91] hover:bg-white'
                    }`}
                  >
                    <span className="text-2xl">{plant.icon}</span>
                    <span className="text-xs font-bold text-[#17382B]">
                      {plant.name[lang]}
                    </span>
                    <span className="text-[10px] text-[#546b5e] truncate max-w-full">
                      {plant.care}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-sm sm:text-base font-bold py-4 px-6 rounded-2xl shadow-md transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{t.completeOnboardingBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-4 border-t border-[#8FAF91]/25 text-center text-xs text-[#6B8576]">
        <span>PlantPulse Botanical Engine · Microclimate container and sunlight hours calibrated</span>
      </footer>
    </div>
  );
};
