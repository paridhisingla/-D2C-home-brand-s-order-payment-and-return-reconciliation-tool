import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtext?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtext = 'Production & TNA Engine',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-xl',
  }[size];

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Scalable SVG Emblem */}
      <div
        className={`${iconDimensions} rounded-xl bg-gradient-to-tr from-brand-900 via-brand-700 to-teal-500 p-1 flex items-center justify-center shadow-sm relative overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform`}
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          {/* Textile Weave Ribs */}
          <rect x="8" y="10" width="8" height="28" rx="3" fill="#14B8A6" fillOpacity="0.9" />
          <line x1="8" y1="17" x2="16" y2="17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="24" x2="16" y2="24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="31" x2="16" y2="31" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          
          {/* Dynamic Velocity Pointer / K-Weave */}
          <path
            d="M17 19L27 9C28.5 7.5 31 8.5 31 10.5V14.5C31 15.5 30.5 16.5 29.5 17L22 24L30 31.5C30.8 32.2 31 33.2 31 34V36.5C31 38.5 28.5 39.5 27 38L17 28"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="0.8"
          />
          {/* Central Precision Needle Pivot */}
          <circle cx="17.5" cy="24" r="3.2" fill="#FFFFFF" />
          <circle cx="17.5" cy="24" r="1.5" fill="#0F766E" />
        </svg>
      </div>

      {showText && (
        <div className="leading-tight">
          <div className={`font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 ${titleSizes}`}>
            <span>KnitTrack</span>
            <span className="text-brand-600 dark:text-teal-400 font-extrabold">Tiruppur</span>
          </div>
          {subtext && (
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
