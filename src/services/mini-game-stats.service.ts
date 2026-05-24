import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@nexo/services/firebase"
import type { DailyMiniGameResult, MiniGameId } from "@nexo/utils/daily-mini-game"

type MiniGameGameStats = {
  played: number
  wins: number
  losses: number
  currentWinStreak: number
  bestWinStreak: number
  bestProgressScore: number
  bestRiskScore: number
  lastPlayedAt: number | null
}

type MiniGameStats = {
  userId: string
  totalPlayed: number
  wins: number
  losses: number
  currentWinStreak: number
  bestWinStreak: number
  byGame: Partial<Record<MiniGameId, MiniGameGameStats>>
  recent: DailyMiniGameResult[]
}

const MAX_RECENT_RESULTS = 50

function createEmptyGameStats(): MiniGameGameStats {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    bestProgressScore: 0,
    bestRiskScore: 0,
    lastPlayedAt: null,
  }
}

function createEmptyStats(userId: string): MiniGameStats {
  return {
    userId,
    totalPlayed: 0,
    wins: 0,
    losses: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    byGame: {},
    recent: [],
  }
}

function normalizeGameStats(raw: unknown): MiniGameGameStats {
  const stats = typeof raw === "object" && raw !== null
    ? raw as Partial<MiniGameGameStats> & {
      bestPlayerScore?: unknown
      bestOpponentScore?: unknown
    }
    : {}

  return {
    played: Number(stats.played ?? 0),
    wins: Number(stats.wins ?? 0),
    losses: Number(stats.losses ?? 0),
    currentWinStreak: Number(stats.currentWinStreak ?? 0),
    bestWinStreak: Number(stats.bestWinStreak ?? 0),
    bestProgressScore: Number(stats.bestProgressScore ?? stats.bestPlayerScore ?? 0),
    bestRiskScore: Number(stats.bestRiskScore ?? stats.bestOpponentScore ?? 0),
    lastPlayedAt: stats.lastPlayedAt === null || stats.lastPlayedAt === undefined
      ? null
      : Number(stats.lastPlayedAt),
  }
}

function normalizeStats(userId: string, raw: unknown): MiniGameStats {
  const parsed = typeof raw === "object" && raw !== null
    ? raw as Partial<MiniGameStats>
    : {}
  const byGame: Partial<Record<MiniGameId, MiniGameGameStats>> = {}

  if (typeof parsed.byGame === "object" && parsed.byGame !== null) {
    Object.entries(parsed.byGame).forEach(([gameId, stats]) => {
      byGame[gameId as MiniGameId] = normalizeGameStats(stats)
    })
  }

  return {
    userId,
    totalPlayed: Number(parsed.totalPlayed ?? 0),
    wins: Number(parsed.wins ?? 0),
    losses: Number(parsed.losses ?? 0),
    currentWinStreak: Number(parsed.currentWinStreak ?? 0),
    bestWinStreak: Number(parsed.bestWinStreak ?? 0),
    byGame,
    recent: Array.isArray(parsed.recent)
      ? parsed.recent.slice(0, MAX_RECENT_RESULTS)
      : [],
  }
}

export async function recordMiniGameStats(userId: string, result: DailyMiniGameResult) {
  return runTransaction(db, async (transaction) => {
    const statsRef = doc(db, "users", userId, "miniGameStats", "summary")
    const attemptRef = doc(collection(db, "users", userId, "miniGameResults"))
    const statsSnap = await transaction.get(statsRef)
    const stats = statsSnap.exists()
      ? normalizeStats(userId, statsSnap.data())
      : createEmptyStats(userId)
    const gameStats = stats.byGame[result.gameId] ?? createEmptyGameStats()
    const nextCurrentWinStreak = result.won ? stats.currentWinStreak + 1 : 0
    const nextGameWinStreak = result.won ? gameStats.currentWinStreak + 1 : 0

    const nextStats = {
      userId,
      totalPlayed: stats.totalPlayed + 1,
      wins: stats.wins + (result.won ? 1 : 0),
      losses: stats.losses + (result.won ? 0 : 1),
      currentWinStreak: nextCurrentWinStreak,
      bestWinStreak: Math.max(stats.bestWinStreak, nextCurrentWinStreak),
      byGame: {
        ...stats.byGame,
        [result.gameId]: {
          played: gameStats.played + 1,
          wins: gameStats.wins + (result.won ? 1 : 0),
          losses: gameStats.losses + (result.won ? 0 : 1),
          currentWinStreak: nextGameWinStreak,
          bestWinStreak: Math.max(gameStats.bestWinStreak, nextGameWinStreak),
          bestProgressScore: Math.max(gameStats.bestProgressScore, result.progressScore),
          bestRiskScore: Math.max(gameStats.bestRiskScore, result.riskScore),
          lastPlayedAt: result.playedAt,
        },
      },
      recent: [result, ...stats.recent].slice(0, MAX_RECENT_RESULTS),
      updatedAt: serverTimestamp(),
      createdAt: statsSnap.exists() ? statsSnap.data().createdAt ?? serverTimestamp() : serverTimestamp(),
    }

    transaction.set(statsRef, nextStats)
    transaction.set(attemptRef, {
      ...result,
      userId,
      recordedAt: serverTimestamp(),
    })

    return nextStats
  })
}
