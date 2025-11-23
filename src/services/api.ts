
import { ApiResponse, Coordinates, AppSettings, PrayerData, Surah, SurahDetails } from '../types';

const ALADHAN_URL = 'https://api.aladhan.com/v1';
const QURAN_URL = 'https://api.alquran.cloud/v1';

const getBaseUrl = () => {
  try {
    const meta = import.meta;
    if (meta.env && meta.env.VITE_API_URL) {
      return meta.env.VITE_API_URL;
    }
  } catch (e) {}
  return ALADHAN_URL;
};

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

export const fetchPrayerTimes = async (coords: Coordinates, dateObj: Date, settings?: AppSettings): Promise<ApiResponse> => {
  try {
    const method = settings?.calculationMethod || 4;
    const school = settings?.madhab || 0;
    const offsets = settings?.offsets;
    
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const day = dateObj.getDate();

    if (settings) {
      const cacheKey = getCacheKey(coords, month, year, settings);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const dayData = parsedCache.find((d: any) => parseInt(d.date.gregorian.day) === day);
        if (dayData) return { code: 200, status: "OK", data: dayData };
      }
    }

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

export interface Mosque {
  id: number;
  lat: number;
  lon: number;
  name?: string;
  distance?: number;
}

export const fetchNearbyMosques = async (coords: Coordinates): Promise<Mosque[]> => {
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
        const R = 6371e3;
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
