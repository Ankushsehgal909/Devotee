export interface PanchangInfo {
  date: string;
  tithi: string;
  tithiEnd: string;
  paksha: 'Shukla' | 'Krishna';
  nakshatra: string;
  nakshatraEnd: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  // Auspicious
  abhijitMuhurat: string;
  amritKaal: string;
  brahmaMuhurat: string;
  // Inauspicious
  rahuKaalam: string;
  yamaganda: string;
  gulikaKaal: string;
}

export interface ChantingSession {
  mantraId: string;
  beadCount: number; // 0..108
  completedRounds: number;
  totalChants: number;
  date: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  deity: string;
  durationSeconds: number;
  audioUrl: string;
  coverImageUrl?: string;
  lyricsDevanagari?: string;
  lyricsEnglish?: string;
}

export interface FestivalEvent {
  id: string;
  name: string;
  date: string;
  tithi: string;
  significance: string;
  fastingRules?: string;
  recommendedPujaSlug?: string;
  deityCategory: 'Shiva' | 'Vishnu' | 'Devi' | 'Ganesha' | 'General';
}
