import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@nexo/services/firebase'
import type {
  ChallengeSlot,
  ChronicleChapter,
  ChronicleFragment,
  ChronicleQuestion,
  UserFragmentProgress,
  UserChallengeProgress,
  UserChapterProgress,
} from '@nexo/types/chronicle.types'

const CHAPTERS_COLLECTION = 'chapters'
const FRAGMENTS_COLLECTION = 'fragments'
const QUESTIONS_COLLECTION = 'questions'
const CHALLENGE_SLOTS_COLLECTION = 'challengeSlots'
const USER_FRAGMENT_PROGRESS_COLLECTION = 'userFragmentProgress'
const USER_CHALLENGE_PROGRESS_COLLECTION = 'userChallengeProgress'
const USER_CHAPTER_PROGRESS_COLLECTION = 'userChapterProgress'

export async function getChronicleChapters(): Promise<ChronicleChapter[]> {
  const q = query(
    collection(db, CHAPTERS_COLLECTION),
    orderBy('order', 'asc'),
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ChronicleChapter[]
}

export async function getActiveChronicleChapters(): Promise<ChronicleChapter[]> {
  const q = query(
    collection(db, CHAPTERS_COLLECTION),
    where('isActive', '==', true),
    orderBy('order', 'asc'),
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ChronicleChapter[]
}

export async function getChronicleChapterById(
  chapterId: string,
): Promise<ChronicleChapter | null> {
  const snapshot = await getDoc(doc(db, CHAPTERS_COLLECTION, chapterId))
  return snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as ChronicleChapter)
    : null
}

export async function getChapterFragments(chapterId: string): Promise<ChronicleFragment[]> {
  const q = query(
    collection(db, FRAGMENTS_COLLECTION),
    where('chapterId', '==', chapterId),
    orderBy('order', 'asc'),
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ChronicleFragment[]
}

export async function getChapterQuestions(chapterId: string): Promise<ChronicleQuestion[]> {
  const q = query(
    collection(db, QUESTIONS_COLLECTION),
    where('chapterId', '==', chapterId),
    where('active', '==', true),
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ChronicleQuestion[]
}

export async function getChapterChallengeSlots(chapterId: string): Promise<ChallengeSlot[]> {
  const q = query(
    collection(db, CHALLENGE_SLOTS_COLLECTION),
    where('chapterId', '==', chapterId),
    orderBy('opensAt', 'asc'),
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ChallengeSlot[]
}

export async function getUserFragmentProgressList(
  userId: string,
  chapterId: string,
): Promise<UserFragmentProgress[]> {
  const q = query(
    collection(db, USER_FRAGMENT_PROGRESS_COLLECTION),
    where('userId', '==', userId),
    where('chapterId', '==', chapterId),
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as unknown as UserFragmentProgress[]
}

export async function getUserChallengeProgressList(
  userId: string,
  chapterId: string,
): Promise<UserChallengeProgress[]> {
  const q = query(
    collection(db, USER_CHALLENGE_PROGRESS_COLLECTION),
    where('userId', '==', userId),
    where('chapterId', '==', chapterId),
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as UserChallengeProgress[]
}

export async function getUserChapterProgress(
  userId: string,
  chapterId: string,
): Promise<UserChapterProgress | null> {
  const snapshot = await getDoc(doc(
    db,
    USER_CHAPTER_PROGRESS_COLLECTION,
    `${userId}_${chapterId}`,
  ))

  return snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as unknown as UserChapterProgress)
    : null
}

export async function getUserChapterProgressList(
  userId: string,
): Promise<UserChapterProgress[]> {
  const q = query(
    collection(db, USER_CHAPTER_PROGRESS_COLLECTION),
    where('userId', '==', userId),
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as unknown as UserChapterProgress[]
}
