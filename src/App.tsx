import { useState, useCallback } from 'react';
import { Preloader } from './components/Preloader';
import { AirplaneBanner } from './components/AirplaneBanner';
import { HeaderNav } from './components/HeaderNav';
import { PassportBook } from './components/PassportBook';
import { AudioController } from './components/AudioController';
import './index.css';

export function App() {
  const [showPreloader, setShowPreloader] = useState<boolean>(true);
  const [passportClosed, setPassportClosed] = useState<boolean>(true);

  const handleBookStateChange = useCallback((state: 'closed' | 'opening' | 'open' | 'closing') => {
    setPassportClosed(state === 'closed');
  }, []);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  const handleReplayIntro = () => {
    setShowPreloader(true);
  };

  return (
    <div className="app-viewport">
      {/* Experience 1: Cinematic Full-Screen Preloader */}
      {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Decorative Star & Atmospheric Light Field */}
      <div className="travel-stars-overlay" />

      {/* Experience 7: Animated Airplane flying RIGHT to LEFT with "MARKETING MURLIDHAR" banner */}
      <AirplaneBanner visible={passportClosed} />

      {/* Luxury Departure Header Navigation */}
      <HeaderNav onReplayIntro={handleReplayIntro} />

      {/* Main 3D Invitation Experience Scene — Continuous Physical Booklet */}
      <main className="scene-container">
        <PassportBook onBookStateChange={handleBookStateChange} />
      </main>

      {/* Floating Sound On/Off Controller */}
      <AudioController />
    </div>
  );
}

export default App;
