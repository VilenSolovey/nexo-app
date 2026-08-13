import type { Timestamp } from "firebase/firestore"

export type QuizType = "trial" | "spark"
export type QuizCategory = string
export type QuizSource = "chronicle" | "manual"
export type QuizRevealPolicy = "staged" | "full_after_first"

export type Quiz = {
  id: string
  title: string
  category: QuizCategory
  type: QuizType
  questionsCount: number
  reward: number
  questions: QuizQuestion[]
  time?: number
  description?: string
  exp?: number
  source?: QuizSource
  ownerId?: string | null
  chapterId?: string
  slotId?: string
  targetFragmentIds?: string[]
  maxAttempts?: number
  revealPolicy?: QuizRevealPolicy
  createdAt?: Timestamp | number | string | Date | null
}

export type QuizQuestionBase = {
  id: string
  type: 'single_answer' | 'multiple_choice' | 'true_false' | 'fill_blank'
  question: string
  hint?: string
  explanation?: string
}

export type SingleAnswerQuestion = QuizQuestionBase & {
  type: 'single_answer'
  options: string[]
  correctOptionIndex: number
}

export type MultipleChoiceQuestion = QuizQuestionBase & {
  type: 'multiple_choice'
  options: string[]
  correctOptionIndexes: number[]
}

export type TrueFalseQuestion = QuizQuestionBase & {
  type: 'true_false'
  correctAnswer: boolean
}

export type FillBlankQuestion = QuizQuestionBase & {
  type: 'fill_blank'
  correctAnswer: string
}

export type QuizQuestion =
  | SingleAnswerQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion

export type NewsItem = Quiz

export type RecentItem = Quiz & {
  completedAt: number
  score: number
  total: number
  attempts: number
  rewardEarned: number
}
