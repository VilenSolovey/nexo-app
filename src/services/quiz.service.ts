import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@nexo/services/firebase"

export async function getAllQuizzes(userId?: string | null) {
  const snapshot = await getDocs(collection(db, "quizzes"))
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((quiz: any) => {
      if (!quiz.ownerId) return true
      return Boolean(userId) && quiz.ownerId === userId
    })
}

export async function getQuizById(quizId: string) {
  const ref = doc(db, "quizzes", quizId)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
// TODO: Implement create, update, delete quiz functions with proper authentication and validation ( if needed )
