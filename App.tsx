import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Settings, RefreshCw, Home, BookOpen, Navigation as NavIcon, Trophy, Map as MapIcon, Loader2, WifiOff, Download, X, MessageSquare, Feather } from 'lucide-react';
import { fetchPrayerTimes, getCityName } from './services/api';
import { formatDuration, getNextPrayer, calculateQiblaDirection } from './utils/timeUtils';
import { ApiResponse, PrayerData, Coordinates, PrayerName } from './types';
import PrayerCard from './components/PrayerCard';
import TimeCard from './components/TimeCard';
import Compass from './components/Compass';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import SettingsModal from './components/SettingsModal';
import LiveBackground from './components/LiveBackground';
import MasjidMode from './components/MasjidMode';
import { Logo } from './components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from './hooks/usePWA';

// --- Lazy Load Components ---
const ChallengesModal = React.lazy(() => import('./components/ChallengesModal'));
const AthkarWidget = React.lazy(() => import('./components/AthkarWidget'));
const QuranView = React.lazy(() => import('./components/QuranView'));
const MosquesMap = React.lazy(() => import('./components/MosquesMap'));
const ARQibla = React.lazy(() => import('./components/ARQibla'));
const AIChat = React.lazy(() => import('./components/AIChat'));
const QuranForWomen = React.lazy(() => import('./components/QuranForWomen'));

const TabLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[300px] text-zinc-500 animate-pulse">
    <Loader2 className="w-8 h-8 animate-spin mb-2" />
    <span className="text-xs">جاري التحميل...</span>
  </div>
);

const MawaqitApp: React.FC = () => {
  const { settings, t } = useSettings();
  const { needRefresh, updateServiceWorker, closeUpdate, isInstallable, installPWA } = usePWA();
  
  const [activeTab, setActiveTab] = useState<'home' | 'mosques' | 'quran' | 'athkar' | 'chat' | 'quran_women'>('home');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PrayerData | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [city, setCity] = useState<string>(t('common.loading'));
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [nextPrayer, setNextPrayer] = useState<PrayerName>('Fajr');
  const [qibla, setQibla] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);
  const [isMasjidModeActive, setIsMasjidModeActive] = useState(false);
  const [isAROpen, setIsAROpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme & Neon Logic
  useEffect(() => {
    const root = document.documentElement;
    
    // Handle UI Theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }

    // Dynamic Neon Color
    let color = settings.neonColor || '#53ff4c'; 
    if (settings.themeMode !== 'manual') {
       if (nextPrayer === 'Sunrise') color = '#ff9d00'; 
       else if (nextPrayer === 'Dhuhr') color = '#00d9ff'; 
       else if (nextPrayer === 'Asr') color = '#ffae00'; 
       else if (nextPrayer === 'Maghrib') color = '#ff4c4c'; 
       else if (nextPrayer === 'Isha') color = '#53ff4c'; 
       else if (nextPrayer === 'Fajr') color = '#8c52ff'; 
    }
    
    root.style.setProperty('--neon-color', color);
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '83, 255, 76';
    };
    root.style.setProperty('--neon-rgb', hexToRgb(color));
  }, [nextPrayer, settings.themeMode, settings.neonColor, settings.theme]);

  const loadPrayerTimes = async (coordinates: Coordinates) => {
    setLoading(true);
    try {
      const res: ApiResponse = await fetchPrayerTimes(coordinates, new Date(), settings);
      if (res.code === 200) {
        setData(res.data);
        setError(null);
      } else {
        setError("خطأ في جلب البيانات");
      }
    } catch (e) {
      setError(t('common.offline'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (settings.locationMode === 'manual' && settings.manualLocation) {
         setCoords(settings.manualLocation);
         setCity(settings.manualLocation.city);
         setQibla(calculateQiblaDirection(settings.manualLocation.latitude, settings.manualLocation.longitude));
         await loadPrayerTimes(settings.manualLocation);
      } else {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            setCoords(c);
            setQibla(calculateQiblaDirection(c.latitude, c.longitude));
            const name = await getCityName(c, settings.language);
            setCity(name);
            await loadPrayerTimes(c);
          },
          async () => {
            const fallback = { latitude: 21.4225, longitude: 39.8262 };
            setCoords(fallback);
            setCity(t('common.location'));
            await loadPrayerTimes(fallback);
          }
        );
      }
    };
    init();
  }, [settings.locationMode, settings.manualLocation]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      if (data?.timings) {
        const { next, remainingSeconds } = getNextPrayer(data.timings);
        setNextPrayer(next);
        setTimeLeft(remainingSeconds);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [data]);

  if (loading && !data) return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-neon">
      <RefreshCw className="w-10 h-10 animate-spin mb-4" />
      <p className="animate-pulse">{t('common.loading')}</p>
    </div>
  );

  const prayerList: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-dark text-zinc-900 dark:text-white pb-24 transition-colors duration-300 font-sans">
      <LiveBackground nextPrayer={nextPrayer} timeLeft={timeLeft} themeMode={settings.themeMode || 'auto'} />
      
      {isAROpen && <Suspense fallback={null}><ARQibla onClose={() => setIsAROpen(false)} qiblaAngle={qibla} /></Suspense>}
      
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full border border-zinc-200 dark:border-zinc-700">
            <Logo className="w-8 h-8 text-neon drop-shadow-[0_0_8px_rgba(var(--neon-rgb),0.6)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none mb-1">مواقيت صلاتك</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xs leading-none flex items-center gap-2">
              {city} {isOffline && <WifiOff className="w-3 h-3 text-red-500" />}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isInstallable && <button onClick={installPWA} className="p-2 text-neon hover:bg-neon/10 rounded-full transition-colors"><Download className="w-6 h-6" /></button>}
          <button onClick={() => setIsChallengesOpen(true)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-yellow-500"><Trophy className="w-6 h-6" /></button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-neon"><Settings className="w-6 h-6" /></button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <TimeCard 
                currentTime={currentTime} 
                hijriDate={`${data?.date.hijri.day} ${data?.date.hijri.month[settings.language === 'en' ? 'en' : 'ar']} ${data?.date.hijri.year}`} 
                gregorianDate={`${data?.date.gregorian.day} ${data?.date.gregorian.month.en} ${data?.date.gregorian.year}`} 
                nextPrayerName={t(`prayers.${nextPrayer}`)} 
                timeToNext={formatDuration(timeLeft)}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {prayerList.map((p) => (
                  <PrayerCard key={p} name={p} time={data?.timings[p] || ''} isActive={nextPrayer === p} isNext={nextPrayer === p} />
                ))}
              </div>
              <div className="relative">
                <Compass qiblaAngle={qibla} />
                <button onClick={() => setIsAROpen(true)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neon text-black px-6 py-2 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                  <NavIcon className="w-4 h-4" /> {t('common.startAR')}
                </button>
              </div>
            </motion.div>
          )}
          {activeTab === 'quran' && <Suspense fallback={<TabLoader />}><QuranView /></Suspense>}
          {activeTab === 'athkar' && <Suspense fallback={<TabLoader />}><AthkarWidget /></Suspense>}
          {activeTab === 'mosques' && coords && <Suspense fallback={<TabLoader />}><MosquesMap coords={coords} /></Suspense>}
          {activeTab === 'chat' && <Suspense fallback={<TabLoader />}><AIChat /></Suspense>}
          {activeTab === 'quran_women' && <Suspense fallback={<TabLoader />}><QuranForWomen /></Suspense>}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-dark/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-1">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 p-2 flex-1 ${activeTab === 'home' ? 'text-neon' : 'text-zinc-400'}`}><Home className="w-5 h-5" /><span className="text-[10px] font-bold">{t('common.home')}</span></button>
          <button onClick={() => setActiveTab('mosques')} className={`flex flex-col items-center gap-1 p-2 flex-1 ${activeTab === 'mosques' ? 'text-neon' : 'text-zinc-400'}`}><MapIcon className="w-5 h-5" /><span className="text-[10px] font-bold">{t('common.mosques')}</span></button>
          <button onClick={() => setActiveTab('quran')} className={`flex flex-col items-center gap-1 p-2 flex-1 ${activeTab === 'quran' ? 'text-neon' : 'text-zinc-400'}`}><BookOpen className="w-5 h-5" /><span className="text-[10px] font-bold">{t('common.quran')}</span></button>
          <button onClick={() => setActiveTab('quran_women')} className={`flex flex-col items-center gap-1 p-2 flex-1 ${activeTab === 'quran_women' ? 'text-neon' : 'text-zinc-400'}`}><Feather className="w-5 h-5" /><span className="text-[10px] font-bold">{t('common.quranWomen')}</span></button>
          <button onClick={() => setActiveTab('athkar')} className={`flex flex-col items-center gap-1 p-2 flex-1 ${activeTab === 'athkar' ? 'text-neon' : 'text-zinc-400'}`}><span className="text-xl leading-none">📿</span><span className="text-[10px] font-bold">{t('common.athkar')}</span></button>
          <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 p-2 flex-1 ${activeTab === 'chat' ? 'text-neon' : 'text-zinc-400'}`}><MessageSquare className="w-5 h-5" /><span className="text-[10px] font-bold">AI</span></button>
        </div>
      </nav>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentCoords={coords || {latitude: 0, longitude: 0}} 
        onUpdateLocation={(newCoords, newCity) => { setCoords(newCoords); setCity(newCity); loadPrayerTimes(newCoords); }}
      />
      {isChallengesOpen && <Suspense fallback={null}><ChallengesModal isOpen={isChallengesOpen} onClose={() => setIsChallengesOpen(false)} /></Suspense>}
      <MasjidMode isActive={isMasjidModeActive} onClose={() => setIsMasjidModeActive(false)} durationMinutes={settings.masjidModeDuration || 20} />
    </div>
  );
};

const App: React.FC = () => (
  <SettingsProvider>
    <MawaqitApp />
  </SettingsProvider>
);

export default App;