
import { Language, PrayerName } from '../types';

type TranslationStructure = {
  prayers: Record<PrayerName, string>;
  common: {
    loading: string;
    location: string;
    settings: string;
    next: string;
    remaining: string;
    gregorian: string;
    hijri: string;
    qibla: string;
    qiblaDesc: string;
    rotateDevice: string;
    relativeToNorth: string;
    notifications: string;
    notificationsDesc: string;
    pushNotifs: string;
    enablePush: string;
    pushEnabled: string;
    autoLocation: string;
    manualLocation: string;
    save: string;
    cancel: string;
    general: string;
    calculation: string;
    adjustments: string;
    language: string;
    method: string;
    madhab: string;
    shafi: string;
    hanafi: string;
    minutes: string;
    pickLocation: string;
    searchCity: string;
    searchPlaceholder: string;
    useCurrent: string;
    audio: string;
    adhanSound: string;
    sounds: {
      makkah: string;
      madina: string;
      alaqsa: string;
      beep: string;
      none: string;
    };
    audioWarningTitle: string;
    audioWarning: string;
    offline: string;
    offlineMode: string;
    athkar: string;
    calendar: string;
    home: string;
    quran: string;
    mosques: string;
    morning: string;
    evening: string;
    sleep: string;
    travel: string;
    food: string;
    sadness: string;
    playAmbient: string;
    stopAmbient: string;
    completed: string;
    reset: string;
    whiteDays: string;
    searchSurah: string;
    meccan: string;
    medinan: string;
    verses: string;
    continueReading: string;
    tafseer: string;
    copy: string;
    share: string;
    copied: string;
    nearbyMosques: string;
    distance: string;
    aiAssistant: string;
    askAi: string;
    askAiPlaceholder: string;
    aiDisclaimer: string;
    arMode: string;
    cameraPermission: string;
    facingQibla: string;
    startAR: string;
    challenges: string;
    badges: string;
    family: string;
    addFamily: string;
    sendDua: string;
    duaSent: string;
    progress: string;
    checkIn: string;
    claimed: string;
    familyPlaceholder: string;
    timeRemainingFor: string;
    openSettings: string;
    openChallenges: string;
    navHome: string;
    navCalendar: string;
    navQuran: string;
    navAthkar: string;
    close: string;
    masjidMode: string;
    masjidModeActive: string;
    silencePhone: string;
    stop: string;
  };
  challenges: {
    fajr40: { title: string; desc: string; };
    kahf: { title: string; desc: string; };
    fasting: { title: string; desc: string; };
    khatma: { title: string; desc: string; };
  }
};

export const resources: Record<Language, TranslationStructure> = {
  ar: {
    prayers: {
      Fajr: 'الفجر',
      Sunrise: 'الشروق',
      Dhuhr: 'الظهر',
      Asr: 'العصر',
      Maghrib: 'المغرب',
      Isha: 'العشاء',
    },
    common: {
      loading: 'جاري التحميل...',
      location: 'الموقع',
      settings: 'الإعدادات',
      next: 'القادمة',
      remaining: 'المتبقي',
      gregorian: 'الموافق',
      hijri: 'الهجري',
      qibla: 'القبلة',
      qiblaDesc: 'اتجاه الكعبة المشرفة',
      rotateDevice: 'قم بتدوير جهازك لمحاذاة السهم',
      relativeToNorth: 'الاتجاه بالنسبة للشمال الجغرافي',
      notifications: 'تنبيهات التطبيق',
      notificationsDesc: 'صوت الأذان أثناء فتح التطبيق',
      pushNotifs: 'إشعارات الخلفية',
      enablePush: 'تفعيل الإشعارات',
      pushEnabled: 'الإشعارات مفعلة',
      autoLocation: 'تلقائي (GPS)',
      manualLocation: 'يدوي (الخريطة)',
      save: 'حفظ الإعدادات',
      cancel: 'إلغاء',
      general: 'عام',
      calculation: 'الحساب',
      adjustments: 'تعديل الأوقات',
      language: 'اللغة',
      method: 'طريقة الحساب',
      madhab: 'المذهب الفقهي',
      shafi: 'جمهور (شافعي، مالكي، حنبلي)',
      hanafi: 'حنفي',
      minutes: 'دقيقة',
      pickLocation: 'اختر موقعك',
      searchCity: 'بحث عن مدينة',
      searchPlaceholder: 'اكتب اسم المدينة...',
      useCurrent: 'استخدام موقعي الحالي',
      audio: 'الصوت',
      adhanSound: 'صوت الأذان',
      sounds: {
        makkah: 'مكة المكرمة',
        madina: 'المدينة المنورة',
        alaqsa: 'المسجد الأقصى',
        beep: 'تنبيه بسيط',
        none: 'بدون صوت',
      },
      audioWarningTitle: 'تنبيه هام',
      audioWarning: 'تمنع بعض المتصفحات تشغيل الصوت تلقائياً. لضمان عمل الأذان، يرجى تجربة الصوت مرة واحدة هنا.',
      offline: 'أنت غير متصل',
      offlineMode: 'وضع عدم الاتصال - يتم عرض البيانات المحفوظة',
      athkar: 'الأذكار',
      calendar: 'التقويم',
      home: 'الرئيسية',
      quran: 'القرآن',
      mosques: 'المساجد',
      morning: 'أذكار الصباح',
      evening: 'أذكار المساء',
      sleep: 'أذكار النوم',
      travel: 'أدعية السفر',
      food: 'أدعية الطعام',
      sadness: 'الهم والحزن',
      playAmbient: 'أصوات الطبيعة',
      stopAmbient: 'إيقاف',
      completed: 'أتممت',
      reset: 'إعادة',
      whiteDays: 'الأيام البيض',
      searchSurah: 'بحث عن سورة...',
      meccan: 'مكية',
      medinan: 'مدنية',
      verses: 'آيات',
      continueReading: 'متابعة القراءة',
      tafseer: 'التفسير الميسر',
      copy: 'نسخ',
      share: 'مشاركة',
      copied: 'تم النسخ',
      nearbyMosques: 'مساجد قريبة',
      distance: 'المسافة',
      aiAssistant: 'المساعد الذكي',
      askAi: 'اسأل الذكاء الاصطناعي',
      askAiPlaceholder: 'اسأل عن الصلاة، القرآن، أو الحديث...',
      aiDisclaimer: 'هذا مساعد ذكاء اصطناعي. يرجى التحقق من المصادر الشرعية.',
      arMode: 'واقع معزز',
      cameraPermission: 'يجب السماح بالوصول للكاميرا',
      facingQibla: 'أنت تواجه القبلة',
      startAR: 'شاهد بالواقع المعزز',
      challenges: 'التحديات والإنجازات',
      badges: 'الأوسمة',
      family: 'عائلتي',
      addFamily: 'إضافة فرد',
      sendDua: 'أرسل دعاء',
      duaSent: 'وصل الدعاء!',
      progress: 'التقدم',
      checkIn: 'تسجيل اليوم',
      claimed: 'مكتمل',
      familyPlaceholder: 'اسم الشخص...',
      timeRemainingFor: 'الوقت المتبقي لصلاة',
      openSettings: 'فتح الإعدادات',
      openChallenges: 'فتح التحديات',
      navHome: 'الذهاب للرئيسية',
      navCalendar: 'الذهاب للتقويم',
      navQuran: 'الذهاب للقرآن',
      navAthkar: 'الذهاب للأذكار',
      close: 'إغلاق',
      masjidMode: 'وضع المسجد',
      masjidModeActive: 'وضع المسجد نشط',
      silencePhone: 'يرجى التأكد من وضع الهاتف على الصامت',
      stop: 'إيقاف',
    },
    challenges: {
      fajr40: { title: 'تحدي الفجر 40 يوماً', desc: 'صلِ الفجر في وقتها لمدة 40 يوماً متتالية.' },
      kahf: { title: 'سورة الكهف', desc: 'قراءة سورة الكهف يوم الجمعة.' },
      fasting: { title: 'صيام الإثنين والخميس', desc: 'إحياء سنة الصيام.' },
      khatma: { title: 'ختمة القرآن', desc: 'ختم القرآن الكريم في شهر.' },
    }
  },
  en: {
    prayers: {
      Fajr: 'Fajr',
      Sunrise: 'Sunrise',
      Dhuhr: 'Dhuhr',
      Asr: 'Asr',
      Maghrib: 'Maghrib',
      Isha: 'Isha',
    },
    common: {
      loading: 'Loading...',
      location: 'Location',
      settings: 'Settings',
      next: 'Next',
      remaining: 'Remaining',
      gregorian: 'Gregorian',
      hijri: 'Hijri',
      qibla: 'Qibla',
      qiblaDesc: 'Direction to Kaaba',
      rotateDevice: 'Rotate device to align arrow',
      relativeToNorth: 'Direction relative to True North',
      notifications: 'App Alerts',
      notificationsDesc: 'In-app adhan sound',
      pushNotifs: 'Push Notifications',
      enablePush: 'Enable Notifications',
      pushEnabled: 'Notifications Active',
      autoLocation: 'Auto (GPS)',
      manualLocation: 'Manual (Map)',
      save: 'Save Settings',
      cancel: 'Cancel',
      general: 'General',
      calculation: 'Calculation',
      adjustments: 'Time Adjustments',
      language: 'Language',
      method: 'Calculation Method',
      madhab: 'Juristic Method',
      shafi: 'Standard (Shafi, Maliki, Hanbali)',
      hanafi: 'Hanafi',
      minutes: 'min',
      pickLocation: 'Select Location',
      searchCity: 'Search City',
      searchPlaceholder: 'Enter city name...',
      useCurrent: 'Use Current Location',
      audio: 'Audio',
      adhanSound: 'Adhan Sound',
      sounds: {
        makkah: 'Makkah',
        madina: 'Madina',
        alaqsa: 'Al-Aqsa',
        beep: 'Beep',
        none: 'Silent',
      },
      audioWarningTitle: 'Important Note',
      audioWarning: 'Browsers often block autoplay. To ensure Adhan works, please test the sound here once.',
      offline: 'You are offline',
      offlineMode: 'Offline Mode - Showing cached data',
      athkar: 'Athkar',
      calendar: 'Calendar',
      home: 'Home',
      quran: 'Quran',
      mosques: 'Mosques',
      morning: 'Morning',
      evening: 'Evening',
      sleep: 'Sleep',
      travel: 'Travel',
      food: 'Food',
      sadness: 'Sadness/Anxiety',
      playAmbient: 'Ambient',
      stopAmbient: 'Stop',
      completed: 'Completed',
      reset: 'Reset',
      whiteDays: 'White Days',
      searchSurah: 'Search Surah...',
      meccan: 'Meccan',
      medinan: 'Medinan',
      verses: 'Verses',
      continueReading: 'Continue Reading',
      tafseer: 'Tafseer',
      copy: 'Copy',
      share: 'Share',
      copied: 'Copied',
      nearbyMosques: 'Nearby Mosques',
      distance: 'Distance',
      aiAssistant: 'AI Assistant',
      askAi: 'Ask AI',
      askAiPlaceholder: 'Ask about Prayer, Quran, or Hadith...',
      aiDisclaimer: 'This is an AI assistant. Please verify with scholars.',
      arMode: 'AR Mode',
      cameraPermission: 'Camera access required',
      facingQibla: 'You are facing Qibla',
      startAR: 'View in AR',
      challenges: 'Challenges & Rewards',
      badges: 'Badges',
      family: 'My Family',
      addFamily: 'Add Member',
      sendDua: 'Send Dua',
      duaSent: 'Dua Sent!',
      progress: 'Progress',
      checkIn: 'Check-in',
      claimed: 'Claimed',
      familyPlaceholder: 'Name...',
      timeRemainingFor: 'Time remaining for',
      openSettings: 'Open Settings',
      openChallenges: 'Open Challenges',
      navHome: 'Go to Home',
      navCalendar: 'Go to Calendar',
      navQuran: 'Go to Quran',
      navAthkar: 'Go to Athkar',
      close: 'Close',
      masjidMode: 'Masjid Mode',
      masjidModeActive: 'Masjid Mode Active',
      silencePhone: 'Please ensure your phone is silent',
      stop: 'Stop',
    },
    challenges: {
      fajr40: { title: '40 Days of Fajr', desc: 'Pray Fajr on time for 40 consecutive days.' },
      kahf: { title: 'Surah Al-Kahf', desc: 'Read Surah Al-Kahf on Fridays.' },
      fasting: { title: 'Mon & Thu Fasting', desc: 'Revive the Sunnah of fasting.' },
      khatma: { title: 'Quran Khatma', desc: 'Complete the Quran in a month.' },
    }
  },
  fr: {
    prayers: {
      Fajr: 'Fajr',
      Sunrise: 'Lever',
      Dhuhr: 'Dhuhr',
      Asr: 'Asr',
      Maghrib: 'Maghrib',
      Isha: 'Isha',
    },
    common: {
      loading: 'Chargement...',
      location: 'Position',
      settings: 'Paramètres',
      next: 'Suivant',
      remaining: 'Restant',
      gregorian: 'Grégorien',
      hijri: 'Hégirien',
      qibla: 'Qibla',
      qiblaDesc: 'Direction de la Kaaba',
      rotateDevice: 'Tournez l\'appareil pour aligner',
      relativeToNorth: 'Par rapport au Nord géographique',
      notifications: 'Alertes App',
      notificationsDesc: 'Son Adhan dans l\'app',
      pushNotifs: 'Notifications Push',
      enablePush: 'Activer Notifications',
      pushEnabled: 'Notifications Actives',
      autoLocation: 'Auto (GPS)',
      manualLocation: 'Manuel (Carte)',
      save: 'Enregistrer',
      cancel: 'Annuler',
      general: 'Général',
      calculation: 'Calcul',
      adjustments: 'Ajustements',
      language: 'Langue',
      method: 'Méthode de calcul',
      madhab: 'Méthode juridique',
      shafi: 'Standard (Shafi, Maliki, Hanbali)',
      hanafi: 'Hanafi',
      minutes: 'min',
      pickLocation: 'Choisir l\'emplacement',
      searchCity: 'Chercher une ville',
      searchPlaceholder: 'Entrez le nom de la ville...',
      useCurrent: 'Utiliser ma position',
      audio: 'Audio',
      adhanSound: 'Son de l\'Adhan',
      sounds: {
        makkah: 'La Mecque',
        madina: 'Médine',
        alaqsa: 'Al-Aqsa',
        beep: 'Bip',
        none: 'Silencieux',
      },
      audioWarningTitle: 'Note Importante',
      audioWarning: 'Les navigateurs bloquent souvent la lecture automatique. Testez le son ici une fois pour activer.',
      offline: 'Hors ligne',
      offlineMode: 'Mode hors ligne - Données en cache',
      athkar: 'Athkar',
      calendar: 'Calendrier',
      home: 'Accueil',
      quran: 'Coran',
      mosques: 'Mosquées',
      morning: 'Matin',
      evening: 'Soir',
      sleep: 'Sommeil',
      travel: 'Voyage',
      food: 'Repas',
      sadness: 'Tristesse',
      playAmbient: 'Ambiance',
      stopAmbient: 'Arrêter',
      completed: 'Terminé',
      reset: 'Réinitialiser',
      whiteDays: 'Jours Blancs',
      searchSurah: 'Chercher...',
      meccan: 'Mecquoise',
      medinan: 'Médinoise',
      verses: 'Versets',
      continueReading: 'Continuer la lecture',
      tafseer: 'Tafsir',
      copy: 'Copier',
      share: 'Partager',
      copied: 'Copié',
      nearbyMosques: 'Mosquées proches',
      distance: 'Distance',
      aiAssistant: 'Assistant IA',
      askAi: 'Demander à l\'IA',
      askAiPlaceholder: 'Question sur la prière, Coran...',
      aiDisclaimer: 'Assistant IA. Vérifiez les sources.',
      arMode: 'Mode AR',
      cameraPermission: 'Accès caméra requis',
      facingQibla: 'Vous êtes face à la Qibla',
      startAR: 'Voir en AR',
      challenges: 'Défis & Récompenses',
      badges: 'Badges',
      family: 'Ma Famille',
      addFamily: 'Ajouter un membre',
      sendDua: 'Envoyer Dua',
      duaSent: 'Dua Envoyé!',
      progress: 'Progrès',
      checkIn: 'Enregistrer',
      claimed: 'Réclamé',
      familyPlaceholder: 'Nom...',
      timeRemainingFor: 'Temps restant pour',
      openSettings: 'Ouvrir les paramètres',
      openChallenges: 'Ouvrir les défis',
      navHome: 'Aller à l\'Accueil',
      navCalendar: 'Aller au Calendrier',
      navQuran: 'Aller au Coran',
      navAthkar: 'Aller aux Athkar',
      close: 'Fermer',
      masjidMode: 'Mode Mosquée',
      masjidModeActive: 'Mode Mosquée Actif',
      silencePhone: 'Veuillez mettre le téléphone en silencieux',
      stop: 'Arrêter',
    },
    challenges: {
      fajr40: { title: '40 Jours de Fajr', desc: 'Priez Fajr à l\'heure pendant 40 jours.' },
      kahf: { title: 'Sourate Al-Kahf', desc: 'Lire Al-Kahf le vendredi.' },
      fasting: { title: 'Jeûne Lun & Jeu', desc: 'Revivre la Sunna du jeûne.' },
      khatma: { title: 'Khatma Coran', desc: 'Terminer le Coran en un mois.' },
    }
  },
};
