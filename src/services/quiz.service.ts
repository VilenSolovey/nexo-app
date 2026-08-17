import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore"
import { db } from "@nexo/services/firebase"

type QuizDocumentRow = {
  id: string
  ownerId?: string | null
  [key: string]: unknown
}

export async function getAllQuizzes(userId?: string | null) {
  const quizzesRef = collection(db, "quizzes")
  const publicQuizzesQuery = query(quizzesRef, where("ownerId", "==", null))
  const requests = [getDocs(publicQuizzesQuery)]

  if (userId) {
    const ownedQuizzesQuery = query(quizzesRef, where("ownerId", "==", userId))
    requests.push(getDocs(ownedQuizzesQuery))
  }

  const snapshots = await Promise.all(requests)
  const quizzes = snapshots.flatMap((snapshot) =>
    snapshot.docs.map((quizDoc): QuizDocumentRow => ({
      id: quizDoc.id,
      ...quizDoc.data(),
    })),
  )

  return Array.from(
    new Map(quizzes.map((quiz) => [quiz.id, quiz])).values(),
  )
}

export async function getQuizById(quizId: string, userId?: string | null) {
  const ref = doc(db, "quizzes", quizId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null

  const quiz: QuizDocumentRow = { id: snap.id, ...snap.data() }

  if (
    typeof quiz.ownerId === "string" &&
    (!userId || quiz.ownerId !== userId)
  ) {
    return null
  }

  return quiz
}
// TODO: Implement create, update, delete quiz functions with proper authentication and validation ( if needed )
