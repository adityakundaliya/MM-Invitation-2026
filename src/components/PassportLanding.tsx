import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { EVENT_CONFIG } from '../config/eventConfig';
import { audioManager } from '../utils/audio';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PassportLandingProps {
  onOpen: () => void;
  isOpening: boolean;
}

export const PassportLanding: React.FC<PassportLandingProps> = ({ onOpen, isOpening }) => {
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Mouse tilt for tactile 3D depth
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpening) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -(y * 18), y: x * 18 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleOpenPassport = () => {
    if (isOpening) return;

    // Tactile audio response
    audioManager.playLeatherSound();
    audioManager.playPageFlipSound();
    setTimeout(() => {
      audioManager.playStampSound();
    }, 450);

    // Golden celebratory confetti burst!
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#dfba57', '#841924', '#ffffff', '#c59b27'],
      });
    } catch {
      // Confetti fallback
    }

    onOpen();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenPassport();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '480px',
        userSelect: 'none',
      }}
    >
      {/* Interactive 3D Passport Card */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Interactive Passport Invitation — Click or press Enter to open"
        onClick={handleOpenPassport}
        onKeyDown={handleKeyDown}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setIsHovered(true);
          audioManager.playLeatherSound();
        }}
        onMouseLeave={handleMouseLeave}
        className={`passport-book state-closed ${isOpening ? 'is-opening' : ''}`}
        style={{
          transform: isOpening
            ? 'rotateY(-140deg) scale(0.95)'
            : isHovered
            ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-14px)`
            : 'perspective(1200px) rotateX(4deg) rotateY(0deg)',
          transformOrigin: '0% 50%',
          transition: isOpening
            ? 'transform 1.1s cubic-bezier(0.25, 1, 0.3, 1), opacity 0.8s ease'
            : 'transform 0.25s ease-out, box-shadow 0.25s ease-out',
          outline: 'none',
          position: 'relative',
        }}
      >
        {/* Leather Grain & Shadow */}
        <div
          className="leather-grain"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '18px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Leather Stitching Border */}
          <div className="leather-stitch-border" />

          {/* Actual Supplied Passport Artwork */}
          <img
            src={EVENT_CONFIG.assets.passportCover}
            alt="Marketing Murlidhar 2026 Passport Cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '16px',
              display: 'block',
              filter: 'contrast(1.04) brightness(1.02)',
            }}
          />

          {/* Dynamic Light Sheen on Hover */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(${
                115 + tilt.y * 3
              }deg, rgba(255,255,255,0.2) 0%, rgba(223, 186, 87, 0.15) 30%, transparent 60%)`,
              opacity: isHovered ? 0.75 : 0.2,
              pointerEvents: 'none',
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Floating Invitation Call to Action */}
      <div
        style={{
          marginTop: '2.5rem',
          textAlign: 'center',
          animation: 'pulseGlow 2.5s ease-in-out infinite',
        }}
      >
        <button
          onClick={handleOpenPassport}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 28px',
            background: 'linear-gradient(135deg, rgba(223, 186, 87, 0.2) 0%, rgba(12, 28, 56, 0.8) 100%)',
            border: '1.5px solid rgba(223, 186, 87, 0.6)',
            borderRadius: '9999px',
            color: '#dfba57',
            fontFamily: 'var(--font-cinzel)',
            fontWeight: 800,
            fontSize: '0.88rem',
            letterSpacing: '0.14em',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(223, 186, 87, 0.25)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.25s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'rgba(223, 186, 87, 1)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 30px rgba(223, 186, 87, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(223, 186, 87, 0.6)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(223, 186, 87, 0.25)';
          }}
        >
          <Sparkles size={16} />
          <span>OPEN YOUR INVITATION</span>
          <ArrowRight size={16} />
        </button>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.78rem',
            color: 'rgba(223, 186, 87, 0.7)',
            letterSpacing: '0.18em',
            marginTop: '10px',
            textTransform: 'uppercase',
          }}
        >
          Tap passport or click to explore your destination
        </p>
      </div>
    </div>
  );
};
