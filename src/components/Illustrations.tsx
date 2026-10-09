import React from 'react';

export const BotanicalPulseHeroGraphic: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Soft Aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#E8F1E7] via-[#F7F5EF] to-[#8FAF91]/30 rounded-3xl blur-xl opacity-80" />

      {/* Main Vector Card */}
      <div className="relative w-full aspect-[4/3] max-w-lg rounded-2xl border border-[#8FAF91]/30 bg-gradient-to-b from-white/90 to-[#F7F5EF]/80 shadow-md p-6 flex flex-col items-center justify-between overflow-hidden">
        {/* Top telemetry ribbon */}
        <div className="w-full flex items-center justify-between text-xs text-[#245C43] font-medium border-b border-[#8FAF91]/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#245C43] animate-ping opacity-75" />
            <span className="font-semibold tracking-wide uppercase text-[11px] text-[#245C43]">
              Live Health Pulse Monitoring
            </span>
          </div>
          <span className="text-[#9A7653] font-mono text-[11px]">87 / 100 VITALITY</span>
        </div>

        {/* Central Botanical Leaf + Heartbeat Pulse Vector */}
        <div className="relative my-auto flex items-center justify-center w-full h-44">
          <svg
            viewBox="0 0 320 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full max-w-xs"
          >
            {/* Subtle Grid Lines */}
            <line x1="20" y1="90" x2="300" y2="90" stroke="#8FAF91" strokeOpacity="0.25" strokeDasharray="3 3" />
            <line x1="20" y1="45" x2="300" y2="45" stroke="#8FAF91" strokeOpacity="0.15" strokeDasharray="3 3" />
            <line x1="20" y1="135" x2="300" y2="135" stroke="#8FAF91" strokeOpacity="0.15" strokeDasharray="3 3" />

            {/* Stylized Botanical Leaf Base Silhouette */}
            <path
              d="M160 20C110 32 80 65 80 115C105 130 145 135 175 118C210 98 225 55 240 25C200 30 175 20 160 20Z"
              fill="#E8F1E7"
              stroke="#8FAF91"
              strokeWidth="2"
            />
            
            {/* Leaf Vein Structure */}
            <path d="M160 22C145 60 135 95 125 120" stroke="#8FAF91" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M148 55C170 52 195 56 210 50" stroke="#8FAF91" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M140 80C165 78 185 85 198 80" stroke="#8FAF91" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M132 105C148 103 165 106 175 103" stroke="#8FAF91" strokeWidth="1.2" strokeLinecap="round" />

            {/* Glowing Vitality Pulse Waveform that passes through the leaf */}
            <path
              d="M30 90H105L118 72L135 125L155 35L178 135L195 75L210 90H290"
              stroke="#245C43"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Moving pulse glow effect */}
            <circle cx="155" cy="35" r="4.5" fill="#E5A93D" className="animate-ping" />
            <circle cx="155" cy="35" r="3.5" fill="#E5A93D" />
            <circle cx="178" cy="135" r="3" fill="#245C43" />
          </svg>
        </div>

        {/* Bottom Metrics Pill Bar */}
        <div className="w-full grid grid-cols-4 gap-2 pt-3 border-t border-[#8FAF91]/20 text-center">
          <div className="bg-[#E8F1E7]/70 py-1.5 px-2 rounded-lg">
            <div className="text-[10px] text-[#245C43] font-semibold uppercase">Moisture</div>
            <div className="text-xs font-bold text-[#245C43]">82% · OK</div>
          </div>
          <div className="bg-[#E8F1E7]/70 py-1.5 px-2 rounded-lg">
            <div className="text-[10px] text-[#245C43] font-semibold uppercase">Foliage</div>
            <div className="text-xs font-bold text-[#245C43]">Clear</div>
          </div>
          <div className="bg-[#E8F1E7]/70 py-1.5 px-2 rounded-lg">
            <div className="text-[10px] text-[#245C43] font-semibold uppercase">Sunlight</div>
            <div className="text-xs font-bold text-[#245C43]">6.2 hrs</div>
          </div>
          <div className="bg-[#E5A93D]/15 py-1.5 px-2 rounded-lg">
            <div className="text-[10px] text-[#9A7653] font-semibold uppercase">Soil Nutrients</div>
            <div className="text-xs font-bold text-[#E5A93D]">Attention</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FarmerIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#E8F1E7] to-[#8FAF91]/30 p-4 ${className}`}>
      <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-36">
        {/* Soft Golden Sun */}
        <circle cx="150" cy="35" r="22" fill="#E5A93D" fillOpacity="0.3" />
        <circle cx="150" cy="35" r="14" fill="#E5A93D" fillOpacity="0.6" />

        {/* Distant Hills */}
        <path d="M0 85Q50 65 100 80Q150 95 200 75V140H0Z" fill="#8FAF91" fillOpacity="0.4" />
        
        {/* Furrowed Field Contour Lines */}
        <path d="M0 100Q100 105 200 110" stroke="#9A7653" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M0 115Q100 120 200 125" stroke="#9A7653" strokeWidth="2.5" />
        <path d="M0 130Q100 133 200 138" stroke="#9A7653" strokeWidth="3" />

        {/* Crop Stalks (Wheat / Cotton) */}
        <g stroke="#245C43" strokeWidth="2" strokeLinecap="round">
          {/* Stalk 1 */}
          <path d="M40 120V70" />
          <path d="M40 85L32 75" />
          <path d="M40 80L48 70" />
          <path d="M40 95L34 88" />
          <path d="M40 90L46 83" />
          <circle cx="40" cy="66" r="3" fill="#245C43" />

          {/* Stalk 2 */}
          <path d="M80 125V60" />
          <path d="M80 75L70 65" />
          <path d="M80 70L90 60" />
          <path d="M80 88L72 80" />
          <path d="M80 82L88 74" />
          <circle cx="80" cy="56" r="3.5" fill="#245C43" />

          {/* Stalk 3 */}
          <path d="M120 120V75" />
          <path d="M120 90L112 80" />
          <path d="M120 85L128 75" />
          <circle cx="120" cy="71" r="3" fill="#245C43" />
        </g>
      </svg>
    </div>
  );
};

export const UrbanGardenerIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#E8F1E7] to-[#8FAF91]/30 p-4 ${className}`}>
      <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-36">
        {/* Balcony / Window Arch Frame */}
        <path d="M40 140V40C40 18 67 0 100 0C133 0 160 18 160 40V140" stroke="#8FAF91" strokeWidth="1.5" strokeDasharray="3 3" />
        
        {/* Soft sunlight from window */}
        <path d="M60 25L140 140H60V25Z" fill="#E5A93D" fillOpacity="0.08" />

        {/* Terrace Railing */}
        <line x1="20" y1="110" x2="180" y2="110" stroke="#9A7653" strokeWidth="2" />
        <line x1="20" y1="135" x2="180" y2="135" stroke="#9A7653" strokeWidth="1.5" />

        {/* Terracotta Plant Pot 1 */}
        <path d="M65 110L72 135H98L105 110H65Z" fill="#9A7653" />
        <rect x="62" y="106" width="46" height="5" rx="2" fill="#885E3B" />

        {/* Lush Monstera / Potted Foliage */}
        <path d="M85 106C85 85 65 70 55 60C70 65 85 75 88 95" fill="#245C43" stroke="#245C43" strokeWidth="1.5" />
        <path d="M85 106C85 80 105 65 118 55C108 65 95 80 88 100" fill="#245C43" stroke="#245C43" strokeWidth="1.5" />
        <path d="M85 106V60C85 45 92 38 98 35C95 48 90 60 85 75" fill="#8FAF91" stroke="#8FAF91" strokeWidth="1.2" />

        {/* Small Herb Pot 2 */}
        <path d="M125 115L130 135H150L155 115H125Z" fill="#8FAF91" />
        <circle cx="140" cy="100" r="12" fill="#245C43" fillOpacity="0.8" />
        <line x1="140" y1="115" x2="140" y2="100" stroke="#245C43" strokeWidth="2" />
      </svg>
    </div>
  );
};
