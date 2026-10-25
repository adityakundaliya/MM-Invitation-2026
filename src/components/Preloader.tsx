import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import { EVENT_CONFIG } from '../config/eventConfig';
import { audioManager } from '../utils/audio';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  // Editorial sequence state: 0 (black) | 1 (Club Matchbox) | 2 (Presents) | 3 (Marketing Murlidhar)
  const [activeCard, setActiveCard] = useState<0 | 1 | 2 | 3>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const hasEnteredRef = useRef<boolean>(false);

  const handleEnter = () => {
    if (hasEnteredRef.current) return;
    hasEnteredRef.current = true;
    // Onboarding sound: fired straight from the tap so the browser always allows it
    audioManager.playOnboardingSound(EVENT_CONFIG.assets.onboardingSound);
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  useEffect(() => {
    // Start buffering the onboarding sound now (it does NOT play yet) so it fires instantly on tap
    audioManager.preloadOnboardingSound(EVENT_CONFIG.assets.onboardingSound);

    // Beat 1: "Club Matchbox" fades in (350ms - 2400ms)
    const t1 = setTimeout(() => {
      setActiveCard(1);
    }, 350);

    // Beat 2: "Presents" fades in (2400ms - 4500ms)
    const t2 = setTimeout(() => {
      setActiveCard(2);
    }, 2400);

    // Beat 3: "Marketing Murlidhar" fades in (4500ms onwards)
    // The sound only plays on the guest's tap, so this card waits for "Enter the experience"
    const t3 = setTimeout(() => {
      setActiveCard(3);
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []); // Run exactly once on mount!

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: '#070f20',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.03)' : 'scale(1)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        padding: '2rem',
      }}
    >
      {/* Background Starfield & Deep Radial Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, #152747 0%, #0c1a36 45%, #050b18 100%)',
          opacity: 0.92,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Golden Orbit Line */}
      <div
        style={{
          position: 'absolute',
          width: '740px',
          height: '740px',
          maxWidth: '92vw',
          maxHeight: '92vw',
          borderRadius: '50%',
          border: '1px dashed rgba(223, 186, 87, 0.16)',
          animation: 'spinOrbit 55s linear infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Top Right Skip Button */}
      <button
        onClick={handleEnter}
        className="preloader-skip-btn"
        style={{
          position: 'absolute',
          background: 'rgba(223, 186, 87, 0.06)',
          border: '1px solid rgba(223, 186, 87, 0.28)',
          borderRadius: '9999px',
          color: 'rgba(223, 186, 87, 0.8)',
          fontFamily: 'var(--font-cinzel)',
          cursor: 'pointer',
          zIndex: 30,
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(223, 186, 87, 0.7)';
          e.currentTarget.style.color = '#dfba57';
          e.currentTarget.style.background = 'rgba(223, 186, 87, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(223, 186, 87, 0.28)';
          e.currentTarget.style.color = 'rgba(223, 186, 87, 0.8)';
          e.currentTarget.style.background = 'rgba(223, 186, 87, 0.06)';
        }}
      >
        SKIP INTRO
      </button>

      {/* ======================================================== */}
      {/* EDITORIAL SCENE 1: "CLUB MATCHBOX" */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          pointerEvents: activeCard === 1 ? 'auto' : 'none',
          opacity: activeCard === 1 ? 1 : 0,
          transform:
            activeCard === 1
              ? 'scale(1) translateY(0)'
              : activeCard > 1
                ? 'scale(0.96) translateY(-18px)'
                : 'scale(1.04) translateY(18px)',
          transition: 'opacity 0.45s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem', opacity: 0.85 }}>
          <Compass size={15} style={{ color: '#dfba57' }} />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.74rem',
              letterSpacing: '0.32em',
              color: '#dfba57',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            OFFICIAL INVITATION
          </span>
          <Compass size={15} style={{ color: '#dfba57' }} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(14px, 2.8vw, 24px)',
            flexWrap: 'wrap',
          }}
        >
          <img
            src={EVENT_CONFIG.assets.matchboxLogo}
            alt="Club Matchbox Logo"
            style={{
              height: 'clamp(34px, 5.5vw, 54px)',
              objectFit: 'contain',
              background: '#fdfbf7',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(223, 186, 87, 0.6)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 25px rgba(223, 186, 87, 0.25)',
              display: 'block',
            }}
          />
          <h2
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: 'clamp(2.4rem, 7vw, 4.8rem)',
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: '#fdfbf7',
              textTransform: 'uppercase',
              lineHeight: 1.15,
              textShadow: '0 8px 32px rgba(0, 0, 0, 0.85), 0 0 45px rgba(223, 186, 87, 0.3)',
              margin: 0,
            }}
          >
            CLUB MATCHBOX
          </h2>
        </div>

        <div
          style={{
            width: '48px',
            height: '1px',
            background: 'linear-gradient(to right, transparent, #dfba57, transparent)',
            marginTop: '1.4rem',
            opacity: 0.75,
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* EDITORIAL SCENE 2: "PRESENTS" */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          pointerEvents: activeCard === 2 ? 'auto' : 'none',
          opacity: activeCard === 2 ? 1 : 0,
          transform:
            activeCard === 2
              ? 'scale(1) translateY(0)'
              : activeCard > 2
                ? 'scale(0.96) translateY(-18px)'
                : 'scale(1.04) translateY(18px)',
          transition: 'opacity 0.45s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span
            style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(223, 186, 87, 0.6))',
            }}
          />
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(2.6rem, 7.5vw, 5.2rem)',
              color: '#dfba57',
              letterSpacing: '0.04em',
              lineHeight: 1,
              textShadow: '0 6px 30px rgba(0, 0, 0, 0.9), 0 0 50px rgba(223, 186, 87, 0.4)',
            }}
          >
            Presents
          </p>
          <span
            style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(to left, transparent, rgba(223, 186, 87, 0.6))',
            }}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* EDITORIAL SCENE 3: "MARKETING MURLIDHAR" */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          pointerEvents: activeCard === 3 ? 'auto' : 'none',
          opacity: activeCard === 3 ? 1 : 0,
          transform:
            activeCard === 3
              ? 'scale(1) translateY(0)'
              : 'scale(1.04) translateY(20px)',
          transition: 'opacity 0.65s ease, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
          maxWidth: '880px',
          margin: '0 auto',
        }}
      >
        {/* Edition Subtitle */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '1rem',
          }}
        >
          <span style={{ width: '28px', height: '1px', background: 'rgba(223, 186, 87, 0.5)' }} />
          <span
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: 'clamp(0.72rem, 1.6vw, 0.82rem)',
              letterSpacing: '0.24em',
              color: '#dfba57',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            ✦ PASSPORT TO PLATE ✦
          </span>
          <span style={{ width: '28px', height: '1px', background: 'rgba(223, 186, 87, 0.5)' }} />
        </div>

        {/* Grand Title: MARKETING MURLIDHAR */}
        <h1
          className="gold-foil-text"
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: 'clamp(2.2rem, 6.4vw, 4.4rem)',
            lineHeight: 1.12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.85))',
            marginBottom: '0.5rem',
          }}
        >
          MARKETING MURLIDHAR
        </h1>

        {/* Year 2026 */}
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.4rem, 3.6vw, 2.4rem)',
            color: '#f4ecdf',
            letterSpacing: '0.06em',
            marginBottom: '1rem',
          }}
        >
          2026
        </div>

        {/* Venue & University */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
            color: '#c2b6a5',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '2rem',
          }}
        >
          {EVENT_CONFIG.universityName} • {EVENT_CONFIG.venue}
        </p>

        {/* Enter The Experience CTA */}
        <button
          onClick={handleEnter}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '15px 36px',
            background: 'linear-gradient(135deg, #dfba57 0%, #c59b27 100%)',
            color: '#081226',
            border: 'none',
            borderRadius: '9999px',
            fontFamily: 'var(--font-cinzel)',
            fontWeight: 800,
            fontSize: '0.92rem',
            letterSpacing: '0.14em',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(223, 186, 87, 0.4), 0 0 20px rgba(223, 186, 87, 0.25)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(223, 186, 87, 0.55), 0 0 30px rgba(223, 186, 87, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(223, 186, 87, 0.4), 0 0 20px rgba(223, 186, 87, 0.25)';
          }}
        >
          <Sparkles size={16} />
          <span>ENTER THE EXPERIENCE</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Flight Departure Tag at Bottom */}
      <div className="preloader-bottom-meta">
        <span>FLIGHT: {EVENT_CONFIG.flightNumber}</span>
        <span className="meta-dot">•</span>
        <span className="univ-name-meta">UNIVERSAL AI UNIVERSITY</span>
        <span className="meta-dot">•</span>
        <span>OCTOBER 2026</span>
      </div>
    </div>
  );
};
