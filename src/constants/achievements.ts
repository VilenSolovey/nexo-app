import type { AchievementCategory } from '@nexo/types/achievement.types'

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  progress: 'Прогрес',
  skill: 'Точність',
  streak: 'Серії',
  mastery: 'Майстерність',
  chronicle: 'Хроніки',
}

export const ACHIEVEMENT_CATEGORY_ORDER: AchievementCategory[] = [
  'progress',
  'chronicle',
  'skill',
  'streak',
  'mastery',
]
