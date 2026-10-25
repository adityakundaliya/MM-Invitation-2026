import React from 'react';
import { EVENT_CONFIG } from '../config/eventConfig';

interface AirplaneBannerProps {
  /** Fades the looping banner plane out (e.g. while the passport is open and the stamping plane flies) */
  visible?: boolean;
}

export const AirplaneBanner: React.FC<AirplaneBannerProps> = ({ visible = true }) => {
  return (
    <div
      className="airplane-flight-track"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: '12%',
        right: 0,
        zIndex: 20, // above the passport scene (z-index 10) so the plane flies OVER it, below the header (50)
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transition: visible
          ? 'opacity 0.6s ease'
          : 'opacity 0.5s ease, visibility 0s linear 0.5s',
      }}
    >
      <div
        className="airplane-and-banner-rig"
        style={{
          display: 'flex',
          alignItems: 'center',
          filter: 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.5))',
        }}
      >
        {/* ======================================================== */}
        {/* AIRPLANE (High-Detail Vector Airplane facing LEFT) */}
        {/* ======================================================== */}
        <div style={{ position: 'relative', width: '135px', height: '65px', flexShrink: 0 }}>
          <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Propeller Blur / Spinner */}
            <ellipse cx="14" cy="50" rx="4" ry="24" fill="rgba(255, 255, 255, 0.45)" className="propeller-spin" />
            <line x1="14" y1="28" x2="14" y2="72" stroke="#dfba57" strokeWidth="2.5" strokeLinecap="round" className="propeller-spin" />

            {/* Propeller Hub */}
            <circle cx="14" cy="50" r="4.5" fill="#c59b27" />

            {/* Main Fuselage Body (Navy & Cream with Gold pinstripe) */}
            {/* Top Cowling & Nose */}
            <path
              d="M 14,50 Q 25,32 60,30 L 160,38 Q 185,42 192,48 L 192,54 Q 180,60 140,65 L 50,68 Q 22,66 14,50 Z"
              fill="url(#fuselageGrad)"
              stroke="#dfba57"
              strokeWidth="1.2"
            />

            {/* Cabin Window / Cockpit Windshield */}
            <path
              d="M 45,35 L 75,34 L 85,43 L 42,43 Z"
              fill="#7ec8e3"
              stroke="#dfba57"
              strokeWidth="1"
              opacity="0.85"
            />
            {/* Cockpit Glint */}
            <line x1="50" y1="36" x2="60" y2="42" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

            {/* Wing (Main Left/Top Wing) */}
            <path
              d="M 68,46 L 115,20 L 135,21 L 102,48 Z"
              fill="#dfba57"
              stroke="#9e7d23"
              strokeWidth="1"
            />
            {/* Wing Trim / Striping */}
            <line x1="78" y1="42" x2="118" y2="22" stroke="#841924" strokeWidth="2.5" />

            {/* Tail Fin (Vertical Stabilizer) */}
            <path
              d="M 165,40 L 190,14 L 196,16 L 188,48 Z"
              fill="#841924"
              stroke="#dfba57"
              strokeWidth="1"
            />
            {/* Tail Crest Star */}
            <polygon points="186,28 188,33 193,33 189,36 191,41 186,38 181,41 183,36 179,33 184,33" fill="#dfba57" />

            {/* Horizontal Stabilizer (Elevator) */}
            <path
              d="M 172,50 L 196,48 L 194,56 L 174,54 Z"
              fill="#c59b27"
              stroke="#081226"
              strokeWidth="0.8"
            />

            {/* Landing Gear */}
            <line x1="72" y1="65" x2="66" y2="80" stroke="#c59b27" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="66" cy="81" r="5" fill="#111" stroke="#dfba57" strokeWidth="1.5" />

            {/* Tail Wheel */}
            <circle cx="178" cy="62" r="2.5" fill="#111" />

            {/* Matchbox Emblem on Fuselage */}
            <rect x="96" y="50" width="18" height="8" rx="2" fill="#081226" stroke="#dfba57" strokeWidth="0.8" />
            <text x="105" y="56" fill="#dfba57" fontSize="5" fontFamily="Cinzel" fontWeight="bold" textAnchor="middle">MB</text>

            {/* Tow Hook on Tail */}
            <circle cx="194" cy="51" r="2" fill="#dfba57" />

            {/* Gradients */}
            <defs>
              <linearGradient id="fuselageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a325a" />
                <stop offset="45%" stopColor="#0c1c38" />
                <stop offset="55%" stopColor="#841924" />
                <stop offset="100%" stopColor="#5c0f18" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ======================================================== */}
        {/* TOW BRIDLE ROPES */}
        {/* ======================================================== */}
        <div style={{ position: 'relative', width: '38px', height: '40px', flexShrink: 0 }}>
          <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <line x1="0" y1="20" x2="40" y2="6" stroke="#d8c4a5" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.8" />
            <line x1="0" y1="20" x2="40" y2="34" stroke="#d8c4a5" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.8" />
          </svg>
        </div>

        {/* ======================================================== */}
        {/* TRAILING FABRIC BANNER: "MARKETING MURLIDHAR" */}
        {/* ======================================================== */}
        <div
          className="airplane-banner-cloth"
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #fbf8f2 0%, #f4ecdf 50%, #ebdcc8 100%)',
            border: '1.5px solid #dfba57',
            borderLeft: '4px solid #841924',
            borderRadius: '4px 10px 10px 4px',
            padding: '7px 22px 7px 18px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), inset 0 0 15px rgba(223, 186, 87, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* Banner Brass Grommets */}
          <div style={{ position: 'absolute', top: '5px', left: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#c59b27', border: '1px solid #7a5f14' }} />
          <div style={{ position: 'absolute', bottom: '5px', left: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#c59b27', border: '1px solid #7a5f14' }} />

          {/* Banner Ribbons / Streamer Cutout on Right */}
          <div
            style={{
              position: 'absolute',
              right: '-14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '16px solid transparent',
              borderBottom: '16px solid transparent',
              borderLeft: '14px solid #ebdcc8',
              filter: 'drop-shadow(2px 0 2px rgba(0,0,0,0.15))',
            }}
          />

          {/* EXACT REQUIRED BANNER TEXT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#dfba57', fontSize: '0.75rem' }}>★</span>
            <span
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontWeight: 900,
                fontSize: 'clamp(0.85rem, 1.4vw, 1.15rem)',
                letterSpacing: '0.14em',
                color: '#841924',
                textShadow: '0 1px 1px rgba(255, 255, 255, 0.9), 0 0 2px rgba(132, 25, 36, 0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              {EVENT_CONFIG.shortName}
            </span>
            <span style={{ color: '#dfba57', fontSize: '0.75rem' }}>★</span>
          </div>

          {/* Subtitle ribbon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '1px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '0.68rem',
                color: '#0c1c38',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {EVENT_CONFIG.edition} • 2026
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flyRightToLeftSmooth {
          0% {
            transform: translate3d(120vw, 0, 0);
          }
          100% {
            transform: translate3d(-140vw, 0, 0);
          }
        }

        @keyframes propSpin {
          0% { transform: scaleY(1); opacity: 0.6; }
          50% { transform: scaleY(0.7); opacity: 0.9; }
          100% { transform: scaleY(1); opacity: 0.6; }
        }

        .airplane-flight-track {
          animation: flyRightToLeftSmooth 18s linear infinite;
        }

        .propeller-spin {
          transform-origin: 14px 50px;
          animation: propSpin 0.08s linear infinite;
        }
      `}</style>
    </div>
  );
};
