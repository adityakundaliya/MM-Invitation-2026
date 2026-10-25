import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { audioManager } from '../utils/audio';

export const AudioController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((playing, muted) => {
      setIsPlaying(playing);
      setIsMuted(muted);
    });

    return () => unsubscribe();
  }, []);

  // The onboarding sound is a one-shot, so this button is always a plain mute toggle
  // (it also mutes the tactile page / stamp sounds).
  const handleToggle = () => {
    audioManager.toggleMute();
  };

  return (
    <div className="audio-controller-wrapper">
      <button
        onClick={handleToggle}
        aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
        title={isMuted ? 'Sound muted (Click to unmute)' : 'Sound on (Click to mute)'}
        className={`audio-toggle-btn ${isMuted ? 'is-muted' : 'is-active'}`}
      >
        {isMuted ? (
          <VolumeX size={18} className="audio-icon audio-muted-icon" />
        ) : (
          <Volume2 size={18} className="audio-icon audio-live-icon" />
        )}

        <span className="audio-btn-label">
          {isMuted ? 'SOUND OFF' : 'AUDIO'}
        </span>

        {isPlaying && !isMuted ? (
          <div className="sound-bars-container">
            <span className="sound-bar"></span>
            <span className="sound-bar"></span>
            <span className="sound-bar"></span>
            <span className="sound-bar"></span>
          </div>
        ) : (
          <Music size={14} className="audio-music-icon" />
        )}
      </button>
    </div>
  );
};
