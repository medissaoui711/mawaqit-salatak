import React, { useState, useEffect } from 'react';
import { X, Trophy, Star, CheckCircle, Users, Plus, Heart } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { CHALLENGES } from '../utils/gamificationData';
import { FamilyMember, UserProgress } from '../types';
import { motion } from 'framer-motion';

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChallengesModal: React.FC<ChallengesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useSettings();
  const [activeTab, setActiveTab] = useState<'challenges' | 'family'>('challenges');
  
  const [progress, setProgress] = useState<UserProgress>(() => JSON.parse(localStorage.getItem('mawaqit_progress') || '{"challenges":{},"badges":[],"streak":0,"lastCheckIn":""}'));
  const [family, setFamily] = useState<FamilyMember[]>(() => JSON.parse(localStorage.getItem('mawaqit_family') || '[]'));
  
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => localStorage.setItem('mawaqit_progress', JSON.stringify(progress)), [progress]);
  useEffect(() => localStorage.setItem('mawaqit_family', JSON.stringify(family)), [family]);

  const handleCheckIn = (challengeId: string) => {
    setProgress(prev => {
      const currentVal = prev.challenges[challengeId] || 0;
      const challenge = CHALLENGES.find(c => c.id === challengeId);
      if (!challenge || currentVal >= challenge.target) return prev;
      const newVal = currentVal + 1;
      const newBadges = (newVal === challenge.target && !prev.badges.includes(challengeId)) ? [...prev.badges, challengeId] : prev.badges;
      return { ...prev, challenges: { ...prev.challenges, [challengeId]: newVal }, badges: newBadges };
    });
  };

  const handleAddFamily = () => {
    if (!newMemberName.trim()) return;
    setFamily(prev => [...prev, { id: Date.now().toString(), name: newMemberName }]);
    setNewMemberName('');
  };

  const handleSendDua = (id: string) => {
    const btn = document.getElementById(`dua-btn-${id}`);
    if (!btn) return;
    const originalText = btn.innerText;
    btn.innerText = t('common.duaSent');
    btn.classList.add('bg-green-500', 'text-white');
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove('bg-green-500', 'text-white');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" aria-modal="true" role="dialog">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card border border-zinc-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-neon flex items-center gap-2"><Trophy className="w-6 h-6" />{t('common.challenges')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400" aria-label={t('common.close')}><X className="w-5 h-5" /></button>
        </div>
        <div className="flex p-2 gap-2 border-b border-zinc-800 bg-zinc-900/50">
          <button onClick={() => setActiveTab('challenges')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'challenges' ? 'bg-neon text-black' : 'text-zinc-400 hover:bg-zinc-800'}`}>{t('common.challenges')}</button>
          <button onClick={() => setActiveTab('family')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'family' ? 'bg-neon text-black' : 'text-zinc-400 hover:bg-zinc-800'}`}>{t('common.family')}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {activeTab === 'challenges' ? (
            <div className="space-y-4">
              <div className="mb-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                <h3 className="text-sm text-zinc-400 font-bold mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" />{t('common.badges')}</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">{CHALLENGES.map(c => <div key={c.id} className={`flex flex-col items-center min-w-[60px] opacity-${progress.badges.includes(c.id) ? '100' : '30 grayscale'}`}><div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shadow-lg">{c.icon}</div></div>)}</div>
              </div>
              {CHALLENGES.map(c => {
                const current = progress.challenges[c.id] || 0;
                const isCompleted = current >= c.target;
                return (
                  <div key={c.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3"><span className="text-2xl">{c.icon}</span><div><h4 className="font-bold text-white text-sm">{t(c.titleKey)}</h4><p className="text-xs text-zinc-500">{t(c.descriptionKey)}</p></div></div>
                      <span className="text-xs font-mono text-neon">{current}/{c.target}</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3"><div className="h-full bg-neon transition-all duration-500" style={{ width: `${(current / c.target) * 100}%` }}></div></div>
                    <button onClick={() => handleCheckIn(c.id)} disabled={isCompleted} className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${isCompleted ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-zinc-800 hover:bg-zinc-700 text-white hover:text-neon'}`}>{isCompleted ? <><CheckCircle className="w-3 h-3" /> {t('common.claimed')}</> : t('common.checkIn')}</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder={t('common.familyPlaceholder')} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm text-white focus:border-neon outline-none" />
                <button onClick={handleAddFamily} className="bg-neon text-black p-3 rounded-xl hover:bg-[#42e03c]" aria-label={t('common.addFamily')}><Plus className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                {family.length === 0 && <div className="text-center text-zinc-500 py-10 flex flex-col items-center gap-3"><Users className="w-10 h-10 opacity-20" /><p className="text-sm">{t('common.addFamily')}</p></div>}
                {family.map(member => <div key={member.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-neon font-bold">{member.name.charAt(0)}</div><span className="font-bold text-white">{member.name}</span></div><button id={`dua-btn-${member.id}`} onClick={() => handleSendDua(member.id)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-all"><Heart className="w-3 h-3" />{t('common.sendDua')}</button></div>)}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default ChallengesModal;
