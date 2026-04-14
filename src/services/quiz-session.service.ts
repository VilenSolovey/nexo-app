import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@nexo/services/firebase'

export interface StartQuizSessionParams {
  userId: string
  quizId: string
}

export interface CompleteQuizSessionParams {
  sessionId: string
  score: number
  total: number
  timeSpent: number
  passed: boolean
  timeExpired: boolean
  quitEarly: boolean
  backgroundCount: number
  backgroundDurationMs: number
}

export async function startQuizSession(
  params: StartQuizSessionParams,
): Promise<string> {
  const { userId, quizId } = params

  const ref = await addDoc(collection(db, 'quizSessions'), {
    userId,
    quizId,
    status: 'in_progress',
    currentAppState: 'active',
    backgroundCount: 0,
    backgroundDurationMs: 0,
    leftAppDuringQuiz: false,
    startedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
  })

  return ref.id
}

export async function markQuizSessionBackground(
  sessionId: string,
  appState: string,
): Promise<void> {
  await updateDoc(doc(db, 'quizSessions', sessionId), {
    currentAppState: appState,
    backgroundCount: increment(1),
    leftAppDuringQuiz: true,
    lastMovedToBackgroundAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
  })
}

export async function markQuizSessionForeground(
  sessionId: string,
  backgroundDurationMs: number,
): Promise<void> {
  await updateDoc(doc(db, 'quizSessions', sessionId), {
    currentAppState: 'active',
    backgroundDurationMs: increment(Math.max(backgroundDurationMs, 0)),
    lastReturnedToForegroundAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
  })
}

export async function completeQuizSession(
  params: CompleteQuizSessionParams,
): Promise<void> {
  const {
    sessionId,
    score,
    total,
    timeSpent,
    passed,
    timeExpired,
    quitEarly,
    backgroundCount,
    backgroundDurationMs,
  } = params

  await updateDoc(doc(db, 'quizSessions', sessionId), {
    status: 'completed',
    currentAppState: 'completed',
    score,
    total,
    timeSpent,
    passed,
    timeExpired,
    quitEarly,
    backgroundCount,
    backgroundDurationMs,
    leftAppDuringQuiz: backgroundCount > 0,
    completedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
  })
}
