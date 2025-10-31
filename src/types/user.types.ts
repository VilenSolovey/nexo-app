export type CompletedQuiz = {
  quizId: string
  completedAt: number
  score?: number
  rewardEarned?: number
}

export type User = {
  id: string
  name: string
  coins: number
  streakDays: number
  level: number
  completedQuizzes: CompletedQuiz[]
}
