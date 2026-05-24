import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@nexo/services/firebase'
import type { QuizAnswerDetail, UserQuizProgress } from '@nexo/types/result.types'
import { isQuizCompleted } from '@nexo/utils/quiz-progress'

function progressDocId(userId: string, quizId: string): string {
  return `${userId}_${quizId}`
}

export interface SaveQuizAttemptParams {
  userId: string
  quizId: string
  score: number       
  total: number       
  earnedCoins: number 
  earnedExp: number    
  timeSpent: number   
  passed: boolean      
  timeExpired: boolean
  sessionId?: string
  leftAppDuringQuiz?: boolean
  backgroundCount?: number
  backgroundDurationMs?: number
  maxAttempts?: number
  answers?: Record<string, unknown> | null
  answerDetails?: QuizAnswerDetail[] | null
}

export interface SaveQuizAttemptResult {
  firstTimeReward: boolean  
  mastered: boolean        
  progress: UserQuizProgress
}

/**
 * Writes one document to `results` and upserts `userQuizProgress`.
 * Returns information the UI can use to display the right banners.
 */
export async function saveQuizAttempt(
  params: SaveQuizAttemptParams,
): Promise<SaveQuizAttemptResult> {
  const {
    userId,
    quizId,
    score,
    total,
    earnedCoins,
    earnedExp,
    timeSpent,
    passed,
    timeExpired,
    sessionId,
    leftAppDuringQuiz = false,
    backgroundCount = 0,
    backgroundDurationMs = 0,
    maxAttempts,
    answers = null,
    answerDetails = null,
  } = params
  const percentageScore = Math.round((score / total) * 100)

  await addDoc(collection(db, 'results'), {
    userId,
    quizId,
    sessionId: sessionId ?? null,
    score,
    total,
    earnedCoins,
    earnedExp,
    timeSpent,
    leftAppDuringQuiz,
    backgroundCount,
    backgroundDurationMs,
    completedAt: serverTimestamp(),
    passed,
    timeExpired,
    answers,
    answerDetails,
  })

  const progressRef = doc(db, 'userQuizProgress', progressDocId(userId, quizId))
  const progressSnap = await getDoc(progressRef)

  let firstTimeReward = false
  let mastered = false
  let progress: UserQuizProgress

  if (!progressSnap.exists()) {
   
    firstTimeReward = passed
    const newPassedCount = passed ? 1 : 0
    const newAttempts = 1
    mastered = isQuizCompleted(newAttempts, percentageScore, maxAttempts)

    const newProgress: Omit<UserQuizProgress, 'lastPlayedAt'> & { lastPlayedAt: any } = {
      userId,
      quizId,
      attempts: newAttempts,
      passedCount: newPassedCount,
      officialScore: percentageScore,
      officialPassed: passed,
      bestScore: percentageScore,
      completed: mastered,
      rewardClaimed: true,
      lastPlayedAt: serverTimestamp(),
    }

    await setDoc(progressRef, newProgress)

    progress = {
      ...newProgress,
      lastPlayedAt: null as any, 
    }
  } else {

    const prev = progressSnap.data() as UserQuizProgress
    const newAttempts = prev.attempts + 1
    const newPassedCount = prev.passedCount + (passed ? 1 : 0)
    const newBestScore = Math.max(prev.bestScore, percentageScore)
    mastered = Boolean(prev.completed) || isQuizCompleted(newAttempts, newBestScore, maxAttempts)

    firstTimeReward = false

    await updateDoc(progressRef, {
      attempts: increment(1),
      passedCount: increment(passed ? 1 : 0),
      bestScore: newBestScore,
      completed: mastered,
      rewardClaimed: true,
      lastPlayedAt: serverTimestamp(),
    })

    progress = {
      ...prev,
      attempts: newAttempts,
      passedCount: newPassedCount,
      bestScore: newBestScore,
      completed: mastered,
      rewardClaimed: true,
    }
  }

  return { firstTimeReward, mastered, progress }
}


export async function getQuizProgress(
  userId: string,
  quizId: string,
): Promise<UserQuizProgress | null> {
  const snap = await getDoc(doc(db, 'userQuizProgress', progressDocId(userId, quizId)))
  return snap.exists() ? (snap.data() as UserQuizProgress) : null
}

export async function getUserQuizProgressList(userId: string): Promise<UserQuizProgress[]> {
  const q = query(collection(db, 'userQuizProgress'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((item) => item.data() as UserQuizProgress)
}
