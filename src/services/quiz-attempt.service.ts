import { callAuthenticatedFunction } from '@nexo/services/authenticated-function.service'
import type { ChronicleProgressionOutcome } from '@nexo/services/chronicle-quiz.service'

export type ActivateQuizPowerUpInput = {
  sessionId: string
  quizId: string
  powerUpId: string
  questionId?: string
}

export type FinalizeQuizAttemptInput = {
  quizId: string
  sessionId: string
  answers: Record<string, unknown>
  timeExpired?: boolean
  quitEarly?: boolean
  timeSpent: number
  backgroundCount: number
  backgroundDurationMs: number
}

export type FinalizedQuizAttempt = {
  quizId: string
  sessionId: string
  source: string | null
  correctCount: number
  totalCount: number
  percentage: number
  passed: boolean
  attempt: number
  maxAttempts: number
  mastered: boolean
  canRetake: boolean
  rewardMultiplier: number
  coinsBoostMultiplier: number
  expBoostMultiplier: number
  baseCoins: number
  baseExp: number
  earnedCoins: number
  earnedExp: number
  chronicleOutcome?: ChronicleProgressionOutcome
}

export function activateQuizPowerUp(input: ActivateQuizPowerUpInput) {
  return callAuthenticatedFunction<
    ActivateQuizPowerUpInput,
    { powerUpId: string; alreadyActivated: boolean }
  >('activateQuizPowerUpHttp', input)
}

export function finalizeQuizAttempt(input: FinalizeQuizAttemptInput) {
  return callAuthenticatedFunction<FinalizeQuizAttemptInput, FinalizedQuizAttempt>(
    'finalizeQuizAttemptHttp',
    input,
  )
}
