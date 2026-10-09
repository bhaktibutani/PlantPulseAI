import React from 'react';
import { Activity, CloudRain, Droplets, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface FloatingCardProps {
  className?: string;
}

export const HeroBotanicalComposition: React.FC<FloatingCardProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full aspect-[4/3] lg:aspect-[16/11] max-w-2xl select-none ${className}`}>
      {/* Background Ambient Glow & Depth Scrim */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#8FAF91]/30 via-[#E8F1E7]/60 to-[#9A7653]/15 rounded-3xl blur-2xl opacity-75" />

      {/* Main Photographic-Grade Botanical Frame */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[#8FAF91]/40 bg-gradient-to-br from-[#1B3E2F] via-[#245C43] to-[#122A1F] shadow-2xl flex items-center justify-center">
        {/* Subtle Organic Leaf Texture & Chlorophyll Mesh SVG */}
        <svg
          viewBox="0 0 600 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        >
          <defs>
            <radialGradient id="sunGlow" cx="70%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#8FAF91" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#245C43" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#122A1F" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="leafVeinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8F1E7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8FAF91" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Radial light wash */}
          <rect width="600" height="450" fill="url(#sunGlow)" />

          {/* Large Botanical Leaf Vein Architecture */}
          <g opacity="0.35" stroke="url(#leafVeinGrad)" strokeLinecap="round">
            {/* Primary Spine */}
            <path d="M300 420C280 320 290 200 360 40" strokeWidth="3" />
            
            {/* Left Secondary Veins */}
            <path d="M295 380C240 360 170 330 110 320" strokeWidth="1.8" />
            <path d="M290 320C220 290 150 250 80 230" strokeWidth="1.8" />
            <path d="M292 250C210 210 130 170 90 140" strokeWidth="1.8" />
            <path d="M305 180C230 140 160 100 130 60" strokeWidth="1.8" />
            <path d="M325 110C260 80 200 50 170 20" strokeWidth="1.8" />

            {/* Right Secondary Veins */}
            <path d="M298 370C360 350 430 320 500 310" strokeWidth="1.8" />
            <path d="M295 300C370 270 450 230 520 200" strokeWidth="1.8" />
            <path d="M302 230C380 190 460 150 510 110" strokeWidth="1.8" />
            <path d="M320 160C390 120 460 80 480 40" strokeWidth="1.8" />
          </g>

          {/* Microscopic Cellular Vitality Network */}
          <circle cx="340" cy="180" r="110" stroke="#8FAF91" strokeWidth="1" strokeDasharray="3 4" opacity="0.25" />
          <circle cx="340" cy="180" r="70" stroke="#E5A93D" strokeWidth="1" strokeDasharray="2 3" opacity="0.35" />

          {/* Precision Biosensor Grid Overlay */}
          <g opacity="0.2" stroke="#E8F1E7" strokeWidth="0.8">
            <line x1="80" y1="60" x2="520" y2="60" strokeDasharray="4 6" />
            <line x1="80" y1="180" x2="520" y2="180" strokeDasharray="4 6" />
            <line x1="80" y1="300" x2="520" y2="300" strokeDasharray="4 6" />
            <line x1="80" y1="400" x2="520" y2="400" strokeDasharray="4 6" />
            <line x1="160" y1="40" x2="160" y2="410" strokeDasharray="4 6" />
            <line x1="320" y1="40" x2="320" y2="410" strokeDasharray="4 6" />
            <line x1="480" y1="40" x2="480" y2="410" strokeDasharray="4 6" />
          </g>

          {/* Live Continuous Heartbeat Pulse Line across the botanical core */}
          <path
            d="M50 240H220L235 210L255 285L275 140L300 320L320 200L340 240H550"
            stroke="#F7F5EF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse-line"
          />
          <circle cx="275" cy="140" r="4.5" fill="#E5A93D" />
          <circle cx="300" cy="320" r="4" fill="#8FAF91" />
        </svg>

        {/* Ambient Dark Bottom Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#122A1F]/90 via-transparent to-black/20 pointer-events-none" />

        {/* Real Product Floating UI 1: TOMATO HEALTH PULSE CARD (Top Right) */}
        <div className="absolute top-6 right-6 w-60 rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-xl border border-white/60 animate-float-slow text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#245C43] animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#9A7653]">
                TOMATO
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F1E7] text-[#245C43]">
              Plot 4B
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#546b5e]">
              Health Pulse
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#245C43] font-mono">
                87
              </span>
              <span className="text-xs text-[#546b5e] font-medium">/ 100</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#245C43] mb-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#245C43]" />
            <span>Healthy · Peak Vitality</span>
          </div>

          {/* Mini pulse wave line */}
          <div className="h-6 w-full bg-[#F7F5EF] rounded-lg px-2 flex items-center justify-center overflow-hidden border border-[#8FAF91]/30">
            <svg viewBox="0 0 100 24" fill="none" className="w-full h-full">
              <path
                d="M5 12H25L32 5L42 20L52 3L60 18L68 12H95"
                stroke="#245C43"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Real Product Floating UI 2: SMART ACTION / WEATHER (Bottom Left) */}
        <div className="absolute bottom-6 left-6 w-64 rounded-2xl bg-[#F7F5EF]/95 backdrop-blur-md p-4 shadow-xl border border-[#8FAF91]/40 animate-float-delayed text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#245C43]">
              <CloudRain className="w-4 h-4 text-[#245C43]" />
              <span>Rain Probability</span>
            </div>
            <span className="text-xs font-extrabold text-[#245C43] font-mono">
              80%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-[#8FAF91]/30">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9A7653] mb-0.5">
              Smart Action
            </div>
            <p className="text-xs font-bold text-[#245C43]">
              No watering needed today
            </p>
            <p className="text-[11px] text-[#546b5e] mt-0.5">
              Precipitation sufficient for next 36 hrs
            </p>
          </div>
        </div>

        {/* Real Product Floating UI 3: AI PLANT DOCTOR WARNING (Center Right Bottom) */}
        <div className="hidden sm:block absolute bottom-8 right-8 max-w-[230px] rounded-2xl bg-[#17382B]/90 backdrop-blur-md p-3.5 shadow-xl border border-[#8FAF91]/30 text-left text-white">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E5A93D] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Plant Doctor</span>
          </div>
          <p className="text-xs text-[#E8F1E7] leading-relaxed">
            “Your tomato may be showing early signs of moisture saturation.”
          </p>
        </div>
      </div>
    </div>
  );
};

export const FarmerCardGraphic: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1C4230] to-[#122A1F] border border-[#8FAF91]/30 ${className}`}>
      <svg viewBox="0 0 400 250" fill="none" className="w-full h-full object-cover">
        {/* Soft morning sun aura */}
        <circle cx="320" cy="50" r="60" fill="#E5A93D" fillOpacity="0.25" />
        <circle cx="320" cy="50" r="30" fill="#E5A93D" fillOpacity="0.45" />

        {/* Rolling fertile agricultural hills */}
        <path d="M0 130Q100 100 200 120Q300 140 400 110V250H0Z" fill="#245C43" fillOpacity="0.7" />
        <path d="M0 160Q120 145 240 165Q340 180 400 155V250H0Z" fill="#1C3829" />

        {/* Furrowed field soil lines */}
        <path d="M0 185Q200 195 400 205" stroke="#9A7653" strokeWidth="3" strokeDasharray="6 3" />
        <path d="M0 210Q200 220 400 230" stroke="#9A7653" strokeWidth="3.5" />
        <path d="M0 235Q200 240 400 248" stroke="#9A7653" strokeWidth="4" />

        {/* Field crop rows */}
        <g stroke="#8FAF91" strokeWidth="2.5" strokeLinecap="round">
          <path d="M60 190V130" />
          <path d="M60 155L48 140" />
          <path d="M60 150L72 135" />
          <circle cx="60" cy="125" r="4" fill="#E8F1E7" />

          <path d="M120 200V120" />
          <path d="M120 150L106 130" />
          <path d="M120 140L134 125" />
          <circle cx="120" cy="115" r="5" fill="#E8F1E7" />

          <path d="M190 205V135" />
          <path d="M190 165L178 145" />
          <path d="M190 155L202 140" />
          <circle cx="190" cy="130" r="4.5" fill="#E8F1E7" />

          <path d="M260 215V140" />
          <path d="M260 170L248 150" />
          <path d="M260 160L272 145" />
          <circle cx="260" cy="135" r="4.5" fill="#E8F1E7" />
        </g>
      </svg>
      <div className="absolute bottom-3 left-3 bg-[#17382B]/85 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Field Telemetry · Acreage Calibrated</span>
      </div>
    </div>
  );
};

export const UrbanCardGraphic: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-[#2D4539] to-[#1E3027] border border-[#8FAF91]/30 ${className}`}>
      <svg viewBox="0 0 400 250" fill="none" className="w-full h-full object-cover">
        {/* Soft balcony glass arch */}
        <path d="M80 250V80C80 35 130 10 200 10C270 10 320 35 320 80V250" stroke="#8FAF91" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
        
        {/* Warm daylight sunlight beam */}
        <path d="M120 40L300 250H150L60 120Z" fill="#E5A93D" fillOpacity="0.12" />

        {/* Terrace Railing */}
        <line x1="20" y1="180" x2="380" y2="180" stroke="#9A7653" strokeWidth="2.5" />
        <line x1="20" y1="220" x2="380" y2="220" stroke="#9A7653" strokeWidth="2" />

        {/* Terracotta Plant Pot 1 */}
        <path d="M120 180L130 225H180L190 180H120Z" fill="#9A7653" />
        <rect x="116" y="174" width="78" height="8" rx="3" fill="#B3865D" />

        {/* Vibrant Monstera Leaves */}
        <path d="M155 174C155 130 120 105 100 90C125 98 150 115 158 150" fill="#8FAF91" />
        <path d="M155 174C155 125 190 100 215 85C195 100 175 125 160 160" fill="#E8F1E7" />
        <path d="M155 174V95C155 70 170 55 180 50C175 75 168 95 158 120" fill="#245C43" />

        {/* Terracotta Herb Pot 2 */}
        <path d="M240 190L248 225H285L293 190H240Z" fill="#9A7653" />
        <circle cx="266" cy="165" r="22" fill="#245C43" fillOpacity="0.85" />
        <line x1="266" y1="190" x2="266" y2="165" stroke="#E8F1E7" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="absolute bottom-3 left-3 bg-[#17382B]/85 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Balcony & Terrace · Microclimate Mode</span>
      </div>
    </div>
  );
};
