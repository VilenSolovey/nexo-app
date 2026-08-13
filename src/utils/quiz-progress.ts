import type { UserQuizProgress } from '@nexo/types/result.types'

type TimestampLike =
  | { seconds: number; nanoseconds?: number }
  | Date
  | number
  | string
  | null
  | undefined

export const MAX_QUIZ_ATTEMPTS = 3
export const PERFECT_QUIZ_SCORE = 100

export function getQuizMaxAttempts(maxAttempts?: number | null): number {
  if (typeof maxAttempts !== 'number' || !Number.isFinite(maxAttempts)) {
    return MAX_QUIZ_ATTEMPTS
  }

  return Math.max(1, Math.floor(maxAttempts))
}

export function getQuizRewardMultiplier(attemptNumber: number): number {
  if (attemptNumber <= 1) return 1
  if (attemptNumber === 2) return 0.5
  if (attemptNumber === 3) return 0.25
  return 0
}

export function isQuizCompleted(attempts: number, bestScore = 0, maxAttempts?: number | null): boolean {
  return attempts >= getQuizMaxAttempts(maxAttempts) || bestScore >= PERFECT_QUIZ_SCORE
}

export function isQuizProgressCompleted(
  progress: UserQuizProgress | null | undefined,
  maxAttempts?: number | null,
): boolean {
  if (!progress) return false

  const bestScore = Math.max(progress.bestScore ?? 0, progress.officialScore ?? 0)
  return Boolean(progress.completed) || isQuizCompleted(progress.attempts ?? 0, bestScore, maxAttempts)
}

export function canStartQuiz(
  progress: UserQuizProgress | null | undefined,
  maxAttempts?: number | null,
): boolean {
  return !isQuizProgressCompleted(progress, maxAttempts)
}

export function toMillis(value: TimestampLike): number | null {
  if (!value) return null

  if (typeof value === 'number') {
    return value > 1_000_000_000_000 ? value : value * 1000
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? null : parsed
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') {
    return value.seconds * 1000
  }

  return null
}
