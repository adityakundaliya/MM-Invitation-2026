// Centralized Event Configuration
// Edit any text, dates, venues, or asset paths in this single file.

export interface EventConfig {
  eventName: string;
  shortName: string;
  year: string;
  edition: string;
  motto: string;
  clubName: string;
  universityName: string;
  universityTagline: string;
  tagline: string;
  subtagline: string;
  dates: string;
  datesRaw: {
    startDate: string; // ISO date for calendar
    endDate: string;
  };
  time: string;
  venue: string;
  city: string;
  destination: string;
  invitationMessage: string;
  supportingMessage: string;
  flightNumber: string;
  gate: string;
  seat: string;
  boardingStatus: string;
  passengerName: string;
  classType: string;
  terminal: string;
  assets: {
    poster: string;
    passportCover: string;
    airplaneBanner: string;
    matchboxLogo: string;
    universalLogo: string;
    fluteFeather: string;
    music: string;
    onboardingSound: string;
    voiceNote: string;
  };
  social: {
    instagram?: string;
    registrationUrl?: string;
  };
}

export const EVENT_CONFIG: EventConfig = {
  eventName: 'MARKETING MURLIDHAR 2026',
  shortName: 'MARKETING MURLIDHAR',
  year: '2026',
  edition: 'PASSPORT TO PLATE',
  motto: 'Explore • Taste • Connect',
  clubName: 'CLUB MATCHBOX',
  universityName: 'UNIVERSAL AI UNIVERSITY',
  universityTagline: 'The future is here',
  tagline: 'Where Devotion Meets Innovation, Ideas Play. Impact Stays.',
  subtagline: 'Same Passion. Different Countries.',
  dates: '26th & 29th October 2026',
  datesRaw: {
    startDate: '2026-10-26T18:00:00',
    endDate: '2026-10-29T23:59:00',
  },
  time: '6:00 PM – 12:00 AM',
  venue: 'Cultural Ground',
  city: 'Universal AI University',
  destination: 'MARKETING MURLIDHAR 2026',
  invitationMessage: "YOU'RE INVITED!",
  supportingMessage:
    'Murlidhar has a calling for you — a journey of flavours, strategy and unforgettable memories awaits.',
  flightNumber: 'MM-2026',
  gate: 'GATE 01 (CUL-GND)',
  seat: 'VIP-01',
  boardingStatus: 'INVITATION CONFIRMED',
  passengerName: 'VALUED GUEST',
  classType: 'FIRST CLASS / VIP ACCESS',
  terminal: 'TERMINAL 1 • MAIN CONCOURSE',
  assets: {
    poster: '/assets/event-poster.jpg',
    passportCover: '/assets/passport-cover.jpg',
    airplaneBanner: '/assets/airplane-banner.jpg',
    matchboxLogo: '/assets/matchbox-logo-official.png',
    universalLogo: '/assets/universal-logo-official.png',
    fluteFeather: '/assets/flute-feather.png',
    music: '/assets/event-music.mp3',
    onboardingSound: '/assets/MM.mp3', // plays once when the guest taps "Enter the experience"
    voiceNote: '/assets/voice-note.mp3',
  },
  social: {
    instagram: 'https://instagram.com/clubmatchbox',
    registrationUrl: '#',
  },
};
