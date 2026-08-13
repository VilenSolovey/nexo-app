import type { UserProfile, CompletedQuiz } from '@nexo/types/user.types'
import { getLevelFromExp } from '@nexo/utils/level'

type UserProfileFallback = {
  displayName?: string | null
  email?: string | null
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : []
}

function normalizeNumberMap(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [key, Number(entryValue ?? 0)]),
  )
}

function normalizeCompletedQuizzes(value: unknown): CompletedQuiz[] {
  if (!Array.isArray(value)) return []

  return value.map((item) => {
    const entry = typeof item === 'object' && item !== null
      ? item as Record<string, unknown>
      : {}

    return {
      quizId: String(entry.quizId ?? entry.id ?? ''),
      completedAt: Number(entry.completedAt ?? 0),
      score: typeof entry.score === 'number' ? entry.score : undefined,
      rewardEarned: typeof entry.rewardEarned === 'number' ? entry.rewardEarned : undefined,
    }
  })
}

export function normalizeUserProfile(
  uid: string,
  raw: Record<string, unknown>,
  fallback: UserProfileFallback = {},
): UserProfile {
  const storedDisplayName = normalizeString(raw.displayName)
  const legacyName = normalizeString(raw.name)
  const fallbackDisplayName = normalizeString(fallback.displayName)
  const storedEmail = normalizeString(raw.email)
  const fallbackEmail = normalizeString(fallback.email)
  const email = storedEmail || fallbackEmail
  const emailName = email.includes('@') ? email.split('@')[0] : ''
  const exp = Number(raw.exp ?? 0)
  const streak = Number(raw.streak ?? raw.streakDays ?? 0)
  const streakDays = Number(raw.streakDays ?? raw.streak ?? 0)
  const stats = typeof raw.stats === 'object' && raw.stats !== null
    ? raw.stats as Record<string, unknown>
    : null

  return {
    ...(raw as unknown as UserProfile),
    id: uid,
    uid,
    displayName: storedDisplayName || legacyName || fallbackDisplayName || emailName || 'Гравець',
    email,
    coins: Number(raw.coins ?? 0),
    consumables: normalizeNumberMap(raw.consumables),
    exp,
    level: getLevelFromExp(exp),
    streak,
    streakDays,
    lastActiveDate: normalizeString(raw.lastActiveDate) || undefined,
    longestStreak: Number(raw.longestStreak ?? streakDays ?? streak),
    stats: stats
      ? {
          mistakesFixed: Number(stats.mistakesFixed ?? 0),
          bestCorrectStreak: Number(stats.bestCorrectStreak ?? 0),
        }
      : undefined,
    mistakesFixed: Number(raw.mistakesFixed ?? stats?.mistakesFixed ?? 0),
    bestCorrectStreak: Number(raw.bestCorrectStreak ?? stats?.bestCorrectStreak ?? 0),
    completedQuizzes: normalizeCompletedQuizzes(raw.completedQuizzes),
    achievements: normalizeStringArray(raw.achievements),
    inventory: normalizeStringArray(raw.inventory),
    selectedThemeId: typeof raw.selectedThemeId === 'string' ? raw.selectedThemeId : null,
    selectedAvatarId: typeof raw.selectedAvatarId === 'string' ? raw.selectedAvatarId : null,
    nestorIntroSeenAt: normalizeString(raw.nestorIntroSeenAt) || undefined,
    nestorIntroVersion: typeof raw.nestorIntroVersion === 'number' ? raw.nestorIntroVersion : undefined,
  }
}
