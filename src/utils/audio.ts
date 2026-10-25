// Audio Engine: Background soundtrack, Web Audio fallback synth, and sound effects

class AudioManager {
  private audioCtx: AudioContext | null = null;
  private bgAudioEl: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private synthInterval: number | null = null;
  private masterGain: GainNode | null = null;
  private usingSynth: boolean = false;
  private onboardingEl: HTMLAudioElement | null = null;
  private onboardingUrl: string | null = null;
  private listeners: Set<(isPlaying: boolean, isMuted: boolean) => void> = new Set();

  constructor() {
    // Initialized lazily on user gesture to obey browser autoplay restrictions
  }

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.65;
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public subscribe(callback: (isPlaying: boolean, isMuted: boolean) => void): () => void {
    this.listeners.add(callback);
    callback(this.isPlaying, this.isMuted);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying, this.isMuted));
  }

  private setPlaying(next: boolean) {
    if (this.isPlaying === next) return;
    this.isPlaying = next;
    this.notify();
  }

  // Creates the one-shot onboarding <audio> element (once) and starts buffering it,
  // so the sound is ready to fire the instant the guest taps.
  private getOnboardingElement(url: string): HTMLAudioElement {
    if (this.onboardingEl && this.onboardingUrl === url) return this.onboardingEl;

    if (this.onboardingEl) this.onboardingEl.pause(); // url changed -> retire the old one

    const el = new Audio();
    el.preload = 'auto';
    el.loop = false; // one-shot announcement, never loops
    el.volume = 1;
    el.muted = this.isMuted;

    el.addEventListener('playing', () => this.setPlaying(true));
    el.addEventListener('pause', () => this.setPlaying(false));
    el.addEventListener('ended', () => this.setPlaying(false));
    el.addEventListener('error', () => this.setPlaying(false));

    el.src = url;
    el.load();

    this.onboardingEl = el;
    this.onboardingUrl = url;
    return el;
  }

  // Safe to call any time (even before a tap): only downloads, never plays.
  public preloadOnboardingSound(url: string): void {
    try {
      this.getOnboardingElement(url);
    } catch {
      // Audio unsupported -> nothing to preload
    }
  }

  // Plays the onboarding sound once. Call it directly from the tap/click handler
  // (browsers only allow audio that starts inside a user gesture).
  public async playOnboardingSound(url: string): Promise<boolean> {
    try {
      // Unlock Web Audio on this same tap so the later tactile sounds always work
      this.initAudioContext();
    } catch {
      // AudioContext unavailable
    }

    try {
      const el = this.getOnboardingElement(url);
      el.muted = this.isMuted;
      if (el.currentTime > 0) el.currentTime = 0; // replaying the intro restarts it cleanly
      await el.play();
      return true;
    } catch {
      // File missing or blocked -> fall back to the original boarding chime
      this.playAirportChime();
      return false;
    }
  }

  public async startSoundtrack(musicUrl: string): Promise<boolean> {
    try {
      this.initAudioContext();

      // First check if an actual MP3 file is present
      if (!this.bgAudioEl) {
        this.bgAudioEl = new Audio();
        this.bgAudioEl.loop = true;
        this.bgAudioEl.volume = this.isMuted ? 0 : 0.6;
        this.bgAudioEl.preload = 'auto';

        this.bgAudioEl.addEventListener('error', () => {
          // File not found or corrupt -> seamless fallback to Web Audio Synth
          console.info('Audio file not found at', musicUrl, '— activating cinematic ambient synth.');
          this.startAmbientSynth();
        });
      }

      this.bgAudioEl.src = musicUrl;
      const playPromise = this.bgAudioEl.play();

      if (playPromise !== undefined) {
        await playPromise;
        this.isPlaying = true;
        this.usingSynth = false;
        this.notify();
        return true;
      }
    } catch {
      // Autoplay blocked or file error -> try synth or await user tap
      console.warn('Autoplay prevented. Ready for user interaction.');
      this.isPlaying = false;
      this.notify();
      return false;
    }
    return false;
  }

  // Generative cinematic ambient synth evoking Krishna's flute & luxury travel chimes
  public startAmbientSynth() {
    const ctx = this.initAudioContext();
    if (this.synthInterval) return;

    this.usingSynth = true;
    this.isPlaying = true;
    this.notify();

    // Pentatonic & Raag Yaman / Bhupali scale notes (Hz) evoking the divine flute & departure chimes
    // Frequencies: C4, D4, E4, G4, A4, C5, D5, E5, G5
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];

    // Play a gentle ambient pad note
    const playAmbientChord = () => {
      if (!ctx || this.isMuted || !this.isPlaying) return;

      const baseFreq = notes[Math.floor(Math.random() * notes.length)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 4.6);
    };

    // Play initial gentle chord
    playAmbientChord();
    this.synthInterval = window.setInterval(playAmbientChord, 2800);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgAudioEl) {
      this.bgAudioEl.muted = this.isMuted;
    }
    if (this.onboardingEl) {
      this.onboardingEl.muted = this.isMuted;
    }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.65, this.audioCtx.currentTime);
    }
    this.notify();
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public isSynthActive(): boolean {
    return this.usingSynth;
  }

  // Tactile sound effect: Leather cover movement
  public playLeatherSound() {
    try {
      const ctx = this.initAudioContext();
      if (this.isMuted) return;

      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Filtered brown noise for realistic leather friction
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 1 - i / bufferSize; // Fade out
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(140, now + 0.25);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      noise.start(now);
    } catch {
      // AudioContext unavailable
    }
  }

  // Tactile sound effect: Page opening / flip swoosh
  public playPageFlipSound() {
    try {
      const ctx = this.initAudioContext();
      if (this.isMuted) return;

      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.45);
      filter.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      noise.start(now);
    } catch {
      // AudioContext unavailable
    }
  }

  // Tactile sound effect: Airport boarding chime
  public playAirportChime() {
    try {
      const ctx = this.initAudioContext();
      if (this.isMuted) return;

      // Two-tone airport chime (F5 -> C5 or similar)
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc.connect(gain);
        gain.connect(this.masterGain || ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playTone(659.25, now, 0.9); // E5
      playTone(523.25, now + 0.35, 1.2); // C5
    } catch {
      // AudioContext unavailable
    }
  }

  // Tactile sound effect: Official passport ink stamp
  public playStampSound() {
    try {
      const ctx = this.initAudioContext();
      if (this.isMuted) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // AudioContext unavailable
    }
  }
}

export const audioManager = new AudioManager();
