import type {ChronicleQuestion} from "../types.js";

export function buildQuizQuestion(question: ChronicleQuestion) {
  const quizQuestion: Partial<ChronicleQuestion> = {...question};
  delete quizQuestion.chapterId;

  return quizQuestion;
}

function normalizeAnswer(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function getCorrectAnswerValue(question: ChronicleQuestion): unknown {
  if (question.type === "single_answer") {
    return typeof question.correctOptionIndex === "number" ?
      question.options?.[question.correctOptionIndex] :
      undefined;
  }

  if (question.type === "multiple_choice") {
    return Array.isArray(question.correctOptionIndexes) ?
      question.correctOptionIndexes
        .map((index) => question.options?.[index])
        .filter((option): option is string => typeof option === "string") :
      [];
  }

  return question.correctAnswer;
}

export function isCorrectAnswer(
  question: ChronicleQuestion,
  userAnswer: unknown
): boolean {
  const correctAnswer = getCorrectAnswerValue(question);

  if (question.type === "multiple_choice") {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
      return false;
    }

    const selected = userAnswer.map(normalizeAnswer).sort();
    const correct = correctAnswer.map(normalizeAnswer).sort();

    return selected.length === correct.length &&
      selected.every((answer, index) => answer === correct[index]);
  }

  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}

export function isAnswerProvided(answer: unknown): boolean {
  if (answer === undefined || answer === null) return false;
  if (typeof answer === "string") return Boolean(answer.trim());
  if (Array.isArray(answer)) return answer.length > 0;
  return true;
}

export function getQuizRewardMultiplier(attempt: number): number {
  if (attempt <= 1) return 1;
  if (attempt === 2) return 0.5;
  if (attempt === 3) return 0.25;
  return 0;
}

export function toSafeNonNegativeNumber(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}
