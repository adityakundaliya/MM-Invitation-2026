import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { buildFlightPath } from '../utils/flightPath';

// How long the plane takes from bottom-left corner to top-right corner (ms)
const FLIGHT_DURATION_MS = 5800;
// How long the dotted trail lingers and fades after the plane has gone (ms)
const TRAIL_FADE_MS = 1300;

interface StampingFlightProps {
  /** Fires once, when the plane reaches the lowest point of its loop and releases the stamp */
  onStampDrop: () => void;
  /** Fires once the flight and the trail fade-out are completely finished */
  onComplete: () => void;
}

// Speed profile: eases in over the first 30% of the time, then cruises. Returns distance fraction 0..1.
const A = 0.3;
const V0 = 0.55;
const P_AT_A = A * (V0 + 0.5 * (1 - V0));
const P_TOTAL = P_AT_A + (1 - A);
const progress = (t: number): number => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t <= A) {
    const x = t / A;
    return (V0 * t + (1 - V0) * A * (x * x * x - 0.5 * x * x * x * x)) / P_TOTAL;
  }
  return (P_AT_A + (t - A)) / P_TOTAL;
};

export const StampingFlight: React.FC<StampingFlightProps> = ({ onStampDrop, onComplete }) => {
  const dropRef = useRef(onStampDrop);
  const doneRef = useRef(onComplete);
  dropRef.current = onStampDrop;
  doneRef.current = onComplete;

  const planeRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  const isPhone = window.innerWidth <= 860;
  const planeW = isPhone ? 96 : 120;
  const planeH = (planeW * 85) / 120;
  // Point of the jet that follows the path (roughly its centre of mass)
  const pivotX = (65 / 140) * planeW;
  const pivotY = (47.5 / 95) * planeH;

  useEffect(() => {
    let raf = 0;
    const timers: number[] = [];
    let dropped = false;

    // Respect "reduce motion": no flight, just deliver the stamp
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timers.push(
        window.setTimeout(() => {
          dropRef.current();
          doneRef.current();
        }, 250),
      );
      return () => timers.forEach(window.clearTimeout);
    }

    const W = window.innerWidth;
    const H = window.innerHeight;
    const path = buildFlightPath(W, H);
    const pts = path.xs.map((x, i) => x.toFixed(1) + ',' + path.ys[i].toFixed(1));
    const tailOffset = planeW * 0.45; // trail starts at the plane's tail, not under its body
    let lastK = -1;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(Math.max((now - start) / FLIGHT_DURATION_MS, 0), 1);
      const s = progress(t) * path.total;

      // Plane position + heading (interpolated between samples)
      const fi = Math.min(s / path.step, path.xs.length - 1.001);
      const i = Math.floor(fi);
      const f = fi - i;
      const x = path.xs[i] + (path.xs[i + 1] - path.xs[i]) * f;
      const y = path.ys[i] + (path.ys[i + 1] - path.ys[i]) * f;
      const ang = path.angs[i] + (path.angs[i + 1] - path.angs[i]) * f;

      const plane = planeRef.current;
      const rot = rotRef.current;
      if (plane && rot) {
        plane.style.transform = `translate3d(${(x - pivotX).toFixed(1)}px, ${(y - pivotY).toFixed(1)}px, 0)`;
        rot.style.transform = `rotate(${ang.toFixed(4)}rad)`;
        plane.style.opacity = '1';
      }

      // Dotted trail grows behind the plane
      const k = Math.floor(Math.max(0, s - tailOffset) / path.step);
      if (k !== lastK && trailRef.current) {
        lastK = k;
        trailRef.current.setAttribute('d', k > 0 ? 'M' + pts.slice(0, k + 1).join('L') : '');
      }

      // Release the stamp at the lowest point of the loop
      if (!dropped && s >= path.dropS) {
        dropped = true;
        dropRef.current();
      }

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        if (!dropped) {
          dropped = true;
          dropRef.current();
        }
        if (plane) plane.style.display = 'none';
        layerRef.current?.classList.add('is-fading');
        timers.push(window.setTimeout(() => doneRef.current(), TRAIL_FADE_MS + 100));
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div ref={layerRef} className="plane-flight-layer" aria-hidden="true">
      <svg className="plane-flight-trail" width="100%" height="100%">
        <path
          ref={trailRef}
          d=""
          fill="none"
          stroke="#841924"
          strokeWidth={isPhone ? 2.6 : 3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`0.01 ${isPhone ? 9 : 11}`}
        />
      </svg>

      <div ref={planeRef} className="plane-flight-plane" style={{ width: planeW, height: planeH }}>
        <div ref={rotRef} className="plane-flight-rot" style={{ transformOrigin: `${pivotX}px ${pivotY}px` }}>
          <svg width={planeW} height={planeH} viewBox="0 0 140 95" fill="none" style={{ overflow: 'visible', display: 'block' }}>
          <defs>
            {/* Contrail Jet Flame Gradient */}
            <linearGradient id="stampJetContrail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(223, 186, 87, 0)" />
              <stop offset="40%" stopColor="rgba(223, 186, 87, 0.4)" />
              <stop offset="75%" stopColor="rgba(255, 235, 175, 0.85)" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* Metallic Pearl Fuselage Gradient */}
            <linearGradient id="stampFuselageGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fdfbf7" />
              <stop offset="75%" stopColor="#f3e8d5" />
              <stop offset="100%" stopColor="#dfba57" />
            </linearGradient>

            {/* Royal Burgundy Wing Gradient */}
            <linearGradient id="stampWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9e202e" />
              <stop offset="60%" stopColor="#841924" />
              <stop offset="100%" stopColor="#550c14" />
            </linearGradient>

            {/* Cockpit Glass Glint Gradient */}
            <linearGradient id="stampCockpitGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a0d8ef" />
              <stop offset="45%" stopColor="#1a365d" />
              <stop offset="100%" stopColor="#0c1c38" />
            </linearGradient>

            {/* Polished Gold Trim Gradient */}
            <linearGradient id="stampGoldMetal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dfba57" />
              <stop offset="50%" stopColor="#fff2c2" />
              <stop offset="100%" stopColor="#b3891f" />
            </linearGradient>
          </defs>

          {/* Jet Engine Exhaust Contrails */}
          <g className="jet-exhaust-trails">
            <path d="M -15,42 Q 10,43 32,45" stroke="url(#stampJetContrail)" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
            <path d="M -15,53 Q 10,52 32,50" stroke="url(#stampJetContrail)" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
            {/* Engine Core Glow */}
            <ellipse cx="28" cy="45" rx="5" ry="3" fill="#ffcc00" opacity="0.8" />
            <ellipse cx="28" cy="50" rx="5" ry="3" fill="#ffcc00" opacity="0.8" />
          </g>

          {/* Port (Top) Wing - Swept Back Delta Wing */}
          <polygon points="68,42 34,8 48,7 86,43" fill="url(#stampWingGrad)" stroke="url(#stampGoldMetal)" strokeWidth="1" />
          {/* Leading Edge Gold Slats */}
          <line x1="48" y1="7" x2="86" y2="43" stroke="url(#stampGoldMetal)" strokeWidth="1.8" strokeLinecap="round" />
          {/* Wingtip Strobe (Red) */}
          <circle cx="34" cy="8" r="2.5" fill="#ff3b30" />
          <circle cx="34" cy="8" r="4.5" fill="rgba(255, 59, 48, 0.4)" />

          {/* Diplomatic Clearance Stamp Cylinder (Undercarriage Mechanism) */}
          <g className="stamp-undercarriage-apparatus">
            <rect x="52" y="48" width="16" height="8" rx="2" fill="url(#stampGoldMetal)" stroke="#841924" strokeWidth="0.8" />
            <circle cx="60" cy="56" r="4.5" fill="#841924" stroke="url(#stampGoldMetal)" strokeWidth="1" />
            <circle cx="60" cy="56" r="2" fill="#dfba57" />
          </g>

          {/* Main Fuselage (Sleek Supersonic Jet Body) */}
          <path
            d="M 132,47 C 118,40 65,37 32,40 C 18,41 6,44 2,47 C 6,50 18,53 32,54 C 65,57 118,54 132,47 Z"
            fill="url(#stampFuselageGrad)"
            stroke="url(#stampGoldMetal)"
            strokeWidth="1.2"
          />

          {/* Royal Burgundy Cheatline across Fuselage */}
          <path d="M 28,47 L 122,47" stroke="#841924" strokeWidth="3" strokeLinecap="round" />
          <path d="M 32,49 L 118,49" stroke="url(#stampGoldMetal)" strokeWidth="0.8" />

          {/* Nose Radome Cone in Gold */}
          <path d="M 126,47 C 132,46 137,46.5 140,47 C 137,47.5 132,48 126,47 Z" fill="url(#stampGoldMetal)" />

          {/* Cockpit Windshield Canopy */}
          <path
            d="M 108,44 Q 118,45.5 120,47 Q 118,48.5 108,50 Z"
            fill="url(#stampCockpitGlass)"
            stroke="url(#stampGoldMetal)"
            strokeWidth="0.8"
          />
          {/* Canopy Glare Reflection */}
          <path d="M 110,44.5 Q 116,45.5 118,47" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />

          {/* Cabin Passenger Windows (Round executive portholes) */}
          <circle cx="96" cy="45.5" r="1.6" fill="#0c1c38" />
          <circle cx="88" cy="45.5" r="1.6" fill="#0c1c38" />
          <circle cx="80" cy="45.5" r="1.6" fill="#0c1c38" />
          <circle cx="72" cy="45.5" r="1.6" fill="#0c1c38" />
          <circle cx="64" cy="45.5" r="1.6" fill="#0c1c38" />
          <circle cx="56" cy="45.5" r="1.6" fill="#0c1c38" />

          {/* Starboard (Bottom) Wing */}
          <polygon points="68,52 34,87 48,88 86,51" fill="url(#stampWingGrad)" stroke="url(#stampGoldMetal)" strokeWidth="1" />
          {/* Leading Edge Gold Slats */}
          <line x1="48" y1="88" x2="86" y2="51" stroke="url(#stampGoldMetal)" strokeWidth="1.8" strokeLinecap="round" />
          {/* Wingtip Strobe (Green/Gold) */}
          <circle cx="34" cy="87" r="2.5" fill="#dfba57" />
          <circle cx="34" cy="87" r="4.5" fill="rgba(223, 186, 87, 0.4)" />

          {/* Twin Turbojet Engine Pods */}
          <ellipse cx="58" cy="35" rx="10" ry="3.5" fill="#2d3748" stroke="url(#stampGoldMetal)" strokeWidth="0.8" />
          <ellipse cx="64" cy="35" rx="2.5" ry="3" fill="#dfba57" />
          <ellipse cx="58" cy="60" rx="10" ry="3.5" fill="#2d3748" stroke="url(#stampGoldMetal)" strokeWidth="0.8" />
          <ellipse cx="64" cy="60" rx="2.5" ry="3" fill="#dfba57" />

          {/* Tail Fin / Stabilizer (Empennage) with Matchbox Crest */}
          <polygon points="26,44 8,18 18,18 36,44" fill="url(#stampWingGrad)" stroke="url(#stampGoldMetal)" strokeWidth="1" />
          <line x1="8" y1="18" x2="18" y2="18" stroke="url(#stampGoldMetal)" strokeWidth="2" />
          {/* Matchbox Star on Tail */}
          <polygon points="20,28 22,33 27,33 23,36 25,41 20,38 15,41 17,36 13,33 18,33" fill="#dfba57" transform="scale(0.6) translate(12, 16)" />
        </svg>
        </div>
      </div>
    </div>,
    document.body,
  );
};
