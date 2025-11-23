
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Settings, RefreshCw, Bell, ChevronLeft, ChevronRight, WifiOff, Volume2, Home, Calendar as CalendarIcon, BookOpen, Navigation as NavIcon, Trophy, VolumeX, Map as MapIcon } from 'lucide-react';
import { fetchPrayerTimes, getCityName, getCachedMonth } from './services/api';
import { formatDuration, getNextPrayer, calculateQiblaDirection, timeToMinutes } from './utils/timeUtils';
import { ApiResponse, PrayerData, Coordinates, PrayerName } from './types';
import PrayerCard from './components/PrayerCard';
import TimeCard from './components/TimeCard';
import Compass from './components/Compass';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import SettingsModal from './components/SettingsModal';
import ChallengesModal from './components/ChallengesModal';
import AthkarWidget from './components/AthkarWidget';
import HijriCalendar from './components/HijriCalendar';
import QuranView from './components/QuranView';
import MosquesMap from './components/MosquesMap';
import LiveBackground from './components/LiveBackground';
import MasjidMode from './components/MasjidMode';
import ARQibla from './components/ARQibla';
import { motion, AnimatePresence } from 'framer-motion';

const MawaqitApp: React.FC = () => {
  const { settings, updateSettings, t, isRTL } = useSettings();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'athkar' | 'quran' | 'mosques'>('home');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PrayerData | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [city, setCity] = useState<string>(t('common.loading'));
  
  // Date Navigation State
  const [displayDate, setDisplayDate] = useState<Date>(new Date());
  const [isOffline, setIsOffline] = useState(false);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [nextPrayer, setNextPrayer] = useState<PrayerName>('Fajr');
  const [qibla, setQibla] = useState<number>(0);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);
  const [isMasjidModeActive, setIsMasjidModeActive] = useState(false);
  const [isAROpen, setIsAROpen] = useState(false);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  
  // Timer Refs
  const timerRef = useRef<any>(null);
  const notifiedEvents = useRef<Set<string>>(new Set()); // To prevent duplicate notifications
  
  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Swipe Refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Dynamic Theme Logic
  useEffect(() => {
    const root = document.documentElement;
    let color = '#53ff4c'; // Default Neon Green
    
    if (settings.themeMode === 'manual' && settings.neonColor) {
       color = settings.neonColor;
    } else {
       if (nextPrayer === 'Sunrise') color = '#ff9d00'; // Orange
       else if (nextPrayer === 'Dhuhr') color = '#00d9ff'; // Cyan
       else if (nextPrayer === 'Asr') color = '#ffae00'; // Amber
       else if (nextPrayer === 'Maghrib') color = '#ff4c4c'; // Red
       else if (nextPrayer === 'Isha') color = '#53ff4c'; // Green (Night)
       else if (nextPrayer === 'Fajr') color = '#8c52ff'; // Purple
    }

    root.style.setProperty('--neon-color', color);
    const rgb = hexToRgb(color);
    if (rgb) root.style.setProperty('--neon-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    
  }, [nextPrayer, settings.themeMode, settings.neonColor]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // 1. Initialize & Get Location
  useEffect(() => {
    const init = async () => {
      // Check Notifications Permission on Start
      if ("Notification" in window) {
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true);
        } else if (Notification.permission !== 'denied' && Notification.permission !== 'default') {
           // Some browsers might be in a state where we can prompt
        }
      }

      if (settings.locationMode === 'manual' && settings.manualLocation) {
         setCoords(settings.manualLocation);
         setCity(settings.manualLocation.city);
         setQibla(calculateQiblaDirection(settings.manualLocation.latitude, settings.manualLocation.longitude));
         loadPrayerTimes(settings.manualLocation, new Date());
         return;
      }

      try {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const newCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              setCoords(newCoords);
              const cityName = await getCityName(newCoords, settings.language);
              setCity(cityName);
              const qiblaDir = calculateQiblaDirection(newCoords.latitude, newCoords.longitude);
              setQibla(qiblaDir);
              loadPrayerTimes(newCoords, new Date());
            },
            (err) => {
              console.error(err);
              const fallbackCoords = { latitude: 21.4225, longitude: 39.8262 }; // Makkah
              setCoords(fallbackCoords);
              setCity(t('common.location'));
              setQibla(0);
              loadPrayerTimes(fallbackCoords, new Date());
            }
          );
        } else {
          setError("Geo not supported");
        }
      } catch (e) {
        setError("Error");
      }
    };

    init();
    
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));
    setIsOffline(!navigator.onLine);

  }, [settings.locationMode, settings.manualLocation, settings.language]);

  useEffect(() => {
    if (coords) {
      loadPrayerTimes(coords, displayDate);
    }
  }, [settings.calculationMethod, settings.madhab, settings.offsets]);

  const loadPrayerTimes = async (coordinates: Coordinates, date: Date) => {
    setLoading(true);
    try {
      const res: ApiResponse = await fetchPrayerTimes(coordinates, date, settings);
      if (res.code === 200) {
        setData(res.data);
        setError(null);
      } else {
        setError("Server Error");
      }
    } catch (e) {
      setError(t('common.offline'));
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(displayDate);
    newDate.setDate(newDate.getDate() + days);
    setDisplayDate(newDate);
    if (coords) {
      loadPrayerTimes(coords, newDate);
    }
  };

  // Main Timer Loop for Countdown and Notifications
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (data?.timings && isSameDate(now, displayDate)) {
        const { next, remainingSeconds } = getNextPrayer(data.timings);
        setNextPrayer(next);
        setTimeLeft(remainingSeconds);

        // --- Notifications Logic ---
        if (notificationsEnabled) {
          const dateKey = now.toDateString();
          
          // 1. Exact Prayer Time (Adhan)
          // Allow a small window (0 to -5 seconds) to catch the event even if timer drifts
          const adhanKey = `${next}-adhan-${dateKey}`;
          if (remainingSeconds <= 0 && remainingSeconds > -10 && !notifiedEvents.current.has(adhanKey)) {
            if (settings.adhanSound !== 'none' && !isMasjidModeActive) {
               playAdhan();
            }
            sendNotification(t(`prayers.${next}`), t('common.timeForPrayer') || "It's time to pray");
            notifiedEvents.current.add(adhanKey);
          }

          // 2. Pre-Prayer Reminder (15 Minutes Before)
          // 900 seconds = 15 minutes. Check range 900 to 890 to ensure it fires.
          const preKey = `${next}-15min-${dateKey}`;
          if (remainingSeconds <= 900 && remainingSeconds > 880 && !notifiedEvents.current.has(preKey)) {
             sendNotification(
               t('common.approaching') + " " + t(`prayers.${next}`),
               t('common.15minLeft') || "15 minutes remaining"
             );
             notifiedEvents.current.add(preKey);
          }

          // 3. Athkar Reminders
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          
          // A. Morning Athkar (At Sunrise)
          const sunriseMinutes = timeToMinutes(data.timings.Sunrise);
          const morningKey = `morning-athkar-${dateKey}`;
          
          if (currentMinutes === sunriseMinutes && !notifiedEvents.current.has(morningKey)) {
             sendNotification(
               t('common.morning') + " " + t('common.athkar'), 
               settings.language === 'ar' ? "حان وقت أذكار الصباح ☀️" : "Time for Morning Athkar ☀️"
             );
             notifiedEvents.current.add(morningKey);
          }

          // B. Evening Athkar (Asr + 20 mins)
          const asrMinutes = timeToMinutes(data.timings.Asr);
          const eveningKey = `evening-athkar-${dateKey}`;
          
          if (currentMinutes === asrMinutes + 20 && !notifiedEvents.current.has(eveningKey)) {
             sendNotification(
               t('common.evening') + " " + t('common.athkar'), 
               settings.language === 'ar' ? "حان وقت أذكار المساء 🌙" : "Time for Evening Athkar 🌙"
             );
             notifiedEvents.current.add(eveningKey);
          }
          
          // Clean up old keys if set gets too large (simple maintenance)
          if (notifiedEvents.current.size > 50) {
            notifiedEvents.current.clear();
          }
        }
      } else {
        setTimeLeft(0);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data, notificationsEnabled, settings.language, displayDate, settings.adhanSound, isMasjidModeActive]);

  const isSameDate = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const playAdhan = () => {
    if (!audioRef.current) return;
    
    let soundUrl = '';
    switch(settings.adhanSound) {
      case 'makkah': soundUrl = 'https://www.islamcan.com/audio/adhan/azan1.mp3'; break;
      case 'madina': soundUrl = 'https://www.islamcan.com/audio/adhan/azan2.mp3'; break;
      case 'alaqsa': soundUrl = 'https://www.islamcan.com/audio/adhan/azan3.mp3'; break;
      case 'beep': soundUrl = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'; break;
      default: return;
    }

    audioRef.current.src = soundUrl;
    audioRef.current.play().catch(e => console.log("Audio play blocked", e));
  };

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      try {
        const options: any = {
           body: body,
           icon: '/icon.png',
           badge: '/icon.png',
           vibrate: [200, 100, 200]
        };

        // Try using Service Worker Registration for better mobile support
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
           navigator.serviceWorker.ready.then(registration => {
              registration.showNotification(title, options);
           });
        } else {
           // Fallback to classic Notification API
           new Notification(title, options);
        }
      } catch (e) {
        console.error("Notification Error:", e);
      }
    }
  };

  const toggleNotifications = async () => {
    if (!("Notification" in window)) {
      alert(settings.language === 'ar' ? "هذا المتصفح لا يدعم الإشعارات." : "This browser does not support notifications.");
      return;
    }

    if (Notification.permission === 'default') {
       const permission = await Notification.requestPermission();
       if (permission === 'granted') {
         setNotificationsEnabled(true);
         sendNotification(t('common.pushEnabled'), settings.language === 'ar' ? "تم تفعيل التنبيهات بنجاح" : "Notifications activated successfully");
       }
       return;
    }
    
    if (Notification.permission === 'denied') {
       // Guide user if denied
       alert(settings.language === 'ar' 
         ? "تم حظر الإشعارات من إعدادات المتصفح. يرجى الضغط على القفل في شريط العنوان وتفعيل الإشعارات."
         : "Notifications are blocked. Please enable them in your browser settings (click the lock icon in address bar).");
       return;
    }

    // If granted, toggle state
    if (Notification.permission === 'granted') {
       const newState = !notificationsEnabled;
       setNotificationsEnabled(newState);
       if (newState) {
          sendNotification(t('common.pushEnabled'), settings.language === 'ar' ? "تم تفعيل التنبيهات" : "Notifications Active");
       }
    }
  };

  // Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (Math.abs(distance) > 50 && activeTab === 'home') {
       if (isLeftSwipe) changeDate(isRTL ? -1 : 1);
       else if (isRightSwipe) changeDate(isRTL ? 1 : -1);
    }
  };

  if (loading && !data) return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-neon space-y-4">
      <RefreshCw className="w-10 h-10 animate-spin" />
      <p className="text-zinc-400 animate-pulse">{t('common.loading')}</p>
    </div>
  );

  const prayerList: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const isToday = isSameDate(displayDate, new Date());

  return (
    <div 
      className="min-h-screen bg-dark text-white pb-24 selection:bg-neon selection:text-black transition-colors duration-300 font-sans"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      
      <audio ref={audioRef} className="hidden" />

      <LiveBackground 
        nextPrayer={nextPrayer} 
        timeLeft={timeLeft} 
        themeMode={settings.themeMode || 'auto'}
      />

      {/* AR Overlay */}
      {isAROpen && (
        <ARQibla onClose={() => setIsAROpen(false)} qiblaAngle={qibla} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark/80 backdrop-blur-lg border-b border-zinc-800/50 px-6 py-4 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <div className="bg-zinc-800 p-2 rounded-full">
               <MapPin className="w-5 h-5 text-neon" aria-hidden="true" />
            </div>
            <div>
               <h1 className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{t('common.location')}</h1>
               <p className="text-white font-bold text-lg leading-none flex items-center gap-2">
                 {city}
                 {isOffline && <WifiOff className="w-4 h-4 text-red-500" aria-label={t('common.offline')} />}
               </p>
            </div>
         </div>
         
         <div className="flex items-center gap-2">
           <button 
              onClick={() => setIsChallengesOpen(true)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-yellow-400"
              aria-label={t('common.openChallenges')}
           >
              <Trophy className="w-6 h-6" />
           </button>

           <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-neon"
              aria-label={t('common.openSettings')}
           >
              <Settings className="w-6 h-6" />
           </button>
         </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl overflow-hidden min-h-[80vh] relative z-10">
        <AnimatePresence mode="wait">
          
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Date Navigation Controls */}
              <div className="flex items-center justify-between px-2">
                 <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400" aria-label="Previous Day">
                   {isRTL ? <ChevronRight /> : <ChevronLeft />}
                 </button>
                 <div className="text-center">
                   <div className="text-lg font-bold text-white">
                     {displayDate.toLocaleDateString(settings.language === 'ar' ? 'ar-SA' : settings.language, { weekday: 'long', day: 'numeric', month: 'long' })}
                   </div>
                   {!isToday && (
                     <button onClick={() => { setDisplayDate(new Date()); if(coords) loadPrayerTimes(coords, new Date()); }} className="text-xs text-neon mt-1">
                       {t('common.useCurrent')}
                     </button>
                   )}
                 </div>
                 <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400" aria-label="Next Day">
                   {isRTL ? <ChevronLeft /> : <ChevronRight />}
                 </button>
              </div>

              {isOffline && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center py-2 rounded-lg" role="alert">
                  {t('common.offlineMode')}
                </div>
              )}

              {data && (
                <TimeCard 
                  currentTime={currentTime}
                  hijriDate={`${data.date.hijri.day} ${data.date.hijri.month[settings.language === 'en' ? 'en' : 'ar']} ${data.date.hijri.year}`}
                  gregorianDate={`${data.date.gregorian.day} ${data.date.gregorian.month.en} ${data.date.gregorian.year}`}
                  nextPrayerName={isToday ? `${t(`prayers.${nextPrayer}`)}` : ''}
                  timeToNext={isToday ? formatDuration(timeLeft) : '--:--:--'}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {/* Local Notifications */}
                 <button 
                   className="flex items-center justify-between bg-card p-4 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors w-full text-left"
                   onClick={toggleNotifications}
                   type="button"
                 >
                    <div className="flex items-center gap-3">
                       <div className="relative">
                          <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-neon' : 'text-zinc-500'}`} aria-hidden="true" />
                          {notificationsEnabled && <span className="absolute top-0 right-0 w-2 h-2 bg-neon rounded-full animate-ping"></span>}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-300">{t('common.notifications')}</span>
                          <span className="text-xs text-zinc-500">{t('common.notificationsDesc')}</span>
                       </div>
                    </div>
                    {/* Visual Switch */}
                    <div 
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${notificationsEnabled ? 'bg-neon' : 'bg-zinc-700'}`}
                      role="switch"
                      aria-checked={notificationsEnabled}
                      aria-label={t('common.notifications')}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${notificationsEnabled ? isRTL ? '-translate-x-6' : 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                 </button>

                 {/* Masjid Mode Toggle */}
                 <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                       <VolumeX className={`w-5 h-5 ${isMasjidModeActive ? 'text-red-500' : 'text-zinc-500'}`} />
                       <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-300">{t('common.masjidMode')}</span>
                          <span className="text-xs text-zinc-500">20m Silence</span>
                       </div>
                    </div>
                    <button 
                       onClick={() => setIsMasjidModeActive(!isMasjidModeActive)}
                       className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isMasjidModeActive ? 'bg-red-500' : 'bg-zinc-700'}`}
                    >
                       <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isMasjidModeActive ? isRTL ? '-translate-x-6' : 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {prayerList.map((prayer) => (
                  <PrayerCard 
                    key={prayer}
                    name={prayer}
                    time={data?.timings[prayer] || ''}
                    isActive={isToday && nextPrayer === prayer}
                    isNext={isToday && nextPrayer === prayer}
                  />
                ))}
              </div>

              <div className="relative">
                 <Compass qiblaAngle={qibla} />
                 <button 
                   onClick={() => setIsAROpen(true)}
                   className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neon text-black px-6 py-2 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                 >
                    <NavIcon className="w-4 h-4" />
                    {t('common.startAR')}
                 </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && coords && (
            <HijriCalendar monthData={getCachedMonth(coords, displayDate, settings)} />
          )}

          {activeTab === 'athkar' && (
            <AthkarWidget />
          )}

          {activeTab === 'quran' && (
            <QuranView />
          )}

          {activeTab === 'mosques' && coords && (
            <MosquesMap coords={coords} />
          )}

        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 w-full bg-dark/90 backdrop-blur-xl border-t border-zinc-800 pb-safe z-50"
        role="navigation"
      >
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-1">
           <button 
             onClick={() => setActiveTab('home')}
             className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'home' ? 'text-neon' : 'text-zinc-500'}`}
           >
             <Home className="w-5 h-5" />
             <span className="text-[9px] font-bold">{t('common.home')}</span>
           </button>
           
           <button 
             onClick={() => setActiveTab('mosques')}
             className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'mosques' ? 'text-neon' : 'text-zinc-500'}`}
           >
             <MapIcon className="w-5 h-5" />
             <span className="text-[9px] font-bold">{t('common.mosques')}</span>
           </button>

           <button 
             onClick={() => setActiveTab('quran')}
             className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'quran' ? 'text-neon' : 'text-zinc-500'}`}
           >
             <BookOpen className="w-5 h-5" />
             <span className="text-[9px] font-bold">{t('common.quran')}</span>
           </button>

           <button 
             onClick={() => setActiveTab('athkar')}
             className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'athkar' ? 'text-neon' : 'text-zinc-500'}`}
           >
             <div className="relative">
                <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[8px]">33</div>
             </div>
             <span className="text-[9px] font-bold">{t('common.athkar')}</span>
           </button>

           <button 
             onClick={() => setActiveTab('calendar')}
             className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'calendar' ? 'text-neon' : 'text-zinc-500'}`}
           >
             <CalendarIcon className="w-5 h-5" />
             <span className="text-[9px] font-bold">{t('common.calendar')}</span>
           </button>
        </div>
      </nav>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentCoords={coords || {latitude: 0, longitude: 0}}
        onUpdateLocation={(newCoords, newCity) => {
          setCoords(newCoords);
          setCity(newCity);
          loadPrayerTimes(newCoords, displayDate);
        }}
      />

      <ChallengesModal 
        isOpen={isChallengesOpen}
        onClose={() => setIsChallengesOpen(false)}
      />

      <MasjidMode 
        isActive={isMasjidModeActive}
        onClose={() => setIsMasjidModeActive(false)}
        durationMinutes={settings.masjidModeDuration || 20}
      />

    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <MawaqitApp />
    </SettingsProvider>
  );
}

export default App;
