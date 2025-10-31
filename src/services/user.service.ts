import { collection, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "@nexo/services/firebase"
import type { User } from "@nexo/types/user.types"

export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"))
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getUserById(userId: string) {
  const ref = doc(db, "users", userId)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
// TODO: Connect Firebase Auth to get the current logged-in user
export async function getCurrentUser(userId: string): Promise<User | null> {
  const raw = await getUserById(userId)
  if (!raw) return null
  // Defensive normalization with defaults
  const u: User = {
    id: String(raw.id),
    name: String((raw as any).name ?? "User"),
    coins: Number((raw as any).coins ?? 0),
    streakDays: Number((raw as any).streakDays ?? 0),
    level: Number((raw as any).level ?? 1),
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

export function listenUser(userId: string, cb: (u: User | null) => void) {
  const ref = doc(db, "users", userId)
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return cb(null)
    const raw = { id: snap.id, ...snap.data() }
    const u: User = {
      id: String(raw.id),
      name: String((raw as any).name ?? "User"),
      coins: Number((raw as any).coins ?? 0),
      streakDays: Number((raw as any).streakDays ?? 0),
      level: Number((raw as any).level ?? 1),
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