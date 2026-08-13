import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@nexo/services/firebase'
import { callAuthenticatedFunction } from '@nexo/services/authenticated-function.service'
import type {
  AchievementCategory,
  AchievementDefinition,
  AchievementMetric,
  AchievementTierDefinition,
  AchievementViewModel,
  UserAchievementRecord,
  UserAchievementTierRecord,
} from '@nexo/types/achievement.types'
import type {
  UserChallengeProgress,
  UserChapterProgress,
  UserFragmentProgress,
} from '@nexo/types/chronicle.types'
export { getUserResultsList } from '@nexo/services/result.service'

function normalizeTimestamp(value: unknown): string | number | null {
  if (!value) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const timestamp = value as { toDate: () => Date }
    return timestamp.toDate().toISOString()
  }

  return null
}

function normalizeTierRecord(value: unknown): UserAchievementTierRecord {
  const raw = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}

  return {
    unlockedAt: normalizeTimestamp(raw.unlockedAt),
    claimedAt: normalizeTimestamp(raw.claimedAt),
  }
}

const ACHIEVEMENT_CATEGORIES = new Set<AchievementCategory>([
  'progress',
  'skill',
  'streak',
  'mastery',
  'chronicle',
])
const ACHIEVEMENT_METRICS = new Set<AchievementMetric>([
  'uniqueQuizzes',
  'perfectScores',
  'streakDays',
  'level',
  'completedChronicles',
  'unlockedFragments',
  'mistakesFixed',
  'bestCorrectStreak',
  'masteredChronicles',
  'perfectChallenges',
])

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function normalizeDefinitionTier(value: unknown): AchievementTierDefinition | null {
  const raw = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  const id = asOptionalString(raw.id)
  const title = asOptionalString(raw.title)
  const target = Number(raw.target)
  const rewardCoins = Number(raw.rewardCoins)
  const rewardExp = raw.rewardExp === undefined ? undefined : Number(raw.rewardExp)

  if (!id || !title || !Number.isFinite(target) || target <= 0) return null
  if (!Number.isFinite(rewardCoins) || rewardCoins < 0) return null
  if (rewardExp !== undefined && (!Number.isFinite(rewardExp) || rewardExp < 0)) return null

  return {
    id,
    title,
    target,
    rewardCoins,
    ...(rewardExp !== undefined ? { rewardExp } : {}),
  }
}

function normalizeAchievementDefinition(id: string, data: Record<string, unknown>): AchievementDefinition | null {
  if (data.active === false) return null

  const title = asOptionalString(data.title)
  const description = asOptionalString(data.description)
  const category = asOptionalString(data.category)
  const metric = asOptionalString(data.metric)
  const icon = asOptionalString(data.icon)
  const tiers = Array.isArray(data.tiers)
    ? data.tiers
        .map(normalizeDefinitionTier)
        .filter((tier): tier is AchievementTierDefinition => tier !== null)
    : []

  if (
    !title ||
    !description ||
    !category ||
    !metric ||
    !icon ||
    !ACHIEVEMENT_CATEGORIES.has(category as AchievementCategory) ||
    !ACHIEVEMENT_METRICS.has(metric as AchievementMetric) ||
    tiers.length === 0
  ) {
    return null
  }

  const order = Number(data.order)

  return {
    id,
    title,
    description,
    category: category as AchievementCategory,
    metric: metric as AchievementMetric,
    icon,
    accentColor: asOptionalString(data.accentColor),
    active: data.active !== false,
    order: Number.isFinite(order) ? order : undefined,
    tiers,
  }
}

type ClaimAchievementRewardResponse = {
  achievementId: string
  tierId: string
  rewardCoins: number
  rewardExp: number
  coins: number
  exp: number
  level: number
}

export async function getAchievementDefinitions(): Promise<AchievementDefinition[]> {
  const snap = await getDocs(collection(db, 'achievementDefinitions'))

  return snap.docs
    .map((item) => normalizeAchievementDefinition(item.id, item.data()))
    .filter((definition): definition is AchievementDefinition => definition !== null)
    .sort(
      (left, right) =>
        Number(left.order ?? Number.MAX_SAFE_INTEGER) -
          Number(right.order ?? Number.MAX_SAFE_INTEGER) ||
        left.title.localeCompare(right.title),
    )
}

export async function getUserAchievementRecords(userId: string): Promise<UserAchievementRecord[]> {
  const snap = await getDocs(collection(db, 'users', userId, 'achievements'))

  return snap.docs.map((item) => {
    const data = item.data()
    const rawTiers =
      typeof data.tiers === 'object' && data.tiers !== null
        ? (data.tiers as Record<string, unknown>)
        : {}

    const tiers = Object.fromEntries(
      Object.entries(rawTiers).map(([tierId, tierData]) => [tierId, normalizeTierRecord(tierData)]),
    )

    return {
      achievementId: String(data.achievementId ?? item.id),
      highestUnlockedTier: Number(data.highestUnlockedTier ?? -1),
      highestClaimedTier: Number(data.highestClaimedTier ?? -1),
      tiers,
      updatedAt: normalizeTimestamp(data.updatedAt),
    }
  })
}

export async function getUserAchievementChapterProgressList(
  userId: string,
): Promise<UserChapterProgress[]> {
  const q = query(collection(db, 'userChapterProgress'), where('userId', '==', userId))
  const snap = await getDocs(q)

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as unknown as UserChapterProgress[]
}

export async function getUserAchievementFragmentProgressList(
  userId: string,
): Promise<UserFragmentProgress[]> {
  const q = query(collection(db, 'userFragmentProgress'), where('userId', '==', userId))
  const snap = await getDocs(q)

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as unknown as UserFragmentProgress[]
}

export async function getUserAchievementChallengeProgressList(
  userId: string,
): Promise<UserChallengeProgress[]> {
  const q = query(collection(db, 'userChallengeProgress'), where('userId', '==', userId))
  const snap = await getDocs(q)

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as unknown as UserChallengeProgress[]
}

export async function syncUnlockedAchievements(
  userId: string,
  achievements: AchievementViewModel[],
  existingRecords: UserAchievementRecord[] = [],
) {
  void userId
  void achievements
  void existingRecords

  await callAuthenticatedFunction<Record<string, never>, unknown>('syncAchievementsHttp', {})
}

export async function claimAchievementReward(userId: string, achievementId: string, tierId: string) {
  void userId

  return callAuthenticatedFunction<
    { achievementId: string; tierId: string },
    ClaimAchievementRewardResponse
  >('claimAchievementRewardHttp', { achievementId, tierId })
}
