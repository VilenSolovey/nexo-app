import { useCallback, useEffect, useMemo, useState } from 'react'
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORY_ORDER } from '@nexo/constants/achievements'
import {
  claimAchievementReward,
  getUserAchievementRecords,
  getUserResultsList,
  syncUnlockedAchievements,
} from '@nexo/services/achievement.service'
import { getUserQuizProgressList } from '@nexo/services/progress.service'
import type { UserProfile } from '@nexo/types/user.types'
import type {
  AchievementCategory,
  AchievementMetric,
  AchievementTierViewModel,
  AchievementViewModel,
  UserAchievementRecord,
} from '@nexo/types/achievement.types'
import type { QuizResult, UserQuizProgress } from '@nexo/types/result.types'

type Metrics = Record<AchievementMetric, number>

type GroupedAchievements = {
  category: AchievementCategory
  items: AchievementViewModel[]
}

type ClaimRewardResult = {
  achievementId: string
  tierId: string
  rewardCoins: number
  rewardExp: number
}

function getMetrics(
  userProfile: UserProfile | null | undefined,
  results: QuizResult[],
  progressList: UserQuizProgress[],
): Metrics {
  const uniqueQuizzes = new Set(results.map((item) => item.quizId)).size
  const passedQuizzes = progressList.filter(
    (item) => item.officialPassed || item.passedCount > 0,
  ).length
  const perfectScores = results.filter((item) => item.total > 0 && item.score === item.total).length
  const bestScore = progressList.reduce((max, item) => Math.max(max, item.bestScore ?? 0), 0)
  const streakDays = userProfile?.streakDays ?? userProfile?.streak ?? 0
  const masteredQuizzes = progressList.filter((item) => item.completed).length
  const level = userProfile?.level ?? 1
  const coins = userProfile?.coins ?? 0
  const fastPasses = results.filter((item) => item.passed && item.timeSpent <= 45).length

  return {
    uniqueQuizzes,
    passedQuizzes,
    perfectScores,
    bestScore,
    streakDays,
    masteredQuizzes,
    level,
    coins,
    fastPasses,
  }
}

function buildAchievements(
  metrics: Metrics,
  userAchievements: UserAchievementRecord[],
): AchievementViewModel[] {
  const recordIndex = new Map(userAchievements.map((item) => [item.achievementId, item]))

  return ACHIEVEMENTS.map((achievement) => {
    const current = metrics[achievement.metric] ?? 0
    const record = recordIndex.get(achievement.id)
    const highestUnlockedFromRecord = record?.highestUnlockedTier ?? -1
    const highestClaimedFromRecord = record?.highestClaimedTier ?? -1

    const tiers: AchievementTierViewModel[] = achievement.tiers.map((tier, index) => {
      const storedTier = record?.tiers?.[tier.id]
      const unlocked =
        Boolean(storedTier?.unlockedAt) || highestUnlockedFromRecord >= index || current >= tier.target
      const claimed = Boolean(storedTier?.claimedAt) || highestClaimedFromRecord >= index

      return {
        ...tier,
        index,
        progress: Math.min(100, Math.round((current / tier.target) * 100)),
        unlocked,
        claimed,
        unlockedAt: storedTier?.unlockedAt ?? null,
        claimedAt: storedTier?.claimedAt ?? null,
      }
    })

    const unlockedTierCount = tiers.filter((tier) => tier.unlocked).length
    const claimedTierCount = tiers.filter((tier) => tier.claimed).length
    const unlockedIndices = tiers.filter((tier) => tier.unlocked).map((tier) => tier.index)
    const claimedIndices = tiers.filter((tier) => tier.claimed).map((tier) => tier.index)
    const highestUnlockedTier = Math.max(record?.highestUnlockedTier ?? -1, ...unlockedIndices, -1)
    const highestClaimedTier = Math.max(record?.highestClaimedTier ?? -1, ...claimedIndices, -1)
    const nextTier = tiers.find((tier) => !tier.unlocked) ?? null
    const claimableTier = tiers.find((tier) => tier.unlocked && !tier.claimed) ?? null
    const previousTarget = highestUnlockedTier >= 0 ? achievement.tiers[highestUnlockedTier].target : 0
    const nextTarget = nextTier?.target ?? previousTarget
    const span = Math.max(nextTarget - previousTarget, 1)
    const progressToNext = nextTier
      ? Math.round((Math.min(Math.max(current - previousTarget, 0), span) / span) * 100)
      : 100

    return {
      ...achievement,
      current,
      unlocked: unlockedTierCount > 0,
      completed: unlockedTierCount === tiers.length,
      highestUnlockedTier,
      highestClaimedTier,
      unlockedTierCount,
      claimedTierCount,
      totalTiers: tiers.length,
      completionRate: tiers.length > 0 ? Math.round((unlockedTierCount / tiers.length) * 100) : 0,
      progressToNext,
      tiers,
      nextTier,
      claimableTier,
    }
  })
}

function mergeSyncedAchievements(
  currentRecords: UserAchievementRecord[],
  syncedAchievements: AchievementViewModel[],
) {
  const unlockedAt = new Date().toISOString()
  const recordMap = new Map(currentRecords.map((item) => [item.achievementId, item]))

  syncedAchievements.forEach((achievement) => {
    const existing = recordMap.get(achievement.id)
    const mergedTiers = { ...(existing?.tiers ?? {}) }

    achievement.tiers
      .filter((tier) => tier.unlocked)
      .forEach((tier) => {
        mergedTiers[tier.id] = {
          unlockedAt: mergedTiers[tier.id]?.unlockedAt ?? unlockedAt,
          claimedAt: mergedTiers[tier.id]?.claimedAt ?? null,
        }
      })

    recordMap.set(achievement.id, {
      achievementId: achievement.id,
      highestUnlockedTier: Math.max(existing?.highestUnlockedTier ?? -1, achievement.highestUnlockedTier),
      highestClaimedTier: existing?.highestClaimedTier ?? -1,
      tiers: mergedTiers,
      updatedAt: unlockedAt,
    })
  })

  return Array.from(recordMap.values())
}

export function useAchievements(userId?: string, userProfile?: UserProfile | null) {
  const [results, setResults] = useState<QuizResult[]>([])
  const [progressList, setProgressList] = useState<UserQuizProgress[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [claimingKey, setClaimingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!userId) {
      setResults([])
      setProgressList([])
      setUserAchievements([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [fetchedResults, fetchedProgress, fetchedAchievements] = await Promise.all([
        getUserResultsList(userId),
        getUserQuizProgressList(userId),
        getUserAchievementRecords(userId),
      ])

      setResults(fetchedResults)
      setProgressList(fetchedProgress)
      setUserAchievements(fetchedAchievements)
    } catch (e: any) {
      setError(e?.message ?? 'Не вдалося завантажити ачівки')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const achievements = useMemo(() => {
    const metrics = getMetrics(userProfile, results, progressList)
    return buildAchievements(metrics, userAchievements)
  }, [progressList, results, userAchievements, userProfile])

  const pendingSyncAchievements = useMemo(
    () =>
      achievements.filter((achievement) => {
        const stored = userAchievements.find((item) => item.achievementId === achievement.id)
        return achievement.tiers.some((tier) => tier.unlocked && !stored?.tiers?.[tier.id]?.unlockedAt)
      }),
    [achievements, userAchievements],
  )

  useEffect(() => {
    if (!userId || pendingSyncAchievements.length === 0) return

    const resolvedUserId = userId
    let cancelled = false

    async function persistAchievements() {
      setSyncing(true)

      try {
        await syncUnlockedAchievements(resolvedUserId, pendingSyncAchievements, userAchievements)

        if (!cancelled) {
          setUserAchievements((current) => mergeSyncedAchievements(current, pendingSyncAchievements))
        }
      } catch (e) {
        console.error('Failed to sync achievements:', e)
      } finally {
        if (!cancelled) {
          setSyncing(false)
        }
      }
    }

    persistAchievements()

    return () => {
      cancelled = true
    }
  }, [pendingSyncAchievements, userAchievements, userId])

  const claimReward = useCallback(
    async (achievementId: string, tierId: string): Promise<ClaimRewardResult> => {
      if (!userId) {
        throw new Error('User is not authenticated')
      }

      const achievement = ACHIEVEMENTS.find((item) => item.id === achievementId)
      const tierIndex = achievement?.tiers.findIndex((tier) => tier.id === tierId) ?? -1

      if (!achievement || tierIndex < 0) {
        throw new Error('Achievement tier not found')
      }

      const key = `${achievementId}:${tierId}`
      setClaimingKey(key)

      try {
        const result = await claimAchievementReward(userId, achievementId, tierId)
        const claimedAt = new Date().toISOString()

        setUserAchievements((current) => {
          const existingRecord = current.find((record) => record.achievementId === achievementId)

          if (!existingRecord) {
            return [
              ...current,
              {
                achievementId,
                highestUnlockedTier: tierIndex,
                highestClaimedTier: tierIndex,
                tiers: {
                  [tierId]: {
                    unlockedAt: claimedAt,
                    claimedAt,
                  },
                },
                updatedAt: claimedAt,
              },
            ]
          }

          return current.map((record) => {
            if (record.achievementId !== achievementId) return record

            return {
              ...record,
              highestUnlockedTier: Math.max(record.highestUnlockedTier, tierIndex),
              highestClaimedTier: Math.max(record.highestClaimedTier, tierIndex),
              tiers: {
                ...record.tiers,
                [tierId]: {
                  unlockedAt: record.tiers[tierId]?.unlockedAt ?? claimedAt,
                  claimedAt,
                },
              },
              updatedAt: claimedAt,
            }
          })
        })

        await refetch()

        return result
      } finally {
        setClaimingKey(null)
      }
    },
    [refetch, userId],
  )

  const groupedAchievements = useMemo<GroupedAchievements[]>(
    () =>
      ACHIEVEMENT_CATEGORY_ORDER.map((category) => ({
        category,
        items: achievements.filter((item) => item.category === category),
      })).filter((group) => group.items.length > 0),
    [achievements],
  )

  const almostThere = useMemo(
    () =>
      achievements
        .filter((item) => !item.completed && item.current > 0)
        .sort((a, b) => b.progressToNext - a.progressToNext || b.current - a.current)
        .slice(0, 3),
    [achievements],
  )

  const summary = useMemo(() => {
    const unlockedCount = achievements.filter((item) => item.unlocked).length
    const completedCount = achievements.filter((item) => item.completed).length
    const total = achievements.length
    const totalTiers = achievements.reduce((sum, item) => sum + item.totalTiers, 0)
    const unlockedTiers = achievements.reduce((sum, item) => sum + item.unlockedTierCount, 0)
    const claimableCount = achievements.filter((item) => item.claimableTier).length
    const completionRate = totalTiers > 0 ? Math.round((unlockedTiers / totalTiers) * 100) : 0
    const nextAchievement = almostThere[0] ?? achievements.find((item) => !item.completed) ?? null

    return {
      total,
      unlockedCount,
      completedCount,
      totalTiers,
      unlockedTiers,
      claimableCount,
      completionRate,
      nextAchievement,
    }
  }, [achievements, almostThere])

  return {
    achievements,
    groupedAchievements,
    almostThere,
    summary,
    loading,
    syncing,
    claimingKey,
    error,
    refetch,
    claimReward,
  }
}
