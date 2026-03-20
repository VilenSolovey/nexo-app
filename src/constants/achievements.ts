import { Theme } from '@nexo/constants/theme'
import type { AchievementCategory, AchievementDefinition } from '@nexo/types/achievement.types'

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  progress: 'Прогрес',
  skill: 'Точність',
  streak: 'Серії',
  mastery: 'Майстерність',
  economy: 'Нагороди',
}

export const ACHIEVEMENT_CATEGORY_ORDER: AchievementCategory[] = [
  'progress',
  'skill',
  'streak',
  'mastery',
  'economy',
]

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'quiz_journey',
    title: 'Шлях дослідника',
    description: 'Завершуйте більше різних квізів і відкривайте нові tier-и',
    category: 'progress',
    metric: 'uniqueQuizzes',
    icon: 'play-circle-outline',
    accentColor: Theme.primary,
    tiers: [
      { id: 'bronze', title: 'Bronze', target: 1, rewardCoins: 2 },
      { id: 'silver', title: 'Silver', target: 5, rewardCoins: 5, rewardExp: 2 },
      { id: 'gold', title: 'Gold', target: 12, rewardCoins: 8, rewardExp: 4 },
    ],
  },
  {
    id: 'quiz_wins',
    title: 'На ходу',
    description: 'Поступово набирайте все більше успішних проходжень',
    category: 'skill',
    metric: 'passedQuizzes',
    icon: 'checkmark-done-outline',
    accentColor: Theme.success,
    tiers: [
      { id: 'bronze', title: 'Bronze', target: 1, rewardCoins: 1 },
      { id: 'silver', title: 'Silver', target: 3, rewardCoins: 4, rewardExp: 2 },
      { id: 'gold', title: 'Gold', target: 10, rewardCoins: 7, rewardExp: 4 },
    ],
  },
  {
    id: 'perfect_scores',
    title: 'Ідеальний результат',
    description: 'Набирайте 100% і піднімайтеся від Bronze до Gold',
    category: 'skill',
    metric: 'perfectScores',
    icon: 'ribbon-outline',
    accentColor: Theme.coin,
    tiers: [
      { id: 'bronze', title: 'Bronze', target: 1, rewardCoins: 2, rewardExp: 1 },
      { id: 'silver', title: 'Silver', target: 3, rewardCoins: 5, rewardExp: 3 },
      { id: 'gold', title: 'Gold', target: 8, rewardCoins: 9, rewardExp: 5 },
    ],
  },
  {
    id: 'streak_keeper',
    title: 'Без пауз',
    description: 'Тримайте серію днів і відкривайте нові streak tier-и',
    category: 'streak',
    metric: 'streakDays',
    icon: 'flame-outline',
    accentColor: Theme.warning,
    tiers: [
      { id: 'bronze', title: 'Bronze', target: 3, rewardCoins: 2 },
      { id: 'silver', title: 'Silver', target: 7, rewardCoins: 5, rewardExp: 2 },
      { id: 'gold', title: 'Gold', target: 14, rewardCoins: 8, rewardExp: 4 },
    ],
  },
  {
    id: 'speed_runner',
    title: 'Швидка реакція',
    description: 'Проходьте квізи швидко і прокачуйте свій темп',
    category: 'skill',
    metric: 'fastPasses',
    icon: 'flash-outline',
    accentColor: Theme.primary,
    tiers: [
      { id: 'bronze', title: 'Bronze', target: 1, rewardCoins: 2 },
      { id: 'silver', title: 'Silver', target: 3, rewardCoins: 4, rewardExp: 2 },
      { id: 'gold', title: 'Gold', target: 10, rewardCoins: 7, rewardExp: 4 },
    ],
  },
  {
    id: 'rank_climber',
    title: 'Новий ранг',
    description: 'Зростайте по рівнях і відкривайте сильніші нагороди',
    category: 'mastery',
    metric: 'level',
    icon: 'school-outline',
    accentColor: Theme.exp,
    tiers: [
      { id: 'bronze', title: 'Bronze', target: 2, rewardCoins: 1, rewardExp: 1 },
      { id: 'silver', title: 'Silver', target: 5, rewardCoins: 4, rewardExp: 3 },
      { id: 'gold', title: 'Gold', target: 10, rewardCoins: 8, rewardExp: 5 },
    ],
  },
  {
    id: 'coin_keeper',
    title: 'Скарбничка',
    description: 'Накопичуйте Nexons і з кожним tier-ом збільшуйте куш',
    category: 'economy',
    metric: 'coins',
    icon: 'cash-outline',
    accentColor: Theme.coin,
    tiers: [
      { id: 'bronze', title: 'Bronze', target: 100, rewardCoins: 1 },
      { id: 'silver', title: 'Silver', target: 250, rewardCoins: 3, rewardExp: 1 },
      { id: 'gold', title: 'Gold', target: 600, rewardCoins: 6, rewardExp: 3 },
    ],
  },
]
