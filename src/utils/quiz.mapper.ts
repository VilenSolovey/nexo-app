import type {
  Quiz,
  QuizRevealPolicy,
  QuizSource,
  QuizType,
} from '@nexo/types/quiz.types'

const allowedSources = new Set<QuizSource>(['chronicle', 'manual'])
const allowedRevealPolicies = new Set<QuizRevealPolicy>([
  'staged',
  'full_after_first',
])

function safeNumber(value: unknown, fallback = 0): number {
  const resolvedValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(resolvedValue) ? resolvedValue : fallback
}

function safeOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function safeCount(value: unknown): number {
  return Math.max(0, Math.floor(safeNumber(value)))
}

function safePositiveInteger(value: unknown): number | undefined {
  const resolvedValue = safeOptionalNumber(value)
  return resolvedValue === undefined
    ? undefined
    : Math.max(1, Math.floor(resolvedValue))
}

function safeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined

  return value.filter((item): item is string => typeof item === 'string')
}

function normalizeQuizSource(value: unknown): QuizSource | undefined {
  return typeof value === 'string' && allowedSources.has(value as QuizSource)
    ? value as QuizSource
    : undefined
}

function normalizeRevealPolicy(value: unknown): QuizRevealPolicy | undefined {
  return typeof value === 'string'
    && allowedRevealPolicies.has(value as QuizRevealPolicy)
    ? value as QuizRevealPolicy
    : undefined
}

export function normalizeQuizzes(rows: any[]): Quiz[] {
  return rows.map((r) => {
    const type: QuizType = r.type === 'spark' ? 'spark' : 'trial'

    return {
      id: String(r.id),
      title: String(r.title ?? 'Untitled'),
      category: String(r.category ?? 'other'),
      type,
      questionsCount: Array.isArray(r.questions)
        ? r.questions.length
        : safeCount(r.questions),
      questions: Array.isArray(r.questions) ? r.questions : [],
      time: safeOptionalNumber(r.time),
      reward: safeNumber(r.reward),
      exp: safeNumber(r.exp),
      source: normalizeQuizSource(r.source),
      ownerId: typeof r.ownerId === 'string' ? r.ownerId : null,
      chapterId: typeof r.chapterId === 'string' ? r.chapterId : undefined,
      slotId: typeof r.slotId === 'string' ? r.slotId : undefined,
      targetFragmentIds: safeStringArray(r.targetFragmentIds),
      maxAttempts: safePositiveInteger(r.maxAttempts),
      revealPolicy: normalizeRevealPolicy(r.revealPolicy),
      createdAt: r.createdAt ?? null,
      description:
        typeof r.description === 'string' ? r.description : undefined,
    }
  })
}
