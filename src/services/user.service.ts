import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, increment, runTransaction, serverTimestamp } from "firebase/firestore"
import { db } from "@nexo/services/firebase"
import type { UserProfile, CompletedQuiz } from "@nexo/types/user.types"
import { getLevelFromExp } from "@nexo/utils/level"
import { normalizeUserProfile } from "@nexo/utils/user-profile"

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
  return normalizeUserProfile(String(raw.id), raw as Record<string, unknown>)
}

export function listenUser(userId: string, cb: (u: UserProfile | null) => void) {
  const ref = doc(db, "users", userId)
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return cb(null)
    const raw = { id: snap.id, ...snap.data() }
    cb(normalizeUserProfile(String(raw.id), raw as Record<string, unknown>))
  })
}

export async function updateUser(userId: string, data: Partial<Omit<UserProfile, "id" | "completedQuizzes">>) {
  const ref = doc(db, "users", userId)
  await updateDoc(ref, data)
}

export async function markNestorIntroSeen(userId: string, version = 1) {
  await updateDoc(doc(db, "users", userId), {
    nestorIntroSeenAt: new Date().toISOString(),
    nestorIntroVersion: version,
  })
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
  const ref = doc(db, "users", uid)

  return runTransaction(db, async (transaction) => {
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
