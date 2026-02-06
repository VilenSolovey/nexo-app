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
  exp: number
  level: number
  streak: number
  streakDays?: number
  uid?: string
  completedQuizzes?: CompletedQuiz[]
  achievements?: string[]
  inventory?: string[]
  createdAt?: string
}
