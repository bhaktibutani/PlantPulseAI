import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'cream';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  variant = 'dark',
  className = '',
  onClick,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textStyles = {
    sm: 'text-base font-bold',
    md: 'text-lg font-bold',
    lg: 'text-2xl font-bold tracking-tight',
    xl: 'text-3xl font-extrabold tracking-tight',
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-[#17382B]';
  const subtextColor = variant === 'light' ? 'text-[#E8F1E7]/80' : 'text-[#9A7653]';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Precision Engineered Botanical Mark: Organic Leaf with Embedded Heartbeat Pulse Signal */}
      <div
        className={`relative flex shrink-0 items-center justify-center rounded-xl transition-all duration-300 shadow-sm ${iconDimensions[size]} bg-[#245C43] text-white overflow-hidden`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Organic Leaf Vessel Contour */}
          <path
            d="M20 4C11.5 8.5 6 16.5 6 26.5C11 30.5 18 31 23 27C30.5 21 33.5 12.5 34 5.5C27 6.5 23 4 20 4Z"
            fill="#8FAF91"
            fillOpacity="0.25"
          />
          <path
            d="M20 4C11.5 8.5 6 16.5 6 26.5C11 30.5 18 31 23 27C30.5 21 33.5 12.5 34 5.5C27 6.5 23 4 20 4Z"
            stroke="#F7F5EF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Precision Vitality Pulse Line intersecting the leaf vein */}
          <path
            d="M7 23H14L17 18L21 29L24 19L27 23H33"
            stroke="#F7F5EF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse-line"
          />

          {/* Plant Vitality Signal Point */}
          <circle cx="21" cy="29" r="1.5" fill="#E5A93D" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex min-w-0 flex-col">
        <div className="flex items-baseline gap-1.5 whitespace-nowrap leading-none">
          <span className={`font-display leading-none ${textStyles[size]} ${textColor}`}>
            PlantPulse
          </span>
          <span className="inline-flex h-4 items-center justify-center rounded-md bg-[#245C43] px-1.5 text-[10px] font-black uppercase leading-none tracking-wider text-white">
            AI
          </span>
        </div>
        {showTagline && (
          <span className={`text-[11px] font-medium tracking-normal mt-1 ${subtextColor}`}>
            Check the Pulse. Understand the Plant. Grow Better.
          </span>
        )}
      </div>
    </div>
  );
};
