import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Share2,
  Maximize2,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  Ticket,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { EVENT_CONFIG } from '../config/eventConfig';
import { PosterModal } from './PosterModal';
import { StampingFlight } from './StampingFlight';
import { audioManager } from '../utils/audio';

interface PassportBookProps {
  /** Lets the parent react to open/closed (e.g. hide the looping banner plane while the stamping plane flies) */
  onBookStateChange?: (state: 'closed' | 'opening' | 'open' | 'closing') => void;
}

export const PassportBook: React.FC<PassportBookProps> = ({ onBookStateChange }) => {
  // 'closed' | 'opening' | 'open' | 'closing'
  const [bookState, setBookState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const [stampDelivered, setStampDelivered] = useState<boolean>(false);
  const [planeFlying, setPlaneFlying] = useState<boolean>(false);
  const [posterModalOpen, setPosterModalOpen] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'both' | 'poster' | 'pass'>('both');
  const stampZoneRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const tiltRafRef = useRef<number | null>(null);
  const hoverSoundPlayedRef = useRef<boolean>(false);

  const isClosed = bookState === 'closed';
  const isOpen = bookState === 'open';

  useEffect(() => {
    onBookStateChange?.(bookState);
  }, [bookState, onBookStateChange]);

  // Keyboard navigation: Enter/Space to open, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && isClosed && !posterModalOpen) {
        e.preventDefault();
        handleOpen();
      } else if (e.key === 'Escape' && isOpen && !posterModalOpen) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookState, isClosed, isOpen, posterModalOpen]);

  // Subtle 3D tilt on closed passport hover.
  // Written straight to CSS variables on the frame (throttled with rAF) so mouse movement
  // never triggers a React re-render of this large component.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isClosed) return;
    const frame = frameRef.current;
    if (!frame) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (tiltRafRef.current !== null) cancelAnimationFrame(tiltRafRef.current);
    tiltRafRef.current = requestAnimationFrame(() => {
      frame.style.setProperty('--tilt-x', `${-(y * 14)}deg`);
      frame.style.setProperty('--tilt-y', `${x * 14}deg`);
    });
  };

  const handleMouseEnter = () => {
    if (!isClosed) return;
    frameRef.current?.setAttribute('data-hover', '1');
    // Leather rustle only once per visit; on every hover it gets annoying
    if (!hoverSoundPlayedRef.current) {
      hoverSoundPlayedRef.current = true;
      audioManager.playLeatherSound();
    }
  };

  const handleMouseLeave = () => {
    if (tiltRafRef.current !== null) cancelAnimationFrame(tiltRafRef.current);
    const frame = frameRef.current;
    if (!frame) return;
    frame.removeAttribute('data-hover');
    frame.style.setProperty('--tilt-x', '0deg');
    frame.style.setProperty('--tilt-y', '0deg');
  };

  const handleOpen = () => {
    if (bookState !== 'closed') return;
    setBookState('opening');
    setStampDelivered(false);

    // Tactile sound sequence
    audioManager.playLeatherSound();

    setTimeout(() => {
      audioManager.playPageFlipSound();
    }, 450);

    // Aeroplane launches into its smooth parabolic swoop across the sky at 450ms
    setTimeout(() => {
      setPlaneFlying(true);
    }, 450);

    // Booklet reaches open state at 1150ms
    setTimeout(() => {
      setBookState('open');
    }, 1150);

    // (The stamp is now released by the aeroplane itself, see handleStampDrop below)
  };

  // Called by the aeroplane at the lowest point of its loop: the stamp lands on the page
  const handleStampDrop = () => {
    setStampDelivered(true);
    audioManager.playStampSound();

    // Aim the confetti at the real stamp slot (falls back to the old bottom-right guess)
    let origin = { x: 0.74, y: 0.75 };
    const rect = stampZoneRef.current?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      // Clamped so the burst stays on screen even if the stamp slot is scrolled out of view (phones)
      origin = {
        x: Math.min(0.95, Math.max(0.05, (rect.left + rect.width / 2) / window.innerWidth)),
        y: Math.min(0.9, Math.max(0.1, (rect.top + rect.height / 2) / window.innerHeight)),
      };
    }
    try {
      confetti({
        particleCount: 95,
        spread: 85,
        origin,
        colors: ['#dfba57', '#841924', '#ffffff', '#c59b27'],
      });
    } catch {
      // Fallback
    }
  };

  const handleClose = () => {
    if (bookState !== 'open') return;
    setBookState('closing');
    setStampDelivered(false);
    setPlaneFlying(false);

    audioManager.playPageFlipSound();

    // Tactile leather slap sound as the cover leaf lands firmly on the booklet
    setTimeout(() => {
      audioManager.playLeatherSound();
    }, 720);

    setTimeout(() => {
      setBookState('closed');
    }, 1150);
  };

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
        // Fallback
      }
    }

    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="booklet-scene">
      {/* ======================================================== */}
      {/* 3D BOOKLET APPARATUS */}
      {/* ======================================================== */}
      <div
        ref={frameRef}
        className={`booklet-frame state-${bookState}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={isClosed ? handleOpen : undefined}
        role={isClosed ? 'button' : undefined}
        tabIndex={isClosed ? 0 : -1}
        aria-label={isClosed ? 'Closed Passport Invitation. Click or press Enter to open.' : undefined}
      >
        {/* Mobile Page Navigator Tab Pills (Shown when opened on mobile screens) */}
        <div className={`mobile-passport-tabs ${bookState === 'open' ? 'is-visible' : ''}`} role="tablist">
          <button
            type="button"
            className={`mobile-tab-btn ${mobileActiveTab === 'both' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setMobileActiveTab('both');
            }}
          >
            ✦ ALL PAGES
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${mobileActiveTab === 'poster' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setMobileActiveTab('poster');
            }}
          >
            🎨 1. POSTER
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${mobileActiveTab === 'pass' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setMobileActiveTab('pass');
            }}
          >
            🎫 2. BOARDING PASS
          </button>
        </div>

        {/* Leather Base Shell (Outer Border & Shadow) */}
        <div className="booklet-leather-case">
          <div className="leather-stitch-border" />
          <div className="book-spine-crease" />

          {/* LEFT PAGE: OFFICIAL EVENT POSTER */}
          <div className={`booklet-page booklet-page-left parchment-page ${mobileActiveTab === 'pass' ? 'mobile-tab-hidden' : ''}`}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  audioManager.playStampSound();
                  setPosterModalOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(132, 25, 36, 0.08)',
                  border: '1px solid rgba(132, 25, 36, 0.3)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.7rem',
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
              className="poster-display-container"
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fcfbf8',
                borderRadius: '8px',
                padding: '6px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 0 15px rgba(216, 196, 165, 0.3)',
                border: '1px solid rgba(216, 196, 165, 0.9)',
                overflow: 'hidden',
                cursor: 'zoom-in',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setPosterModalOpen(true);
              }}
            >
              {/* Golden Photo Corners */}
              <div style={{ position: 'absolute', top: '5px', left: '5px', width: '16px', height: '16px', borderTop: '3px solid #dfba57', borderLeft: '3px solid #dfba57', zIndex: 5 }} />
              <div style={{ position: 'absolute', top: '5px', right: '5px', width: '16px', height: '16px', borderTop: '3px solid #dfba57', borderRight: '3px solid #dfba57', zIndex: 5 }} />
              <div style={{ position: 'absolute', bottom: '5px', left: '5px', width: '16px', height: '16px', borderBottom: '3px solid #dfba57', borderLeft: '3px solid #dfba57', zIndex: 5 }} />
              <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '16px', height: '16px', borderBottom: '3px solid #dfba57', borderRight: '3px solid #dfba57', zIndex: 5 }} />

              {/* Supplied Event Poster */}
              <img
                src={EVENT_CONFIG.assets.poster}
                alt="Marketing Murlidhar 2026 Official Poster"
                className="poster-img-element"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  display: 'block',
                  transition: 'transform 0.3s ease',
                }}
              />
            </div>

            {/* Left Page Footer Note */}
            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '0.76rem',
                color: '#6e6459',
              }}
            >
              <span>{EVENT_CONFIG.tagline}</span>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontStyle: 'normal', fontWeight: 700, color: '#841924' }}>
                ✦ PASSPORT TO PLATE
              </span>
            </div>
          </div>

          {/* RIGHT PAGE: BOARDING PASS */}
          <div className={`booklet-page booklet-page-right parchment-page ${mobileActiveTab === 'poster' ? 'mobile-tab-hidden' : ''}`}>
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
                className="boarding-details-grid"
                style={{
                  display: 'grid',
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

                <div className="grid-destination">
                  <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                    DESTINATION & VENUE
                  </span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0c1c38', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} style={{ color: '#841924', flexShrink: 0 }} />
                    {EVENT_CONFIG.venue}, {EVENT_CONFIG.city}
                  </span>
                </div>

                <div className="grid-seat">
                  <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                    SEAT / ACCESS
                  </span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#c59b27' }}>
                    {EVENT_CONFIG.seat}
                  </span>
                </div>

                <div className="grid-dates">
                  <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                    EVENT DATES
                  </span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#841924' }}>
                    {EVENT_CONFIG.dates}
                  </span>
                </div>

                <div className="grid-time">
                  <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-cinzel)', color: '#857b6f', fontWeight: 700, display: 'block' }}>
                    TIME
                  </span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0c1c38', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} style={{ color: '#841924' }} />
                    {EVENT_CONFIG.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="boarding-perforation" />

            {/* Ticket Stub & Bottom Controls */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {/* ICAO Biometric MRZ Barcode */}
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
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-cinzel)',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                  }}
                >
                  <CheckCircle2 size={12} />
                  <span>{EVENT_CONFIG.boardingStatus}</span>
                </div>
              </div>

              {/* Bottom Row: Actions on the Left, Stamp in the Right Corner */}
              <div className="boarding-actions-and-stamp">
                {/* Interactive Actions Grid */}
                <div className="boarding-actions-group">
                  {/* Add to Calendar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCalendar();
                    }}
                    className="action-btn action-btn-calendar"
                    title="Add Marketing Murlidhar 2026 to your calendar"
                  >
                    <Calendar size={13} />
                    <span>CALENDAR</span>
                  </button>

                  {/* Share Invitation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    className="action-btn action-btn-share"
                    title="Share this official invitation"
                  >
                    <Share2 size={12} />
                    <span>{copiedShare ? 'COPIED!' : 'SHARE'}</span>
                  </button>

                  {/* Close Passport button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    className="action-btn action-btn-close"
                    title="Close passport"
                  >
                    <BookOpen size={12} />
                    <span>CLOSE</span>
                  </button>
                </div>

                {/* Stamping Target Zone / Stamp in the Right Bottom Corner */}
                <div ref={stampZoneRef} className="boarding-stamp-slot">
                  {/* Ink shockwave when the stamp lands */}
                  {stampDelivered && <div className="stamping-impact-ripple is-active" />}

                  {/* Official "You Are Invited" Stamp */}
                  {stampDelivered && (
                    <div className="passport-invitation-stamp">
                      <div className="stamp-inner-border">
                        <div className="stamp-header-row">
                          <span>★</span>
                          <span>CLUB MATCHBOX</span>
                          <span>★</span>
                        </div>
                        <div className="stamp-headline">YOU ARE INVITED</div>
                        <div className="stamp-sub-row">
                          <span>MM 2026 • PASSPORT TO PLATE</span>
                        </div>
                        <div className="stamp-footer-row">
                          <span>OFFICIAL ENTRY CLEARANCE</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3D ROTATING COVER LEAF (Animates 0deg -> -180deg) */}
        {/* ======================================================== */}
        <div
          className={`turning-cover-leaf ${
            bookState === 'open' ? 'is-open' : ''
          } ${bookState === 'opening' ? 'is-opening' : ''} ${
            bookState === 'closing' ? 'is-closing' : ''
          }`}
        >
          {/* Cover Artwork Front Face */}
          <div className="leaf-face-cover leather-grain">
            <div className="leather-stitch-border" />
            <img
              src={EVENT_CONFIG.assets.passportCover}
              alt="Marketing Murlidhar 2026 Passport Cover"
              className="passport-cover-img"
            />
            {/* Dynamic Gold Sheen */}
            <div className="leaf-sheen-overlay" />
          </div>

          {/* Cover Inside Back Face (Marbled inner visa lining) */}
          <div className="leaf-face-inside parchment-page">
            <div className="inner-lining-pattern">
              <span className="inner-lining-stamp">CLUB MATCHBOX • 2026</span>
            </div>
          </div>
        </div>

        {/* Aeroplane flight: bottom-left -> loop (drops the stamp) -> top-right. Renders in its own full-screen layer. */}
        {planeFlying && (
          <StampingFlight onStampDrop={handleStampDrop} onComplete={() => setPlaneFlying(false)} />
        )}
      </div>

      {/* ======================================================== */}
      {/* CALL TO ACTION BUTTON (Visible when closed) */}
      {/* ======================================================== */}
      <div
        className={`booklet-closed-cta ${
          isClosed ? 'is-visible' : bookState === 'closing' ? 'is-entering' : 'is-hidden'
        }`}
      >
        <button
          onClick={handleOpen}
          aria-label="Open your invitation"
          className="open-invitation-btn"
        >
          <Sparkles size={16} />
          <span>OPEN YOUR INVITATION</span>
          <ArrowRight size={16} />
        </button>
        <p className="open-invitation-hint">
          Tap passport cover or press Enter to begin
        </p>
      </div>

      {/* Poster Lightbox Modal */}
      <PosterModal isOpen={posterModalOpen} onClose={() => setPosterModalOpen(false)} />
    </div>
  );
};
