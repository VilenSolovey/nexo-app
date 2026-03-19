export function getQuizDurationSeconds(quiz: {
  time?: number | null
  questionsCount?: number | null
  questions?: unknown[] | null
}): number {
  if (typeof quiz.time === 'number' && Number.isFinite(quiz.time) && quiz.time > 0) {
    return quiz.time
  }

  const questionsCount = Array.isArray(quiz.questions)
    ? quiz.questions.length
    : Number(quiz.questionsCount ?? 0)

  return Math.max(questionsCount, 0) * 30
}

export function formatQuizDurationShort(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}с`

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (seconds === 0) return `${minutes} хв`

  return `${minutes} хв ${seconds}с`
}
