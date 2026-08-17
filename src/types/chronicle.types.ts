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
    requiredCompletedReconstructions?: number
    minAnsweredQuestions: number
    minAccuracyPercent: number
  }
  createdAt?: Timestamp | number | string | Date | null
  updatedAt?: Timestamp | number | string | Date | null
}

export type ChronicleTheoryPage = {
  id: string
  title: string
  body: string
  keyPoints?: string[]
}

export type ChronicleTheory = {
  intro?: string
  screens: ChronicleTheoryPage[]
  recap?: string
  guideBeforeSpark?: string
  sources?: { title: string; url: string }[]
}

export type ChronicleFragment = {
  id: string
  chapterId: string
  title: string
  subtitle?: string
  year?: string
  shortText: string
  fullText?: string
  theory?: ChronicleTheory
  archiveKind?: 'event' | 'person' | 'document' | 'artifact' | 'place'
  archiveDiscovery?: {
    label?: string
    title: string
    summary?: string
  }
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

export type ChronicleReconstructionStage =
  | {
      id: string
      type: 'sequence'
      title: string
      instruction: string
      items: { id: string; title: string; detail?: string }[]
      correctOrder: string[]
      successText: string
    }
  | {
      id: string
      type: 'connections'
      title: string
      instruction: string
      sources: { id: string; title: string; detail?: string }[]
      targets: { id: string; title: string; detail?: string }[]
      correctMatches: Record<string, string>
      successText: string
    }
  | {
      id: string
      type: 'evidence'
      title: string
      instruction: string
      claim: string
      evidence: { id: string; title: string; detail?: string }[]
      correctEvidenceIds: string[]
      successText: string
    }

export type ChronicleReconstruction = {
  id: string
  chapterId: string
  actId?: string
  title: string
  subtitle?: string
  description: string
  order: number
  requiredFragmentIds: string[]
  requiredChallengeSlotIds: string[]
  unlockFragmentIds: string[]
  stages: ChronicleReconstructionStage[]
  caseFile: {
    title: string
    summary: string
  }
  createdAt?: Timestamp | number | string | Date | null
  updatedAt?: Timestamp | number | string | Date | null
}

export type UserReconstructionProgress = {
  id?: string
  userId: string
  chapterId: string
  reconstructionId: string
  status: 'available' | 'in_progress' | 'completed'
  currentStage: number
  mistakes: number
  completedAt?: Timestamp | number | string | Date | null
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
  studyFragmentIds?: string[]
  quizFragmentIds?: string[]
  unlockFragmentIds?: string[]
  passScore?: number
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
  status: 'created' | 'in_progress' | 'retry_ready' | 'completed' | 'archived'
  attemptsUsed: number
  maxAttempts: number
  rerollCount?: number
  previousQuizId?: string | null
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
  id?: string
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
  read?: boolean
  unlocked: boolean
  mastered: boolean
  discoveredAt?: Timestamp | number | string | Date | null
  updatedAt?: Timestamp
}

export type ChroniclePendingDiscovery = {
  fragmentId: string
  readyAt: Timestamp | number | string | Date
  startedAt?: Timestamp | number | string | Date | null
  sourceType: 'spark' | 'reconstruction'
  sourceId: string
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
  completedReconstructions?: number
  requiredCompletedReconstructions?: number
  trialUnlocked: boolean
  trialCompleted?: boolean
  trialQuizId?: string
  trialScore?: number
  trialBestScore?: number
  trialCompletedAt?: Timestamp | number | string | Date | null
  pendingDiscovery?: ChroniclePendingDiscovery
  lastDiscovery?: {
    fragmentId: string
    discoveredAt?: Timestamp | number | string | Date | null
  }
  completed: boolean
  completedAt?: Timestamp | number | string | Date | null
  updatedAt?: Timestamp
}
