import { Timestamp } from "firebase/firestore"

export type QuizResult = {
  id: string
  userId: string
  quizId: string
  completedAt: Timestamp
  score: number
  total: number
  earnedCoins: number
  timeSpent: number
}
