import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, increment, serverTimestamp } from "firebase/firestore"
import { db } from "@nexo/services/firebase"
import type { UserProfile, CompletedQuiz } from "@nexo/types/user.types"

export async function getUserById(userId: string) {
  const ref = doc(db, "users", userId)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
// TODO: Connect Firebase Auth to get the current logged-in user
export async function getCurrentUser(userId: string): Promise<UserProfile | null> {
  const raw = await getUserById(userId)
  if (!raw) return null
  // Defensive normalization with defaults
  const u: UserProfile = {
    id: String(raw.id),
    displayName: String((raw as any).displayName ?? (raw as any).name ?? "User"),
    email: String((raw as any).email ?? ""),
    coins: Number((raw as any).coins ?? 0),
    streakDays: Number((raw as any).streakDays ?? 0),
    level: Number((raw as any).level ?? 1),
    exp: Number((raw as any).exp ?? 0),
    streak: Number((raw as any).streak ?? 0),
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
    const u: UserProfile = {
      id: String(raw.id),
      displayName: String((raw as any).displayName ?? (raw as any).name ?? "User"),
      email: String((raw as any).email ?? ""),
      coins: Number((raw as any).coins ?? 0),
      streakDays: Number((raw as any).streakDays ?? 0),
      level: Number((raw as any).level ?? 1),
      exp: Number((raw as any).exp ?? 0),
      streak: Number((raw as any).streak ?? 0),
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
      completedQuizzes: [],
      createdAt: serverTimestamp(),
    })
  }
}