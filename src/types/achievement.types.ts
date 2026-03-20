export type AchievementCategory =
  | 'progress'
  | 'skill'
  | 'streak'
  | 'mastery'
  | 'economy'

export type AchievementMetric =
  | 'uniqueQuizzes'
  | 'passedQuizzes'
  | 'perfectScores'
  | 'bestScore'
  | 'streakDays'
  | 'masteredQuizzes'
  | 'level'
  | 'coins'
  | 'fastPasses'

export interface AchievementTierDefinition {
  id: string
  title: string
  target: number
  rewardCoins: number
  rewardExp?: number
}

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  category: AchievementCategory
  metric: AchievementMetric
  icon: string
  accentColor?: string
  tiers: AchievementTierDefinition[]
}

export interface UserAchievementTierRecord {
  unlockedAt: string | number | null
  claimedAt: string | number | null
}

export interface UserAchievementRecord {
  achievementId: string
  highestUnlockedTier: number
  highestClaimedTier: number
  tiers: Record<string, UserAchievementTierRecord>
  updatedAt?: string | number | null
}

export interface AchievementTierViewModel extends AchievementTierDefinition {
  index: number
  progress: number
  unlocked: boolean
  claimed: boolean
  unlockedAt: string | number | null
  claimedAt: string | number | null
}

export interface AchievementViewModel extends AchievementDefinition {
  current: number
  unlocked: boolean
  completed: boolean
  highestUnlockedTier: number
  highestClaimedTier: number
  unlockedTierCount: number
  claimedTierCount: number
  totalTiers: number
  completionRate: number
  progressToNext: number
  tiers: AchievementTierViewModel[]
  nextTier: AchievementTierViewModel | null
  claimableTier: AchievementTierViewModel | null
}
