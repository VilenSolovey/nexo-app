// src/services/quiz.service.ts
import { db } from "@nexo/services/firebase.js"
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  Timestamp,
  query,
  where
} from "firebase/firestore"
import { Quiz } from "@nexo/types/quiz.types.js"

// creating a new quiz
export async function createQuiz(quiz: Quiz) {
  const docRef = await addDoc(collection(db, "quizzes"), {
    ...quiz,
    createdAt: Timestamp.now(),
  })
  console.log("Quiz created with ID:", docRef.id)
  return docRef.id
}

// getting all quizzes
export async function getAllQuizzes() {
  const snapshot = await getDocs(collection(db, "quizzes"))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

// getting quizzes in real-time
export function listenQuizzes(userId: string, onUpdate: (quizzes: Quiz[]) => void) {
  // if you want to filter only those that are available to you
  const q = query(collection(db, "quizzes"), where("sharedWith", "array-contains", userId))

  // subscribe to updates
  const unsub = onSnapshot(q, (snapshot) => {
    const quizzes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Quiz[]
    onUpdate(quizzes)
  })

  return unsub // so that you can unsubscribe later
}