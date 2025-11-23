import { PrayerName, Timings } from '../types';

// Convert "HH:mm" string to minutes since midnight
export const timeToMinutes = (timeStr: string): number => {
  // Remove any suffix like (EST) if present
  const cleanTime = timeStr.split(' ')[0]; 
  const [hours, minutes] = cleanTime.split(':').map(Number);
  return hours * 60 + minutes;
};

// Format Date object to HH:mm:ss
export const formatTimeWithSeconds = (date: Date): string => {
  return date.toLocaleTimeString('ar-SA', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const formatTimeShort = (timeStr: string): string => {
   // Ensure we just get HH:mm
   const clean = timeStr.split(' ')[0];
   const [h, m] = clean.split(':');
   return `${h}:${m}`;
};

export const getNextPrayer = (timings: Timings): { next: PrayerName; remainingSeconds: number } => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();
  
  const prayerOrder: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  for (const prayer of prayerOrder) {
    const prayerMinutes = timeToMinutes(timings[prayer]);
    if (prayerMinutes > currentMinutes) {
      const diffMinutes = prayerMinutes - currentMinutes;
      const diffSeconds = (diffMinutes * 60) - currentSeconds;
      return { next: prayer, remainingSeconds: diffSeconds };
    }
  }

  // If all passed, next is Fajr tomorrow
  const fajrTomorrow = timeToMinutes(timings['Fajr']) + (24 * 60);
  const diffMinutes = fajrTomorrow - currentMinutes;
  const diffSeconds = (diffMinutes * 60) - currentSeconds;
  
  return { next: 'Fajr', remainingSeconds: diffSeconds };
};

export const formatDuration = (totalSeconds: number): string => {
  if (totalSeconds < 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Qibla Calculation
export const calculateQiblaDirection = (lat: number, lng: number): number => {
  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;

  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const kaabaLatRad = (KAABA_LAT * Math.PI) / 180;
  const kaabaLngRad = (KAABA_LNG * Math.PI) / 180;

  const y = Math.sin(kaabaLngRad - lngRad);
  const x = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(kaabaLngRad - lngRad);
  
  let qibla = Math.atan2(y, x) * (180 / Math.PI);
  return (qibla + 360) % 360;
};