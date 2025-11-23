
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { fetchSurahList, fetchSurahDetails, fetchTafseer } from '../services/api';
import { Surah, SurahDetails } from '../types';
import { Search, ChevronLeft, ChevronRight, Bookmark, BookOpen, X, Copy, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuranView: React.FC = () => {
  const { t, isRTL, settings, updateSettings } = useSettings();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<SurahDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'read'>('list');
  
  // Tafseer Modal State
  const [selectedAyah, setSelectedAyah] = useState<{text: string, number: number} | null>(null);
  const [tafseerText, setTafseerText] = useState<string>('');
  const [loadingTafseer, setLoadingTafseer] = useState(false);
  const [copiedTafseer, setCopiedTafseer] = useState(false);

  // Load Surah List
  useEffect(() => {
    const load = async () => {
      const list = await fetchSurahList(settings.language === 'en' ? 'en' : 'ar');
      setSurahs(list);
      setFilteredSurahs(list);
    };
    load();
  }, [settings.language]);

  // Filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSurahs(surahs);
    } else {
      const lower = searchQuery.toLowerCase();
      setFilteredSurahs(surahs.filter(s => 
        s.name.includes(searchQuery) || 
        s.englishName.toLowerCase().includes(lower) || 
        String(s.number).includes(searchQuery)
      ));
    }
  }, [searchQuery, surahs]);

  // Load Last Read if exists
  useEffect(() => {
    if (settings.lastReadSurah && viewMode === 'list') {
       // Just indicator in header
    }
  }, []);

  const openSurah = async (number: number) => {
    setLoading(true);
    try {
      const details = await fetchSurahDetails(number);
      setSelectedSurah(details);
      setViewMode('read');
      updateSettings({ lastReadSurah: number });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const backToList = () => {
    setViewMode('list');
    setSelectedSurah(null);
  };

  const handleAyahClick = async (ayahText: string, ayahNumber: number) => {
    setSelectedAyah({ text: ayahText, number: ayahNumber });
    setLoadingTafseer(true);
    setTafseerText('');
    if (selectedSurah) {
       const tafseer = await fetchTafseer(selectedSurah.number, ayahNumber);
       setTafseerText(tafseer || 'Tafseer unavailable');
    }
    setLoadingTafseer(false);
  };

  const closeTafseer = () => {
    setSelectedAyah(null);
    setCopiedTafseer(false);
  };

  const copyTafseer = () => {
    if (selectedAyah && tafseerText) {
      const fullText = `${selectedAyah.text}\n\nالتفسير: ${tafseerText}`;
      navigator.clipboard.writeText(fullText);
      setCopiedTafseer(true);
      setTimeout(() => setCopiedTafseer(false), 2000);
    }
  };

  return (
    <motion.div 
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -20 }}
       className="pb-24 min-h-screen relative"
    >
      {viewMode === 'list' ? (
        <>
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-dark/95 backdrop-blur-md z-10 py-4 border-b border-zinc-800/50">
            <h2 className="text-2xl font-bold text-neon flex items-center gap-2">
               <BookOpen className="w-6 h-6" />
               {t('common.quran')}
            </h2>
            {settings.lastReadSurah && (
              <button 
                onClick={() => openSurah(settings.lastReadSurah!)}
                className="text-xs bg-neon/10 text-neon px-3 py-1 rounded-full border border-neon/30 flex items-center gap-1"
              >
                <Bookmark className="w-3 h-3" />
                {t('common.continueReading')}
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.searchSurah')}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 pl-10 text-white focus:border-neon focus:outline-none"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
          </div>

          {/* List */}
          <div className="space-y-2">
            {filteredSurahs.map((s) => (
              <motion.div 
                key={s.number}
                layoutId={`surah-${s.number}`}
                onClick={() => openSurah(s.number)}
                className="bg-card border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:border-neon/50 hover:bg-zinc-900 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-mono text-neon font-bold border border-zinc-700">
                    {s.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg font-quran">{s.name}</h3>
                    <p className="text-xs text-zinc-500">{s.englishName}</p>
                  </div>
                </div>
                <div className="text-right">
                   <span className={`text-[10px] px-2 py-0.5 rounded-full border ${s.revelationType === 'Meccan' ? 'border-amber-500/30 text-amber-500' : 'border-green-500/30 text-green-500'}`}>
                     {s.revelationType === 'Meccan' ? t('common.meccan') : t('common.medinan')}
                   </span>
                   <p className="text-xs text-zinc-500 mt-1">{s.numberOfAyahs} {t('common.verses')}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        // Reading View
        <div className="relative">
          {/* Reading Header */}
          <div className="sticky top-16 z-20 flex items-center justify-between bg-dark/95 backdrop-blur-md py-3 border-b border-zinc-800 mb-6 -mx-2 px-4 shadow-lg">
             <button onClick={backToList} className="p-2 hover:bg-zinc-800 rounded-full">
                {isRTL ? <ChevronRight /> : <ChevronLeft />}
             </button>
             <div className="text-center">
                <h2 className="font-bold text-neon font-quran text-xl">{selectedSurah?.name}</h2>
                <p className="text-xs text-zinc-500">{selectedSurah?.englishName}</p>
             </div>
             <div className="w-8"></div> {/* Spacer */}
          </div>

          {loading ? (
             <div className="text-center py-20 animate-pulse text-neon">{t('common.loading')}</div>
          ) : (
             <div className="space-y-8 px-2">
                {/* Bismillah if not Surah 1 or 9 */}
                {selectedSurah?.number !== 1 && selectedSurah?.number !== 9 && (
                  <div className="text-center text-2xl font-quran text-white/80 mb-8">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </div>
                )}
                
                <div className="font-quran text-2xl md:text-3xl text-justify leading-[2.5] md:leading-[2.5] text-white" dir="rtl">
                  {selectedSurah?.ayahs.map((ayah) => {
                     const text = ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
                     return (
                        <span 
                          key={ayah.number} 
                          className="inline cursor-pointer hover:bg-zinc-800/50 hover:text-neon transition-colors rounded px-1"
                          onClick={() => handleAyahClick(text, ayah.numberInSurah)}
                        >
                          {text} 
                           <span className="inline-flex items-center justify-center w-8 h-8 mx-1 bg-zinc-900 border border-neon/30 rounded-full text-sm text-neon align-middle font-sans number-font select-none">
                             {ayah.numberInSurah}
                           </span>
                        </span>
                     );
                  })}
                </div>

                <div className="pt-10 text-center">
                   <button onClick={backToList} className="text-zinc-500 text-sm hover:text-neon">
                      {t('common.completed')}
                   </button>
                </div>
             </div>
          )}
        </div>
      )}

      {/* Tafseer Modal */}
      <AnimatePresence>
        {selectedAyah && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={closeTafseer}
          >
            <motion.div 
               initial={{ y: 100 }}
               animate={{ y: 0 }}
               exit={{ y: 100 }}
               onClick={(e) => e.stopPropagation()}
               className="bg-card w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden"
            >
               <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                  <h3 className="text-neon font-bold">{t('common.tafseer')}</h3>
                  <button onClick={closeTafseer}><X className="w-5 h-5 text-zinc-400" /></button>
               </div>
               
               <div className="p-6 max-h-[60vh] overflow-y-auto">
                  <p className="font-quran text-xl text-white mb-6 text-center leading-loose border-b border-zinc-800/50 pb-4">
                    {selectedAyah.text}
                  </p>
                  
                  {loadingTafseer ? (
                    <div className="text-center text-zinc-500 py-4">{t('common.loading')}</div>
                  ) : (
                    <p className="text-zinc-300 text-justify leading-relaxed text-lg">
                      {tafseerText}
                    </p>
                  )}
               </div>

               <div className="p-4 border-t border-zinc-800 flex gap-3 bg-zinc-900/30">
                  <button 
                    onClick={copyTafseer}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedTafseer ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    {copiedTafseer ? t('common.copied') : t('common.copy')}
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default QuranView;
