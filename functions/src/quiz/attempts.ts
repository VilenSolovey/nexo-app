import {FieldValue} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import {getLevelFromExp} from "../achievements.js";
import {recordChronicleQuizAttemptForUser} from "../chronicle/attempt.js";
import {db} from "../firebase.js";
import {asString} from "../shared/validation.js";
import type {
  ChronicleQuizDocument,
  FinalizedQuizResult,
  FinalizeQuizAttemptInput,
} from "../types.js";
import {
  getCorrectAnswerValue,
  getQuizRewardMultiplier,
  isAnswerProvided,
  isCorrectAnswer,
  toSafeNonNegativeNumber,
} from "./grading.js";

function finalizedResultFromData(
  quizId: string,
  sessionId: string,
  data: Record<string, unknown>
): FinalizedQuizResult {
  return {
    quizId,
    sessionId,
    source: typeof data.source === "string" ? data.source : null,
    correctCount: Number(data.score ?? 0),
    totalCount: Number(data.total ?? 0),
    percentage: Number(data.percentage ?? 0),
    passed: data.passed === true,
    attempt: Number(data.attempt ?? 1),
    maxAttempts: Number(data.maxAttempts ?? 3),
    mastered: data.mastered === true,
    canRetake: data.canRetake === true,
    rewardMultiplier: Number(data.rewardMultiplier ?? 0),
    coinsBoostMultiplier: Number(data.coinsBoostMultiplier ?? 1),
    expBoostMultiplier: Number(data.expBoostMultiplier ?? 1),
    baseCoins: Number(data.baseCoins ?? 0),
    baseExp: Number(data.baseExp ?? 0),
    earnedCoins: Number(data.earnedCoins ?? 0),
    earnedExp: Number(data.earnedExp ?? 0),
  };
}

export async function finalizeQuizAttemptForUser(
  userId: string,
  input: FinalizeQuizAttemptInput
) {
  const quizId = asString(input.quizId, "quizId");
  const sessionId = asString(input.sessionId, "sessionId");
  if (
    typeof input.answers !== "object" ||
    input.answers === null ||
    Array.isArray(input.answers)
  ) {
    throw new HttpsError("invalid-argument", "answers must be an object.");
  }
  const answers = input.answers;
  const quizRef = db.collection("quizzes").doc(quizId);
  const sessionRef = db.collection("quizSessions").doc(sessionId);
  const resultRef = db.collection("results").doc(sessionId);
  const progressRef = db.collection("userQuizProgress")
    .doc(`${userId}_${quizId}`);
  const userRef = db.collection("users").doc(userId);

  const finalized = await db.runTransaction(async (transaction) => {
    const [
      quizSnapshot,
      sessionSnapshot,
      resultSnapshot,
      progressSnapshot,
      userSnapshot,
    ] = await Promise.all([
      transaction.get(quizRef),
      transaction.get(sessionRef),
      transaction.get(resultRef),
      transaction.get(progressRef),
      transaction.get(userRef),
    ]);

    if (!quizSnapshot.exists) {
      throw new HttpsError("not-found", "Quiz was not found.");
    }
    if (!sessionSnapshot.exists) {
      throw new HttpsError(
        "failed-precondition",
        "Quiz session was not found."
      );
    }
    if (!userSnapshot.exists) {
      throw new HttpsError("not-found", "User profile was not found.");
    }

    const quiz = {
      id: quizSnapshot.id,
      ...quizSnapshot.data(),
    } as ChronicleQuizDocument;
    const session = sessionSnapshot.data() ?? {};
    if (session.userId !== userId || session.quizId !== quizId) {
      throw new HttpsError(
        "permission-denied",
        "Quiz session belongs to another user or quiz."
      );
    }
    if (typeof quiz.ownerId === "string" && quiz.ownerId !== userId) {
      throw new HttpsError(
        "permission-denied",
        "This quiz belongs to another user."
      );
    }

    if (resultSnapshot.exists) {
      const resultData = resultSnapshot.data() ?? {};
      const savedAnswers = typeof resultData.answers === "object" &&
        resultData.answers !== null &&
        !Array.isArray(resultData.answers) ?
        resultData.answers as Record<string, unknown> :
        {};
      return {
        result: finalizedResultFromData(quizId, sessionId, resultData),
        answers: savedAnswers,
      };
    }

    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    if (!questions.length) {
      throw new HttpsError(
        "failed-precondition",
        "This quiz has no questions."
      );
    }

    const previousProgress = progressSnapshot.data() ?? {};
    const previousAttempts = Number(previousProgress.attempts ?? 0);
    const maxAttempts = Math.max(1, Number(quiz.maxAttempts ?? 3));
    if (previousAttempts >= maxAttempts) {
      throw new HttpsError(
        "failed-precondition",
        "All attempts for this quiz have already been used."
      );
    }

    const answerDetails = questions.map((question) => {
      const userAnswer = answers[question.id];
      return {
        questionId: question.id,
        questionText: question.question,
        type: question.type,
        userAnswer: userAnswer ?? null,
        correctAnswer: getCorrectAnswerValue(question) ?? null,
        correct: isCorrectAnswer(question, userAnswer),
        answered: isAnswerProvided(userAnswer),
        options: Array.isArray(question.options) ? question.options : null,
        explanation: question.explanation ?? null,
      };
    });
    const correctCount = answerDetails.filter(
      (answer) => answer.correct
    ).length;
    const totalCount = questions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);
    const passScore = typeof quiz.passScore === "number" ?
      quiz.passScore :
      100;
    const quitEarly = input.quitEarly === true;
    const passed = !quitEarly && percentage >= passScore;
    const attempt = previousAttempts + 1;
    const rewardMultiplier = getQuizRewardMultiplier(attempt);
    const coinsBoostMultiplier = session.coinsBoostMultiplier === 2 ? 2 : 1;
    const expBoostMultiplier = session.expBoostMultiplier === 2 ? 2 : 1;
    const baseCoins = toSafeNonNegativeNumber(quiz.coinReward ?? quiz.reward);
    const baseExp = toSafeNonNegativeNumber(quiz.expReward ?? quiz.exp);
    const earnedCoins = passed ? Math.floor(
      baseCoins * coinsBoostMultiplier * rewardMultiplier
    ) : 0;
    const earnedExp = passed ? Math.floor(
      baseExp * expBoostMultiplier * rewardMultiplier
    ) : 0;
    const previousBestScore = Number(previousProgress.bestScore ?? 0);
    const mastered = previousProgress.completed === true ||
      passed || attempt >= maxAttempts;
    const canRetake = !mastered;
    const user = userSnapshot.data() ?? {};
    const currentCoins = Number(user.coins ?? 0);
    const currentExp = Number(user.exp ?? 0);
    const nextCoins = Math.max(0, currentCoins + earnedCoins);
    const nextExp = Math.max(0, currentExp + earnedExp);
    const result: FinalizedQuizResult = {
      quizId,
      sessionId,
      source: quiz.source ?? null,
      correctCount,
      totalCount,
      percentage,
      passed,
      attempt,
      maxAttempts,
      mastered,
      canRetake,
      rewardMultiplier,
      coinsBoostMultiplier,
      expBoostMultiplier,
      baseCoins,
      baseExp,
      earnedCoins,
      earnedExp,
    };

    transaction.set(resultRef, {
      userId,
      quizId,
      sessionId,
      source: result.source,
      score: correctCount,
      total: totalCount,
      percentage,
      passed,
      attempt,
      maxAttempts,
      mastered,
      canRetake,
      rewardMultiplier,
      coinsBoostMultiplier,
      expBoostMultiplier,
      baseCoins,
      baseExp,
      earnedCoins,
      earnedExp,
      timeSpent: toSafeNonNegativeNumber(input.timeSpent),
      timeExpired: input.timeExpired === true,
      quitEarly,
      leftAppDuringQuiz: toSafeNonNegativeNumber(input.backgroundCount) > 0,
      backgroundCount: toSafeNonNegativeNumber(input.backgroundCount),
      backgroundDurationMs:
        toSafeNonNegativeNumber(input.backgroundDurationMs),
      answers,
      answerDetails,
      completedAt: FieldValue.serverTimestamp(),
    });
    transaction.set(progressRef, {
      userId,
      quizId,
      attempts: attempt,
      passedCount: Number(previousProgress.passedCount ?? 0) +
        (passed ? 1 : 0),
      officialScore: progressSnapshot.exists ?
        Number(previousProgress.officialScore ?? percentage) :
        percentage,
      officialPassed: progressSnapshot.exists ?
        previousProgress.officialPassed === true :
        passed,
      bestScore: Math.max(previousBestScore, percentage),
      completed: mastered,
      rewardClaimed: previousProgress.rewardClaimed === true ||
        earnedCoins > 0 || earnedExp > 0,
      lastPlayedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
    transaction.update(userRef, {
      coins: nextCoins,
      exp: nextExp,
      level: getLevelFromExp(nextExp),
    });
    transaction.set(sessionRef, {
      status: "completed",
      currentAppState: "completed",
      score: correctCount,
      total: totalCount,
      percentage,
      passed,
      timeSpent: toSafeNonNegativeNumber(input.timeSpent),
      timeExpired: input.timeExpired === true,
      quitEarly,
      backgroundCount: toSafeNonNegativeNumber(input.backgroundCount),
      backgroundDurationMs:
        toSafeNonNegativeNumber(input.backgroundDurationMs),
      leftAppDuringQuiz: toSafeNonNegativeNumber(input.backgroundCount) > 0,
      completedAt: FieldValue.serverTimestamp(),
      lastActivityAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    return {result, answers};
  });

  if (finalized.result.source === "chronicle") {
    const chronicleOutcome = await recordChronicleQuizAttemptForUser(userId, {
      quizId,
      sessionId,
      answers: finalized.answers,
    });
    return {
      ...finalized.result,
      chronicleOutcome: {
        nextAction: chronicleOutcome.nextAction ?? "none",
        ...("discovery" in chronicleOutcome && chronicleOutcome.discovery ? {
          discovery: chronicleOutcome.discovery,
        } : {}),
      },
    };
  }

  return finalized.result;
}
