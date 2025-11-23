
import { ApiResponse, Coordinates, AppSettings, PrayerData, Surah, SurahDetails } from '../types';

const ALADHAN_URL = 'https://api.aladhan.com/v1';
const QURAN_URL = 'https://api.alquran.cloud/v1';

const getBaseUrl = () => {
  try {
    // @ts-ignore
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env && meta.env.VITE_API_URL) {
      return meta.env.VITE_API_URL;
    }
  } catch (e) {
    // Fallback
  }
  return ALADHAN_URL;
};

// --- Cache Helpers ---
const getCacheKey = (coords: Coordinates, month: number, year: number, settings: AppSettings) => {
  const lat = coords.latitude.toFixed(2);
  const lng = coords.longitude.toFixed(2);
  const method = settings.calculationMethod;
  const school = settings.madhab;
  return `mawaqit_cache_${lat}_${lng}_${month}_${year}_${method}_${school}`;
};

export const getCachedMonth = (coords: Coordinates, dateObj: Date, settings: AppSettings): PrayerData[] => {
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  const cacheKey = getCacheKey(coords, month, year, settings);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch(e) { return []; }
  }
  return [];
};

// --- Prayer Times API ---
export const fetchPrayerTimes = async (coords: Coordinates, dateObj: Date, settings?: AppSettings): Promise<ApiResponse> => {
  try {
    const method = settings?.calculationMethod || 4;
    const school = settings?.madhab || 0;
    const offsets = settings?.offsets;
    
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const day = dateObj.getDate();

    // Try Cache
    if (settings) {
      const cacheKey = getCacheKey(coords, month, year, settings);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const dayData = parsedCache.find((d: any) => parseInt(d.date.gregorian.day) === day);
        if (dayData) return { code: 200, status: "OK", data: dayData };
      }
    }

    // Fetch
    const baseUrl = getBaseUrl();
    const tune = offsets 
      ? `0,${offsets.Fajr},${offsets.Sunrise},${offsets.Dhuhr},${offsets.Asr},0,${offsets.Maghrib},${offsets.Isha},0`
      : '0,0,0,0,0,0,0,0,0';

    let url;
    let isMonthly = false;

    if (baseUrl.includes('aladhan.com')) {
      url = `${baseUrl}/calendar/${year}/${month}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=${method}&school=${school}&tune=${tune}`;
      isMonthly = true;
    } else {
      url = `${baseUrl}/timings?latitude=${coords.latitude}&longitude=${coords.longitude}&method=${method}&school=${school}&tune=${tune}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const json = await response.json();

    if (isMonthly && settings && json.data) {
      const cacheKey = getCacheKey(coords, month, year, settings);
      localStorage.setItem(cacheKey, JSON.stringify(json.data));
      const dayData = json.data.find((d: any) => parseInt(d.date.gregorian.day) === day);
      return { code: 200, status: "OK", data: dayData || json.data[0] };
    }

    return json;
  } catch (error) {
    console.error("Failed to fetch prayer times:", error);
    throw error;
  }
};

// --- Geocoding ---
export const getCityName = async (coords: Coordinates, language: string = 'ar'): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=${language}`
    );
    if(!response.ok) throw new Error("Geocode failed");
    const data = await response.json();
    return data.city || data.locality || (language === 'ar' ? "موقع مخصص" : "Custom Location");
  } catch (e) {
    return `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
  }
};

export const searchCity = async (query: string, language: string = 'en'): Promise<Array<{name: string, lat: number, lng: number, country: string}>> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=${language}`);
    const data = await response.json();
    return data.map((item: any) => ({
      name: item.display_name.split(',')[0],
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      country: item.display_name.split(',').pop().trim()
    }));
  } catch (e) {
    return [];
  }
};

// --- Quran API ---

export const fetchSurahList = async (language: string = 'ar'): Promise<Surah[]> => {
  const cacheKey = `quran_surah_list_${language}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const response = await fetch(`${QURAN_URL}/surah`);
    const json = await response.json();
    if (json.code === 200) {
      localStorage.setItem(cacheKey, JSON.stringify(json.data));
      return json.data;
    }
    throw new Error("Failed to fetch surahs");
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const fetchSurahDetails = async (number: number): Promise<SurahDetails | null> => {
  const cacheKey = `quran_surah_${number}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    // Fetch Uthmani Text
    const response = await fetch(`${QURAN_URL}/surah/${number}/quran-uthmani`);
    const json = await response.json();
    if (json.code === 200) {
      localStorage.setItem(cacheKey, JSON.stringify(json.data));
      return json.data;
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const fetchTafseer = async (surahNumber: number, ayahNumber: number): Promise<string | null> => {
  try {
    // Using Tafseer Al-Muyassar (ar.aluy)
    const response = await fetch(`${QURAN_URL}/ayah/${surahNumber}:${ayahNumber}/ar.aluy`);
    const json = await response.json();
    if (json.code === 200) {
      return json.data.text;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// --- Mosques (Overpass API) ---
export interface Mosque {
  id: number;
  lat: number;
  lon: number;
  name?: string;
  distance?: number;
}

export const fetchNearbyMosques = async (coords: Coordinates): Promise<Mosque[]> => {
  // Radius 3000 meters
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${coords.latitude},${coords.longitude});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${coords.latitude},${coords.longitude});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    const data = await response.json();
    
    const mosques: Mosque[] = [];
    data.elements.forEach((el: any) => {
      if (el.type === 'node' && el.tags) {
        // Simple Distance calc
        const R = 6371e3; // metres
        const φ1 = coords.latitude * Math.PI/180;
        const φ2 = el.lat * Math.PI/180;
        const Δφ = (el.lat-coords.latitude) * Math.PI/180;
        const Δλ = (el.lon-coords.longitude) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;

        mosques.push({
          id: el.id,
          lat: el.lat,
          lon: el.lon,
          name: el.tags.name || el.tags['name:ar'] || el.tags['name:en'] || 'Masjid',
          distance: d
        });
      }
    });

    return mosques.sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 20);
  } catch (e) {
    console.error("Overpass API error", e);
    return [];
  }
};

// --- Push Notifications ---

// VAPID Public Key (Ideally this comes from env, but hardcoding for demo)
export const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5NkohOc";

export const subscribeToPush = async (subscription: PushSubscription) => {
  try {
    const backendUrl = getBaseUrl().replace('/v1', '').replace('api.aladhan.com', 'localhost:8000');
    
    // Using relative path assuming we are proxying or configured correctly
    // If running in separate ports locally:
    // @ts-ignore
    const meta = import.meta as any;
    const apiUrl = (meta.env && meta.env.VITE_API_URL) || 'http://localhost:8000/api';

    await fetch(`${apiUrl}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
  } catch (e) {
    console.error("Failed to send subscription to backend", e);
  }
};

export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
