import type { Quiz, QuizType } from '@nexo/types/quiz.types'

export function normalizeQuizzes(rows: any[]): Quiz[] {
  return rows.map((r) => {
    const type = r.type === 'spark' ? 'spark' : 'trial'
    
    return {
      id: String(r.id),
      title: String(r.title ?? 'Untitled'),
      category: String(r.category ?? 'other'),
      type: type as QuizType,
      questionsCount: Array.isArray(r.questions)
        ? r.questions.length
        : Number(r.questions ?? 0),
      reward: Number(r.reward ?? 0),
      exp: Number(r.exp ?? 0),
      description:
        typeof r.description === 'string' ? r.description : undefined,
    }
  })
}