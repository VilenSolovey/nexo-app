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

export function isQuizCompleted(attempts: number): boolean {
  return attempts >= MAX_QUIZ_ATTEMPTS
}

export function canStartQuiz(progress: UserQuizProgress | null | undefined): boolean {
  return !isQuizCompleted(progress?.attempts ?? 0)
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

  if (isQuizCompleted(progress?.attempts ?? 0)) {
    return true
  }

  const createdAtMs = toMillis(createdAt)
  if (createdAtMs === null) {
    return false
  }

  return now - createdAtMs >= QUIZ_BECOMES_RECENT_AFTER_MS
}
