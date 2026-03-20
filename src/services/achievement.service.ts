import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { ACHIEVEMENTS } from '@nexo/constants/achievements'
import { db } from '@nexo/services/firebase'
import type {
  AchievementViewModel,
  UserAchievementRecord,
  UserAchievementTierRecord,
} from '@nexo/types/achievement.types'
import type { QuizResult } from '@nexo/types/result.types'
import { getLevelFromExp } from '@nexo/utils/level'

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

function getAchievementDefinition(achievementId: string) {
  return ACHIEVEMENTS.find((item) => item.id === achievementId) ?? null
}

export async function getUserResultsList(userId: string): Promise<QuizResult[]> {
  const q = query(
    collection(db, 'results'),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc'),
  )

  const snap = await getDocs(q)

  return snap.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<QuizResult, 'id'>),
  }))
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

export async function syncUnlockedAchievements(
  userId: string,
  achievements: AchievementViewModel[],
  existingRecords: UserAchievementRecord[] = [],
) {
  const existingMap = new Map(existingRecords.map((item) => [item.achievementId, item]))
  const batch = writeBatch(db)
  let hasWrites = false

  achievements.forEach((achievement) => {
    const currentRecord = existingMap.get(achievement.id)
    const pendingTiers = achievement.tiers.filter(
      (tier) => tier.unlocked && !currentRecord?.tiers?.[tier.id]?.unlockedAt,
    )

    const nextHighestUnlockedTier = Math.max(
      currentRecord?.highestUnlockedTier ?? -1,
      achievement.highestUnlockedTier,
    )

    if (
      pendingTiers.length === 0 &&
      nextHighestUnlockedTier <= (currentRecord?.highestUnlockedTier ?? -1)
    ) {
      return
    }

    const tiersPayload = pendingTiers.reduce<Record<string, { unlockedAt: unknown; claimedAt: unknown }>>(
      (acc, tier) => {
        acc[tier.id] = {
          unlockedAt: serverTimestamp(),
          claimedAt: currentRecord?.tiers?.[tier.id]?.claimedAt ?? null,
        }
        return acc
      },
      {},
    )

    batch.set(
      doc(db, 'users', userId, 'achievements', achievement.id),
      {
        achievementId: achievement.id,
        highestUnlockedTier: nextHighestUnlockedTier,
        highestClaimedTier: currentRecord?.highestClaimedTier ?? -1,
        tiers: tiersPayload,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    hasWrites = true
  })

  if (!hasWrites) return

  await batch.commit()
}

export async function claimAchievementReward(userId: string, achievementId: string, tierId: string) {
  const achievement = getAchievementDefinition(achievementId)

  if (!achievement) {
    throw new Error('Achievement definition not found')
  }

  const tierIndex = achievement.tiers.findIndex((tier) => tier.id === tierId)
  const tierDefinition = achievement.tiers[tierIndex]

  if (tierIndex < 0 || !tierDefinition) {
    throw new Error('Achievement tier not found')
  }

  return runTransaction(db, async (transaction) => {
    const achievementRef = doc(db, 'users', userId, 'achievements', achievementId)
    const userRef = doc(db, 'users', userId)
    const achievementSnap = await transaction.get(achievementRef)
    const userSnap = await transaction.get(userRef)

    if (!userSnap.exists()) {
      throw new Error('User profile not found')
    }

    if (!achievementSnap.exists()) {
      throw new Error('Achievement is not unlocked yet')
    }

    const raw = achievementSnap.data()
    const rawTiers =
      typeof raw.tiers === 'object' && raw.tiers !== null
        ? (raw.tiers as Record<string, unknown>)
        : {}
    const tiers = Object.fromEntries(
      Object.entries(rawTiers).map(([key, value]) => [key, normalizeTierRecord(value)]),
    ) as Record<string, UserAchievementTierRecord>
    const requestedTier = tiers[tierId]

    if (!requestedTier?.unlockedAt) {
      throw new Error('Tier is not unlocked yet')
    }

    if (requestedTier.claimedAt) {
      throw new Error('Reward already claimed')
    }

    const firstUnclaimedTierId =
      achievement.tiers.find((tier) => tiers[tier.id]?.unlockedAt && !tiers[tier.id]?.claimedAt)?.id ?? null

    if (firstUnclaimedTierId !== tierId) {
      throw new Error('Claim previous unlocked tier first')
    }

    transaction.set(
      achievementRef,
      {
        highestClaimedTier: Math.max(Number(raw.highestClaimedTier ?? -1), tierIndex),
        updatedAt: serverTimestamp(),
        tiers: {
          [tierId]: {
            unlockedAt: requestedTier.unlockedAt,
            claimedAt: serverTimestamp(),
          },
        },
      },
      { merge: true },
    )

    const userData = userSnap.data()
    const currentCoins = Number(userData.coins ?? 0)
    const currentExp = Number(userData.exp ?? 0)
    const nextCoins = Math.max(0, currentCoins + tierDefinition.rewardCoins)
    const nextExp = Math.max(0, currentExp + (tierDefinition.rewardExp ?? 0))
    const nextLevel = getLevelFromExp(nextExp)

    transaction.update(userRef, {
      coins: nextCoins,
      exp: nextExp,
      level: nextLevel,
    })

    return {
      achievementId,
      tierId,
      rewardCoins: tierDefinition.rewardCoins,
      rewardExp: tierDefinition.rewardExp ?? 0,
    }
  })
}
