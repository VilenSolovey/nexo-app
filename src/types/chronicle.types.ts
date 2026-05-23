import { Timestamp } from 'firebase/firestore'
import type { QuizQuestion } from '@nexo/types/quiz.types'

export type ChronicleChapterStatus = 'locked' | 'active' | 'trial_unlocked' | 'completed'

export type ChronicleChapter = {
  id: string
  title: string
  description: string
  order: number
  isActive: boolean
  trialUnlockRule: {
    requiredUnlockedFragments?: number
    requiredMasteredFragments: number
    minAnsweredQuestions: number
    minAccuracyPercent: number
  }
  createdAt?: Timestamp | number | string | Date | null
  updatedAt?: Timestamp | number | string | Date | null
}

export type ChronicleFragment = {
  id: string
  chapterId: string
  title: string
  subtitle?: string
  year?: string
  shortText: string
  fullText?: string
  order: number
  isSpoiler?: boolean
  createdAt?: Timestamp | number | string | Date | null
  updatedAt?: Timestamp | number | string | Date | null
}

export type ChronicleQuestion = QuizQuestion & {
  chapterId: string
  primaryFragmentId: string
  linkedFragmentIds: string[]
  difficulty: 1 | 2 | 3
  active: boolean
  createdAt?: Timestamp | number | string | Date | null
  updatedAt?: Timestamp | number | string | Date | null
}

export type ChallengeSlotType = 'practice' | 'mistake_review' | 'trial_gate'

export type ChallengeSlot = {
  id: string
  chapterId: string
  title: string
  description?: string
  type: ChallengeSlotType
  targetFragmentIds: string[]
  questionCount: number
  maxAttempts?: number
  opensAt: Timestamp | number | string | Date
  closesAt?: Timestamp | number | string | Date | null
  createdAt?: Timestamp | number | string | Date | null
  updatedAt?: Timestamp | number | string | Date | null
}

export type UserChallengeProgress = {
  id?: string
  userId: string
  chapterId: string
  slotId: string
  quizId: string
  status: 'created' | 'in_progress' | 'completed' | 'archived'
  attemptsUsed: number
  maxAttempts: number
  bestScore?: number
  lastScore?: number
  lastSessionId?: string | null
  createdAt?: Timestamp | number | string | Date | null
  updatedAt?: Timestamp | number | string | Date | null
}

export type QuizRunMode = 'practice' | 'trial' | 'mistake_review'
export type QuizRunStatus = 'active' | 'completed' | 'expired' | 'abandoned'

export type QuizRun = {
  id: string
  userId: string
  chapterId: string
  slotId?: string | null
  mode: QuizRunMode
  questionIds: string[]
  status: QuizRunStatus
  score?: number
  total?: number
  startedAt: Timestamp
  completedAt?: Timestamp | null
}

export type UserQuestionStats = {
  userId: string
  questionId: string
  chapterId: string
  primaryFragmentId: string
  linkedFragmentIds: string[]
  attempts: number
  correct: number
  lastCorrect?: boolean
  lastAnsweredAt?: Timestamp
}

export type UserFragmentProgress = {
  userId: string
  fragmentId: string
  chapterId: string
  answered: number
  correct: number
  accuracyPercent: number
  unlocked: boolean
  mastered: boolean
  updatedAt?: Timestamp
}

export type UserChapterProgress = {
  id?: string
  userId: string
  chapterId: string
  status: ChronicleChapterStatus
  answered: number
  correct: number
  accuracyPercent: number
  unlockedFragments: number
  masteredFragments: number
  trialUnlocked: boolean
  trialCompleted?: boolean
  trialQuizId?: string
  trialScore?: number
  trialBestScore?: number
  trialCompletedAt?: Timestamp | number | string | Date | null
  completed: boolean
  completedAt?: Timestamp | number | string | Date | null
  updatedAt?: Timestamp
}
