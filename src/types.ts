export interface Timings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
}

export interface GregorianDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
  };
  month: {
    number: number;
    en: string;
  };
  year: string;
}

export interface PrayerData {
  timings: Timings;
  date: {
    readable: string;
    timestamp: string;
    hijri: HijriDate;
    gregorian: GregorianDate;
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      name: string;
      params: {
        Fajr: number;
        Isha: number;
      };
    };
  };
}

export interface ApiResponse {
  code: number;
  status: string;
  data: PrayerData;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export type Language = 'ar' | 'en' | 'fr';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
  calculationMethod: number;
  madhab: 0 | 1;
  offsets: Record<PrayerName, number>;
  locationMode: 'auto' | 'manual';
  manualLocation?: Coordinates & { city: string };
  adhanSound: 'makkah' | 'madina' | 'alaqsa' | 'beep' | 'none';
  pushEnabled?: boolean;
  lastReadSurah?: number;
  themeMode?: 'auto' | 'manual';
  neonColor?: string;
  masjidModeDuration?: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'ar',
  theme: 'dark',
  calculationMethod: 4,
  madhab: 0,
  offsets: {
    Fajr: 0,
    Sunrise: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0,
  },
  locationMode: 'auto',
  adhanSound: 'makkah',
  pushEnabled: false,
  themeMode: 'auto',
  masjidModeDuration: 20
};

export const CALCULATION_METHODS = [
  { id: 4, name: { ar: 'أم القرى (مكة)', en: 'Umm Al-Qura (Makkah)', fr: 'Umm Al-Qura' } },
  { id: 3, name: { ar: 'رابطة العالم الإسلامي', en: 'Muslim World League', fr: 'Ligue Islamique Mondiale' } },
  { id: 1, name: { ar: 'كراتشي', en: 'Karachi', fr: 'Karachi' } },
  { id: 2, name: { ar: 'أمريكا الشمالية (ISNA)', en: 'North America (ISNA)', fr: 'ISNA' } },
  { id: 5, name: { ar: 'الهيئة العامة للمساحة (مصر)', en: 'Egyptian General Authority', fr: 'Autorité Égyptienne' } },
  { id: 12, name: { ar: 'فرنسا (UOIF)', en: 'France (UOIF)', fr: 'France (UOIF)' } },
  { id: 13, name: { ar: 'تركيا (Diyanet)', en: 'Turkey (Diyanet)', fr: 'Turquie' } },
];

export interface Thikr {
  id: number;
  text: string;
  count: number;
  category: 'morning' | 'evening' | 'common' | 'sleep' | 'travel' | 'food' | 'sadness';
  description?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
}

export interface SurahDetails extends Surah {
  ayahs: Ayah[];
}

export interface Challenge {
  id: string;
  titleKey: string;
  descriptionKey: string;
  target: number;
  unit: 'days' | 'times';
  icon: string;
}

export interface UserProgress {
  challenges: Record<string, number>;
  badges: string[];
  streak: number;
  lastCheckIn: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation?: string;
  lastDua?: string;
}

export interface Mosque {
  id: number;
  lat: number;
  lon: number;
  name?: string;
  distance?: number;
}
