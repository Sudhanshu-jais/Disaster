import React from 'react';

interface DisasterOSLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const DisasterOSLogo: React.FC<DisasterOSLogoProps> = ({
  className = '',
  size = 32,
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative flex items-center justify-center shrink-0 group cursor-pointer"
        style={{ width: size, height: size }}
      >
        {/* Ambient background glow */}
        <div 
          className="absolute inset-0 rounded-full bg-[#63BDF5]/25 blur-md group-hover:bg-[#35D6E8]/40 transition-all duration-300" 
        />
        
        {/* Coordinate crosshair & target reticle */}
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer coordinate ring with tick dashes */}
          <circle
            cx="20"
            cy="20"
            r="17"
            stroke="#63BDF5"
            strokeWidth="1.5"
            strokeDasharray="4 2.5"
            strokeOpacity="0.85"
            className="group-hover:rotate-45 transition-transform duration-700 origin-center"
          />

          {/* Inner concentric ring */}
          <circle
            cx="20"
            cy="20"
            r="11.5"
            stroke="#35D6E8"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />

          {/* Geospatial reticle cardinal axis ticks */}
          <line x1="20" y1="2" x2="20" y2="7" stroke="#63BDF5" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="20" y1="33" x2="20" y2="38" stroke="#63BDF5" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="2" y1="20" x2="7" y2="20" stroke="#63BDF5" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="33" y1="20" x2="38" y2="20" stroke="#63BDF5" strokeWidth="1.8" strokeLinecap="round" />

          {/* Emergency center diamond & core beacon */}
          <path
            d="M20 14L24 20L20 26L16 20Z"
            fill="#35D6E8"
            fillOpacity="0.9"
          />
          <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[15px] tracking-tight text-[#F5F7FB] font-sans">
              Disaster<span className="text-[#63BDF5]">OS</span>
            </span>
            <span className="px-1.5 py-0.2 text-[9.5px] font-bold font-mono tracking-widest text-[#050817] bg-[#63BDF5] rounded shadow-xs">
              AI
            </span>
          </div>
          <span className="text-[9.5px] font-mono tracking-wider text-[#9AA6BA] -mt-0.5">
            GEOSPATIAL COMMAND
          </span>
        </div>
      )}
    </div>
  );
};
