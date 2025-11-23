
import { Challenge } from "../types";

export const CHALLENGES: Challenge[] = [
  {
    id: 'fajr_40',
    titleKey: 'challenges.fajr40.title',
    descriptionKey: 'challenges.fajr40.desc',
    target: 40,
    unit: 'days',
    icon: '🌅'
  },
  {
    id: 'kahf_friday',
    titleKey: 'challenges.kahf.title',
    descriptionKey: 'challenges.kahf.desc',
    target: 4, // 4 Fridays in a row ideally, or just accumulated
    unit: 'times',
    icon: '📖'
  },
  {
    id: 'fasting_mon_thu',
    titleKey: 'challenges.fasting.title',
    descriptionKey: 'challenges.fasting.desc',
    target: 8,
    unit: 'days',
    icon: '🥣'
  },
  {
    id: 'quran_khatma',
    titleKey: 'challenges.khatma.title',
    descriptionKey: 'challenges.khatma.desc',
    target: 30,
    unit: 'days',
    icon: '🕌'
  }
];
