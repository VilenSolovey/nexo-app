import type { QuizAnswerDetail } from "@nexo/types/result.types"

export function normalizeQuestionType(question: any) {
  return String(question?.type || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
}

export function getCorrectAnswerValue(question: any): unknown {
  if (question?.correctAnswer !== undefined) {
    return question.correctAnswer
  }

  if (
    Array.isArray(question?.correctOptionIndexes) &&
    Array.isArray(question?.options)
  ) {
    return question.correctOptionIndexes
      .map((index: number) => question.options[index])
      .filter((value: string | undefined) => value !== undefined)
  }

  if (
    Array.isArray(question?.options) &&
    typeof question?.correctOptionIndex === "number"
  ) {
    return question.options[question.correctOptionIndex]
  }

  return undefined
}

export function isAnswerProvided(answer: unknown) {
  if (typeof answer === "boolean") return true
  if (Array.isArray(answer)) return answer.length > 0
  if (typeof answer === "string") return answer.trim().length > 0
  return answer !== undefined && answer !== null
}

function normalizeAnswer(answer: unknown) {
  return String(answer).toLowerCase().trim()
}

export function isCorrectAnswer(question: any, userAnswer: unknown) {
  const correctAnswer = getCorrectAnswerValue(question)

  if (!isAnswerProvided(userAnswer) || correctAnswer === undefined || correctAnswer === null) {
    return false
  }

  const normalizedType = normalizeQuestionType(question)

  if (normalizedType === "multiple_choice") {
    const selectedAnswers = Array.isArray(userAnswer)
      ? [...userAnswer].map(normalizeAnswer).sort()
      : [normalizeAnswer(userAnswer)]
    const normalizedCorrectAnswers = Array.isArray(correctAnswer)
      ? [...correctAnswer].map(normalizeAnswer).sort()
      : [normalizeAnswer(correctAnswer)]

    if (selectedAnswers.length !== normalizedCorrectAnswers.length) {
      return false
    }

    return selectedAnswers.every((answer, index) => answer === normalizedCorrectAnswers[index])
  }

  if (normalizedType === "fill_blank" || normalizedType === "single_answer") {
    return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)
  }

  return userAnswer === correctAnswer
}

export function buildQuizAnswerDetails(
  quiz: any,
  answers: Record<string, unknown> | null,
): QuizAnswerDetail[] {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : []
  const resolvedAnswers = answers ?? {}

  return questions.map((question: any, index: number) => {
    const questionId = String(question?.id ?? `question_${index + 1}`)
    const userAnswer = resolvedAnswers[questionId] ?? null
    const correctAnswer = getCorrectAnswerValue(question) ?? null

    return {
      questionId,
      questionText: String(question?.question ?? ""),
      type: normalizeQuestionType(question),
      userAnswer,
      correctAnswer,
      correct: isCorrectAnswer(question, userAnswer),
      answered: isAnswerProvided(userAnswer),
      options: Array.isArray(question?.options)
        ? question.options.map((option: unknown) => String(option))
        : null,
      explanation: typeof question?.explanation === "string"
        ? question.explanation
        : null,
    }
  })
}
