import type { UserQuizProgress } from '@nexo/types/result.types'

type TimestampLike =
  | { seconds: number; nanoseconds?: number }
  | Date
  | number
  | string
  | null
  | undefined

export const MAX_QUIZ_ATTEMPTS = 3
export const QUIZ_BECOMES_RECENT_AFTER_MS = 3 * 24 * 60 * 60 * 1000

export function getQuizRewardMultiplier(attemptNumber: number): number {
  if (attemptNumber <= 1) return 1
  if (attemptNumber === 2) return 0.5
  if (attemptNumber === 3) return 0.25
  return 0
}

export function isQuizCompleted(attempts: number, passed = false): boolean {
  return passed || attempts >= MAX_QUIZ_ATTEMPTS
}

export function hasPassedQuiz(progress: UserQuizProgress | null | undefined): boolean {
  if (!progress) return false

  return Boolean(
    progress.officialPassed ||
      (progress.passedCount ?? 0) > 0 ||
      (progress.bestScore ?? 0) >= 100,
  )
}

export function isQuizProgressCompleted(progress: UserQuizProgress | null | undefined): boolean {
  if (!progress) return false

  if (progress.completed) {
    return true
  }

  return isQuizCompleted(progress.attempts ?? 0, hasPassedQuiz(progress))
}

export function canStartQuiz(progress: UserQuizProgress | null | undefined): boolean {
  return !isQuizProgressCompleted(progress)
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

export function isQuizRecent(params: {
  progress?: UserQuizProgress | null
  createdAt?: TimestampLike
  now?: number
}): boolean {
  const { progress, createdAt, now = Date.now() } = params

  if (isQuizProgressCompleted(progress)) {
    return true
  }

  const createdAtMs = toMillis(createdAt)
  if (createdAtMs === null) {
    return false
  }

  return now - createdAtMs >= QUIZ_BECOMES_RECENT_AFTER_MS
}
