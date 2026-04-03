import { Timestamp } from "firebase/firestore"

export type QuizResult = {
  id: string
  userId: string
  quizId: string
  sessionId?: string | null
  completedAt: Timestamp
  score: number
  total: number
  earnedCoins: number
  timeSpent: number
  passed?: boolean
  timeExpired?: boolean
  earnedExp?: number
  leftAppDuringQuiz?: boolean
  backgroundCount?: number
  backgroundDurationMs?: number
}

export type UserQuizProgress = {
  userId: string
  quizId: string
  attempts: number
  passedCount: number  
  officialScore?: number
  officialPassed?: boolean
  bestScore: number    
  completed: boolean    
  rewardClaimed: boolean 
  lastPlayedAt: Timestamp
}
