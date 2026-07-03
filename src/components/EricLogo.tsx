/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function EricLogo({ className = 'w-10 h-10', showText = true, src, title, subtitle }: { className?: string; showText?: boolean; src?: string; title?: string; subtitle?: string }) {
  if (src) {
    return (
      <div className="flex items-center gap-3 select-none">
        <img src={src} alt="ERIC Logo" className={`${className} object-contain`} />
        {showText && (
          <div className="flex flex-col">
            <span className="text-xl font-sans font-black tracking-tighter text-white leading-none">
              {title || 'ERIC'} <span className="text-[#FFEAA7]">2026</span>
            </span>
            {subtitle && (
              <span className="text-[7.5px] font-mono text-zinc-400 tracking-[0.15em] uppercase leading-none mt-1">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} transition-all duration-300`}
      >
        <defs>
          <linearGradient id="cyberSilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#C0C0C0" />
            <stop offset="100%" stopColor="#7F8C8D" />
          </linearGradient>
          <linearGradient id="cyberGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFEAA7" />
            <stop offset="60%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#DF9C1E" />
          </linearGradient>
          <linearGradient id="cyberBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="50%" stopColor="#0047AB" />
            <stop offset="100%" stopColor="#002D62" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Circular Ring representing Blue and Yellow Orbitals from logo */}
        <circle
          cx="250"
          cy="250"
          r="210"
          stroke="url(#cyberBlue)"
          strokeWidth="16"
          strokeDasharray="900 150"
          strokeLinecap="round"
          className="animate-[spin_40s_linear_infinite]"
        />
        <circle
          cx="250"
          cy="250"
          r="190"
          stroke="url(#cyberGold)"
          strokeWidth="8"
          strokeDasharray="500 200"
          strokeLinecap="round"
          className="animate-[spin_25s_linear_infinite_reverse]"
        />

        {/* Dynamic Chevron Shapes representing progress (metallic gold, silver, blue) */}
        <g transform="translate(230, 150)">
          {/* Chevron 1 - Yellow/Gold */}
          <path
            d="M50 30L100 120L65 140L15 50L50 30Z"
            fill="url(#cyberGold)"
            filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
          />
          {/* Chevron 2 - Silver */}
          <path
            d="M90 30L140 120L105 140L55 50L90 30Z"
            fill="url(#cyberSilver)"
            opacity="0.9"
          />
          {/* Chevron 3 - Blue */}
          <path
            d="M130 30L180 120L145 140L95 50L130 30Z"
            fill="url(#cyberBlue)"
          />
        </g>

        {/* Majestic Eagle Head - Detailed geometric/cybernetic styling */}
        <g transform="translate(80, 150)" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.4))">
          {/* Eagle neck feathers */}
          <path
            d="M100 130 C70 170, 75 220, 80 250 C120 230, 150 180, 160 140 Z"
            fill="url(#cyberSilver)"
          />
          <path
            d="M60 110 C30 155, 35 200, 40 235 C70 210, 100 170, 110 125 Z"
            fill="url(#cyberSilver)"
            opacity="0.75"
          />
          
          {/* Eagle skull */}
          <path
            d="M40 100 C40 40, 120 30, 180 60 C240 90, 248 115, 255 125 L170 125 C150 125, 120 100, 100 100 Z"
            fill="url(#cyberSilver)"
          />
          
          {/* Eagle beak - sharp and metallic gold */}
          <path
            d="M40 100 C15 102, 0 115, 10 135 C20 150, 48 152, 70 125 Z"
            fill="url(#cyberGold)"
          />

          {/* Eagle determined robot-eye */}
          <polygon
            points="120,75 145,82 125,90"
            fill="#FFD700"
            filter="url(#neonGlow)"
          />
          <line
            x1="110"
            y1="70"
            x2="155"
            y2="82"
            stroke="#050505"
            strokeWidth="3.5"
          />
        </g>
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-sans font-black tracking-tighter text-white leading-none">
            {title || 'ERIC'} <span className="text-[#FFEAA7]">2026</span>
          </span>
          {subtitle !== undefined ? (
            subtitle && <span className="text-[7.5px] font-mono text-zinc-400 tracking-[0.15em] uppercase leading-none mt-1">{subtitle}</span>
          ) : (
            <span className="text-[7.5px] font-mono text-zinc-400 tracking-[0.15em] uppercase leading-none mt-1">
              ROBOTICS LIGA
            </span>
          )}
        </div>
      )}
    </div>
  );
}
