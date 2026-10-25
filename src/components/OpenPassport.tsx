import React, { useState } from 'react';
import { Calendar, Share2, Maximize2, BookOpen, MapPin, Clock, CheckCircle2, Ticket } from 'lucide-react';
import { EVENT_CONFIG } from '../config/eventConfig';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { PosterModal } from './PosterModal';
import { audioManager } from '../utils/audio';

interface OpenPassportProps {
  onClosePassport: () => void;
}

export const OpenPassport: React.FC<OpenPassportProps> = ({ onClosePassport }) => {
  const [posterModalOpen, setPosterModalOpen] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Generate .ics calendar invite
  const handleAddToCalendar = () => {
    audioManager.playAirportChime();
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Club Matchbox//Marketing Murlidhar 2026//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:mm-2026-invite@universalai.in',
      'SUMMARY:Marketing Murlidhar 2026 - Passport to Plate',
      'DESCRIPTION:Club Matchbox presents Marketing Murlidhar 2026. Official Interactive Invitation to Cultural Ground.',
      'LOCATION:Cultural Ground, Universal AI University',
      'DTSTART:20261026T123000Z',
      'DTEND:20261029T183000Z',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Marketing-Murlidhar-2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    audioManager.playStampSound();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Marketing Murlidhar 2026 — Official Invitation',
          text: "You're invited to Marketing Murlidhar 2026: Passport to Plate at Universal AI University!",
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or share failed -> fallback to copy
      }
    }

    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <>
      <div
        className="passport-book state-open"
        style={{
          backgroundColor: '#0c1c38',
          position: 'relative',
          padding: '12px',
          boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.85), 0 0 50px rgba(223, 186, 87, 0.15)',
        }}
      >
        {/* Leather Stitching Border on outer frame */}
        <div className="leather-stitch-border" />

        {/* Central Spine Crease on Desktop */}
        <div className="book-spine-crease" />

        {/* ======================================================== */}
        {/* LEFT PAGE: OFFICIAL EVENT POSTER */}
        {/* ======================================================== */}
        <div
          className="parchment-page"
          style={{
            flex: '1 1 50%',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 20px',
            borderRight: '1px solid #d8c4a5',
            borderRadius: '14px 4px 4px 14px',
            position: 'relative',
            minHeight: 'min(80vh, 560px)',
          }}
        >
          {/* Header watermark & Page number */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(216, 196, 165, 0.7)',
              paddingBottom: '6px',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  letterSpacing: '0.14em',
                  color: '#841924',
                }}
              >
                OFFICIAL EVENT ENTRY
              </span>
              <span style={{ fontSize: '0.7rem', color: '#857b6f' }}>•</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: '#5a5248',
                }}
              >
                PAGE 01
              </span>
            </div>

            {/* Inspect Poster Button */}
            <button
              onClick={() => {
                audioManager.playStampSound();
                setPosterModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(132, 25, 36, 0.08)',
                border: '1px solid rgba(132, 25, 36, 0.3)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-cinzel)',
                fontWeight: 700,
                color: '#841924',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="View full-size high resolution poster"
            >
              <Maximize2 size={12} />
              <span>ENLARGE</span>
            </button>
          </div>

          {/* Official Poster Container */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fcfbf8',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 0 15px rgba(216, 196, 165, 0.3)',
              border: '1px solid rgba(216, 196, 165, 0.9)',
              overflow: 'hidden',
              cursor: 'zoom-in',
            }}
            onClick={() => setPosterModalOpen(true)}
          >
            {/* Golden Photo Corners */}
            <div
              style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                width: '18px',
                height: '18px',
                borderTop: '3px solid #dfba57',
                borderLeft: '3px solid #dfba57',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '18px',
                height: '18px',
                borderTop: '3px solid #dfba57',
                borderRight: '3px solid #dfba57',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '6px',
                left: '6px',
                width: '18px',
                height: '18px',
                borderBottom: '3px solid #dfba57',
                borderLeft: '3px solid #dfba57',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '6px',
                right: '6px',
                width: '18px',
                height: '18px',
                borderBottom: '3px solid #dfba57',
                borderRight: '3px solid #dfba57',
                zIndex: 5,
              }}
            />

            {/* Supplied Event Poster */}
            <img
              src={EVENT_CONFIG.assets.poster}
              alt="Marketing Murlidhar 2026 Official Poster"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '520px',
                objectFit: 'contain',
                borderRadius: '4px',
                display: 'block',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.015)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>

          {/* Left Page Footer Note */}
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '0.78rem',
              color: '#6e6459',
            }}
          >
            <span>{EVENT_CONFIG.tagline}</span>
            <span style={{ fontFamily: 'var(--font-cinzel)', fontStyle: 'normal', fontWeight: 700, color: '#841924' }}>
              ✦ PASSPORT TO PLATE
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PAGE: BOARDING PASS / EVENT INVITATION */}
        {/* ======================================================== */}
        <div
          className="parchment-page"
          style={{
            flex: '1 1 50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: '4px 14px 14px 4px',
            position: 'relative',
            minHeight: 'min(80vh, 560px)',
          }}
        >
          {/* Header Bar */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1.5px solid #841924',
                paddingBottom: '8px',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={EVENT_CONFIG.assets.matchboxLogo}
                  alt="Club Matchbox"
                  style={{ height: '22px', objectFit: 'contain', display: 'block' }}
                />
                <div style={{ borderLeft: '1px solid #d8c4a5', paddingLeft: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-cinzel)',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      letterSpacing: '0.12em',
                      color: '#0c1c38',
                      display: 'block',
                      lineHeight: 1.1,
                    }}
                  >
                    {EVENT_CONFIG.clubName}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.64rem',
                      color: '#841924',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    }}
                  >
                    UNIVERSAL AI UNIVERSITY
                  </span>
                </div>
              </div>

              {/* Rubber Ink Stamp: CONFIRMED */}
              <div className="passport-stamp" style={{ padding: '4px 10px' }}>
                <span style={{ fontSize: '0.58rem', letterSpacing: '0.14em' }}>OFFICIAL INVITATION</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 900 }}>CONFIRMED</span>
              </div>
            </div>

            {/* Main Title & Invitation Announcement */}
            <div style={{ marginBottom: '10px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(132, 25, 36, 0.08)',
                  color: '#841924',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  marginBottom: '4px',
                }}
              >
                <Ticket size={12} />
                <span>OFFICIAL BOARDING PASS</span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: 'clamp(1.3rem, 2.2vw, 1.75rem)',
                  fontWeight: 900,
                  color: '#841924',
                  lineHeight: 1.15,
                  letterSpacing: '0.04em',
                  marginBottom: '3px',
                }}
              >
                {EVENT_CONFIG.invitationMessage}
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.8rem',
                  color: '#4a4237',
                  lineHeight: 1.35,
                }}
              >
                {EVENT_CONFIG.supportingMessage}
              </p>
            </div>

            {/* Travel Flight Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px 12px',
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(216, 196, 165, 0.8)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                marginBottom: '10px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                  PASSENGER
                </span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0c1c38' }}>
                  {EVENT_CONFIG.passengerName}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                  FLIGHT
                </span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#841924' }}>
                  {EVENT_CONFIG.flightNumber}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                  GATE
                </span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0c1c38' }}>
                  {EVENT_CONFIG.gate}
                </span>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                  DESTINATION & VENUE
                </span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0c1c38', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} style={{ color: '#841924', flexShrink: 0 }} />
                  {EVENT_CONFIG.venue}, {EVENT_CONFIG.city}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                  SEAT / ACCESS
                </span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#c59b27' }}>
                  {EVENT_CONFIG.seat}
                </span>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                  EVENT DATES
                </span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#841924' }}>
                  {EVENT_CONFIG.dates}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                  TIME
                </span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0c1c38', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} style={{ color: '#841924' }} />
                  {EVENT_CONFIG.time}
                </span>
              </div>
            </div>

            {/* Optional Voice Note Interaction */}
            <div style={{ marginBottom: '10px' }}>
              <VoiceNotePlayer />
            </div>
          </div>

          {/* Perforated Divider with Circular Notches */}
          <div className="boarding-perforation" />

          {/* Ticket Stub & Bottom Controls */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {/* ICAO Biometric MRZ Barcode simulation */}
              <div style={{ overflow: 'hidden' }}>
                <div className="mrz-code">
                  P&lt;INDMARKETING&lt;&lt;MURLIDHAR&lt;2026&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                  <br />
                  MM2026&lt;9IND0101018M2610294CUL&lt;GND01&lt;&lt;&lt;92
                </div>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#15803d',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-cinzel)',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                }}
              >
                <CheckCircle2 size={13} />
                <span>{EVENT_CONFIG.boardingStatus}</span>
              </div>
            </div>

            {/* Interactive Actions Grid */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              {/* Add to Calendar */}
              <button
                onClick={handleAddToCalendar}
                style={{
                  flex: '1 1 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #841924 0%, #5c0f18 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-cinzel)',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(132, 25, 36, 0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Calendar size={15} />
                <span>ADD TO CALENDAR</span>
              </button>

              {/* Share Invitation */}
              <button
                onClick={handleShare}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  background: '#f4ecdf',
                  color: '#0c1c38',
                  border: '1px solid #d8c4a5',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-cinzel)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#ede2d0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#f4ecdf')}
              >
                <Share2 size={14} />
                <span>{copiedShare ? 'LINK COPIED!' : 'SHARE'}</span>
              </button>

              {/* Close Passport button */}
              <button
                onClick={onClosePassport}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  background: 'transparent',
                  color: '#841924',
                  border: '1px solid rgba(132, 25, 36, 0.4)',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-cinzel)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title="Fold invitation back into closed passport"
              >
                <BookOpen size={14} />
                <span>CLOSE</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* High-Resolution Poster Lightbox */}
      <PosterModal isOpen={posterModalOpen} onClose={() => setPosterModalOpen(false)} />
    </>
  );
};
