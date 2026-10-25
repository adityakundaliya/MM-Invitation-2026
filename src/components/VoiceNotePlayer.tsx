import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { EVENT_CONFIG } from '../config/eventConfig';

export const VoiceNotePlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const duration = '0:45';
  const [currentTime, setCurrentTime] = useState<string>('0:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Attempt real file
      if (!audioRef.current) {
        audioRef.current = new Audio(EVENT_CONFIG.assets.voiceNote);
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime('0:00');
          if (timerRef.current) clearInterval(timerRef.current);
        });
        audioRef.current.addEventListener('error', () => {
          // If file not found, simulate voice playback timeline
          console.info('Voice note file not found; running interactive simulated voice preview.');
        });
      }

      audioRef.current.play().catch(() => {
        // Autoplay/missing file fallback: progress bar runs simulated preview
      });

      // Simulation progress tracker for 30s
      let elapsed = progress > 0 ? (progress / 100) * 30 : 0;
      timerRef.current = window.setInterval(() => {
        elapsed += 0.25;
        const currentPct = Math.min((elapsed / 30) * 100, 100);
        setProgress(currentPct);

        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        setCurrentTime(`${mins}:${secs < 10 ? '0' : ''}${secs}`);

        if (elapsed >= 30) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime('0:00');
        }
      }, 250);
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.65)',
        border: '1px solid rgba(216, 196, 165, 0.8)',
        borderRadius: '12px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <button
        onClick={handleTogglePlay}
        aria-label={isPlaying ? 'Pause voice invitation note' : 'Play voice invitation note'}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: isPlaying
            ? 'linear-gradient(135deg, #841924 0%, #5c0f18 100%)'
            : 'linear-gradient(135deg, #dfba57 0%, #c59b27 100%)',
          border: 'none',
          color: isPlaying ? '#fff' : '#081226',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.2s, background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
      </button>

      {/* Progress & Waveform */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#841924',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Mic size={12} />
            INVITATION AUDIO NOTE
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#5a5248' }}>
            {isPlaying ? currentTime : duration}
          </span>
        </div>

        {/* Dynamic Simulated Waveform Bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: '14px',
            cursor: 'pointer',
          }}
          onClick={handleTogglePlay}
        >
          {Array.from({ length: 28 }).map((_, idx) => {
            const barPct = (idx / 28) * 100;
            const isPassed = barPct <= progress;
            // Variable heights for authentic voice waveform look
            const heights = [30, 60, 45, 90, 100, 75, 40, 85, 95, 60, 80, 50, 95, 70, 40, 65, 85, 90, 55, 75, 45, 80, 60, 40, 70, 50, 35, 20];
            const height = heights[idx % heights.length];

            return (
              <span
                key={idx}
                style={{
                  flex: 1,
                  height: `${height}%`,
                  backgroundColor: isPassed ? '#841924' : '#d8c4a5',
                  borderRadius: '2px',
                  transition: 'background-color 0.15s',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
