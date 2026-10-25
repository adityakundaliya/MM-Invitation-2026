import React from 'react';
import { X, Download } from 'lucide-react';
import { EVENT_CONFIG } from '../config/eventConfig';

interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(5, 11, 24, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '92vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close poster preview"
          className="poster-modal-close-btn"
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
        >
          <X size={22} />
        </button>

        {/* Poster Image */}
        <img
          src={EVENT_CONFIG.assets.poster}
          alt="Marketing Murlidhar 2026 Official Event Poster"
          style={{
            maxWidth: '100%',
            maxHeight: '84vh',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(223, 186, 87, 0.25)',
            border: '2px solid rgba(223, 186, 87, 0.4)',
          }}
        />

        {/* Footer actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginTop: '1rem',
          }}
        >
          <a
            href={EVENT_CONFIG.assets.poster}
            download="Marketing-Murlidhar-2026-Poster.jpg"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              background: 'rgba(223, 186, 87, 0.2)',
              border: '1px solid rgba(223, 186, 87, 0.5)',
              borderRadius: '9999px',
              color: '#dfba57',
              textDecoration: 'none',
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            <Download size={15} />
            <span>DOWNLOAD POSTER</span>
          </a>
        </div>
      </div>
    </div>
  );
};
