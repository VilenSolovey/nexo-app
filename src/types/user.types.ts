export type CompletedQuiz = {
  quizId: string
  completedAt: number
  score?: number
  rewardEarned?: number
}

export interface UserProfile {
  id: string
  email: string
  displayName: string
  coins: number
  consumables?: Record<string, number>
  exp: number
  level: number
  streak: number
  streakDays?: number
  uid?: string
  completedQuizzes?: CompletedQuiz[]
  achievements?: string[]
  inventory?: string[]
  selectedThemeId?: string | null
  selectedAvatarId?: string | null
  createdAt?: string
  lastActiveDate?: string
  longestStreak?: number
  stats?: {
    mistakesFixed?: number
    bestCorrectStreak?: number
  }
  mistakesFixed?: number
  bestCorrectStreak?: number
}
