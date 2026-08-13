import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@nexo/services/firebase'
import type { QuizResult } from '@nexo/types/result.types'

export async function getUserResultsList(userId: string): Promise<QuizResult[]> {
  const resultsQuery = query(
    collection(db, 'results'),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc'),
  )
  const snapshot = await getDocs(resultsQuery)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<QuizResult, 'id'>),
  }))
}
