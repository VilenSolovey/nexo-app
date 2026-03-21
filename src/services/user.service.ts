import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, increment, runTransaction, serverTimestamp } from "firebase/firestore"
import { db } from "@nexo/services/firebase"
import type { UserProfile, CompletedQuiz } from "@nexo/types/user.types"
import { getLevelFromExp } from "@nexo/utils/level"

function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return toLocalDateKey(date)
}

export interface RegisterDailyActivityResult {
  changed: boolean
  streakDays: number
  lastActiveDate: string
}

export interface ApplyUserRewardsParams {
  coinsDelta?: number
  expDelta?: number
}

export interface ApplyUserRewardsResult {
  coins: number
  exp: number
  level: number
  previousLevel: number
  leveledUp: boolean
}

export async function getUserById(userId: string) {
  const ref = doc(db, "users", userId)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
// TODO: Connect Firebase Auth to get the current logged-in user
export async function getCurrentUser(userId: string): Promise<UserProfile | null> {
  const raw = await getUserById(userId)
  if (!raw) return null
  const exp = Number((raw as any).exp ?? 0)
  const normalizedLevel = getLevelFromExp(exp)
  // Defensive normalization with defaults
  const u: UserProfile = {
    id: String(raw.id),
    displayName: String((raw as any).displayName ?? (raw as any).name ?? "User"),
    email: String((raw as any).email ?? ""),
    coins: Number((raw as any).coins ?? 0),
    consumables:
      typeof (raw as any).consumables === "object" && (raw as any).consumables !== null
        ? Object.fromEntries(
            Object.entries((raw as any).consumables).map(([key, value]) => [key, Number(value ?? 0)]),
          )
        : {},
    streakDays: Number((raw as any).streakDays ?? 0),
    level: normalizedLevel,
    exp,
    streak: Number((raw as any).streak ?? 0),
    lastActiveDate: typeof (raw as any).lastActiveDate === "string" ? (raw as any).lastActiveDate : undefined,
    longestStreak: Number((raw as any).longestStreak ?? 0),
    achievements: Array.isArray((raw as any).achievements) ? (raw as any).achievements.map(String) : [],
    inventory: Array.isArray((raw as any).inventory) ? (raw as any).inventory.map(String) : [],
    selectedThemeId:
      typeof (raw as any).selectedThemeId === "string" ? (raw as any).selectedThemeId : null,
    selectedAvatarId:
      typeof (raw as any).selectedAvatarId === "string" ? (raw as any).selectedAvatarId : null,
    completedQuizzes: Array.isArray((raw as any).completedQuizzes)
      ? (raw as any).completedQuizzes.map((cq: any) => ({
          quizId: String(cq.quizId ?? cq.id ?? ""),
          completedAt: Number(cq.completedAt ?? Date.now()),
          score: typeof cq.score === "number" ? cq.score : undefined,
          rewardEarned: typeof cq.rewardEarned === "number" ? cq.rewardEarned : undefined,
        }))
      : [],
  }
  return u
}

export function listenUser(userId: string, cb: (u: UserProfile | null) => void) {
  const ref = doc(db, "users", userId)
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return cb(null)
    const raw = { id: snap.id, ...snap.data() }
    const exp = Number((raw as any).exp ?? 0)
    const normalizedLevel = getLevelFromExp(exp)
    const u: UserProfile = {
      id: String(raw.id),
      displayName: String((raw as any).displayName ?? (raw as any).name ?? "User"),
      email: String((raw as any).email ?? ""),
      coins: Number((raw as any).coins ?? 0),
      consumables:
        typeof (raw as any).consumables === "object" && (raw as any).consumables !== null
          ? Object.fromEntries(
              Object.entries((raw as any).consumables).map(([key, value]) => [key, Number(value ?? 0)]),
            )
          : {},
      streakDays: Number((raw as any).streakDays ?? 0),
      level: normalizedLevel,
      exp,
      streak: Number((raw as any).streak ?? 0),
      lastActiveDate: typeof (raw as any).lastActiveDate === "string" ? (raw as any).lastActiveDate : undefined,
      longestStreak: Number((raw as any).longestStreak ?? 0),
      achievements: Array.isArray((raw as any).achievements) ? (raw as any).achievements.map(String) : [],
      inventory: Array.isArray((raw as any).inventory) ? (raw as any).inventory.map(String) : [],
      selectedThemeId:
        typeof (raw as any).selectedThemeId === "string" ? (raw as any).selectedThemeId : null,
      selectedAvatarId:
        typeof (raw as any).selectedAvatarId === "string" ? (raw as any).selectedAvatarId : null,
      completedQuizzes: Array.isArray((raw as any).completedQuizzes)
        ? (raw as any).completedQuizzes.map((cq: any) => ({
            quizId: String(cq.quizId ?? cq.id ?? ""),
            completedAt: Number(cq.completedAt ?? Date.now()),
            score: typeof cq.score === "number" ? cq.score : undefined,
            rewardEarned: typeof cq.rewardEarned === "number" ? cq.rewardEarned : undefined,
          }))
        : [],
    }
    cb(u)
  })
}

export async function updateUser(userId: string, data: Partial<Omit<UserProfile, "id" | "completedQuizzes">>) {
  const ref = doc(db, "users", userId)
  await updateDoc(ref, data)
}

export async function addCompletedQuiz(uid: string, item: CompletedQuiz, rewardEarned: number = 0) {
  const ref = doc(db, "users", uid)
  await updateDoc(ref, {
    completedQuizzes: arrayUnion(item),
    coins: increment(rewardEarned),
  })
}

export async function applyUserRewards(
  uid: string,
  { coinsDelta = 0, expDelta = 0 }: ApplyUserRewardsParams,
): Promise<ApplyUserRewardsResult> {
  return runTransaction(db, async (transaction) => {
    const ref = doc(db, "users", uid)
    const snap = await transaction.get(ref)

    if (!snap.exists()) {
      throw new Error("User profile not found")
    }

    const data = snap.data()
    const currentCoins = Number(data.coins ?? 0)
    const currentExp = Number(data.exp ?? 0)
    const previousLevel = Number(data.level ?? getLevelFromExp(currentExp))
    const nextCoins = Math.max(0, currentCoins + coinsDelta)
    const nextExp = Math.max(0, currentExp + expDelta)
    const nextLevel = getLevelFromExp(nextExp)

    transaction.update(ref, {
      coins: nextCoins,
      exp: nextExp,
      level: nextLevel,
    })

    return {
      coins: nextCoins,
      exp: nextExp,
      level: nextLevel,
      previousLevel,
      leveledUp: nextLevel > previousLevel,
    }
  })
}

export async function registerDailyActivity(uid: string): Promise<RegisterDailyActivityResult> {
  const todayKey = toLocalDateKey()
  const yesterdayKey = shiftDateKey(todayKey, -1)

  return runTransaction(db, async (transaction) => {
    const ref = doc(db, "users", uid)
    const snap = await transaction.get(ref)

    if (!snap.exists()) {
      throw new Error("User profile not found")
    }

    const data = snap.data()
    const lastActiveDate = typeof data.lastActiveDate === "string" ? data.lastActiveDate : null
    const currentStreak = Number(data.streakDays ?? data.streak ?? 0)

    if (lastActiveDate === todayKey) {
      return {
        changed: false,
        streakDays: currentStreak,
        lastActiveDate: todayKey,
      }
    }

    const nextStreak = lastActiveDate === yesterdayKey ? currentStreak + 1 : 1
    const longestStreak = Math.max(Number(data.longestStreak ?? 0), nextStreak)

    transaction.update(ref, {
      streak: nextStreak,
      streakDays: nextStreak,
      longestStreak,
      lastActiveDate: todayKey,
      lastActiveAt: serverTimestamp(),
    })

    return {
      changed: true,
      streakDays: nextStreak,
      lastActiveDate: todayKey,
    }
  })
}

export async function createUserIfMissing(uid: string, seed?: Partial<UserProfile>) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: seed?.displayName ?? 'Player',
      email: seed?.email ?? '',
      coins: seed?.coins ?? 0,
      exp: seed?.exp ?? 0,
      level: seed?.level ?? 1,
      streak: seed?.streak ?? 0,
      streakDays: seed?.streakDays ?? 0,
      longestStreak: seed?.longestStreak ?? 0,
      completedQuizzes: [],
      achievements: seed?.achievements ?? [],
      inventory: seed?.inventory ?? [],
      consumables: seed?.consumables ?? {},
      selectedThemeId: seed?.selectedThemeId ?? null,
      selectedAvatarId: seed?.selectedAvatarId ?? null,
      createdAt: serverTimestamp(),
    })
  }
}
