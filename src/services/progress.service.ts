import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@nexo/services/firebase'
import type { UserQuizProgress } from '@nexo/types/result.types'

function progressDocId(userId: string, quizId: string): string {
  return `${userId}_${quizId}`
}

export async function getQuizProgress(
  userId: string,
  quizId: string,
): Promise<UserQuizProgress | null> {
  const snap = await getDoc(doc(db, 'userQuizProgress', progressDocId(userId, quizId)))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as UserQuizProgress) : null
}

export async function getUserQuizProgressList(userId: string): Promise<UserQuizProgress[]> {
  const q = query(collection(db, 'userQuizProgress'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }) as UserQuizProgress)
}
