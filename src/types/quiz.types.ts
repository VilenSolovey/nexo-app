export type QuizType = "trial" | "spark"
export type QuizCategory = string 

export type Quiz = {
  id: string
  title: string
  category: QuizCategory
  type: QuizType
  questionsCount: number
  reward: number
  description?: string
  exp?: number
}

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correctOptionIndex: number
  explanation?: string
}

export type NewsItem = Quiz

export type RecentItem = Quiz & {
  completedAt: number
  score: number
  total: number
}

