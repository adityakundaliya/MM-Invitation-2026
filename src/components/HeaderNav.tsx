import React from 'react';
import { Calendar, MapPin, Clock, RotateCcw } from 'lucide-react';
import { EVENT_CONFIG } from '../config/eventConfig';

interface HeaderNavProps {
  onReplayIntro: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onReplayIntro }) => {
  return (
    <header className="site-header">
      {/* Brand & Crest: Official Logos from Event Poster */}
      <div className="header-brand-wrap">
        {/* Official Logos Container */}
        <div className="header-logos-badge">
          <img
            src={EVENT_CONFIG.assets.matchboxLogo}
            alt="Club Matchbox Official Logo"
            className="header-logo-img logo-matchbox"
          />
          <div className="header-logo-divider" />
          <img
            src={EVENT_CONFIG.assets.universalLogo}
            alt="Universal AI University Official Logo"
            className="header-logo-img logo-universal"
          />
        </div>

        {/* Official Event Title & Details from Poster */}
        <div className="header-title-block">
          <span className="header-title-main">
            {EVENT_CONFIG.eventName}
          </span>
          <span className="header-subtitle-main">
            <span className="edition-badge">{EVENT_CONFIG.edition}</span>
            <span className="header-motto-sep">•</span>
            <span className="header-motto-text">{EVENT_CONFIG.motto}</span>
          </span>
        </div>
      </div>

      {/* Center Event Metadata from Poster (Desktop & Tablet only) */}
      <div className="header-meta-desktop">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={13} style={{ color: '#dfba57' }} />
          {EVENT_CONFIG.dates}
        </span>
        <span style={{ color: 'rgba(223, 186, 87, 0.4)' }}>•</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={13} style={{ color: '#dfba57' }} />
          {EVENT_CONFIG.venue}
        </span>
        <span style={{ color: 'rgba(223, 186, 87, 0.4)' }}>•</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} style={{ color: '#dfba57' }} />
          {EVENT_CONFIG.time}
        </span>
      </div>

      {/* Right Action: Replay Intro */}
      <button
        onClick={onReplayIntro}
        className="header-replay-btn"
        title="Replay cinematic event preloader"
      >
        <RotateCcw size={12} />
        <span className="replay-btn-text">REPLAY INTRO</span>
      </button>
    </header>
  );
};
