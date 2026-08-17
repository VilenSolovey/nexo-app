import type { Quiz, RecentItem } from '@nexo/types/quiz.types'
import type { QuizResult, UserQuizProgress } from '@nexo/types/result.types'
import { isQuizProgressCompleted, toMillis } from '@nexo/utils/quiz-progress'

export function toCompletedQuizItems(
  quizzes: Quiz[],
  progressList: UserQuizProgress[],
  results: QuizResult[],
  limit?: number,
): RecentItem[] {
  const progressIndex = new Map(progressList.map((progress) => [progress.quizId, progress]))
  const latestResultIndex = new Map<string, QuizResult>()

  for (const result of results) {
    const current = latestResultIndex.get(result.quizId)
    const resultTime = toMillis(result.completedAt) ?? 0
    const currentTime = toMillis(current?.completedAt) ?? 0
    if (!current || resultTime > currentTime) {
      latestResultIndex.set(result.quizId, result)
    }
  }

  const items = quizzes
    .filter((quiz) => isQuizProgressCompleted(progressIndex.get(quiz.id), quiz.maxAttempts))
    .sort((first, second) => {
      const firstTime = toMillis(progressIndex.get(first.id)?.lastPlayedAt) ?? 0
      const secondTime = toMillis(progressIndex.get(second.id)?.lastPlayedAt) ?? 0
      return secondTime - firstTime
    })
    .map((quiz) => {
      const progress = progressIndex.get(quiz.id)
      const latestResult = latestResultIndex.get(quiz.id)
      const completedAtMs = toMillis(latestResult?.completedAt) ??
        toMillis(progress?.lastPlayedAt) ??
        0

      return {
        ...quiz,
        completedAt: Math.floor(completedAtMs / 1000),
        score: progress?.officialScore ?? progress?.bestScore ?? 0,
        total: quiz.questionsCount,
        attempts: progress?.attempts ?? 0,
        rewardEarned: latestResult?.earnedCoins ?? 0,
      }
    })

  return typeof limit === 'number' ? items.slice(0, limit) : items
}
