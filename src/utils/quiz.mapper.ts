import type { Quiz } from '@nexo/types/quiz.types'

export function normalizeQuizzes(rows: any[]): Quiz[] {
  return rows.map((r) => ({
    id: String(r.id),
    title: String(r.title ?? 'Untitled'),
    category: String(r.type ?? r.category ?? 'other'),
    questions: Array.isArray(r.questions)
      ? r.questions.length
      : Number(r.questions ?? 0),
    reward: Number(r.reward ?? 0),
    description:
      typeof r.description === 'string' ? r.description : undefined,
  }))
}