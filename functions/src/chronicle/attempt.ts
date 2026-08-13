import {FieldValue} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import {db} from "../firebase.js";
import {isCorrectAnswer} from "../quiz/grading.js";
import {asString, asStringArray} from "../shared/validation.js";
import type {
  ChronicleProgressionOutcome,
  ChronicleQuizDocument,
  RecordChronicleQuizAttemptInput,
} from "../types.js";
import {refreshProgressSummary} from "./progress.js";
import {
  discoveryPayloadFromData,
  getNextChronicleDiscoveryAt,
} from "./time.js";

function shouldUnlockFragment(params: {
  quizType?: string;
  attemptNumber: number;
  correct: boolean;
}): boolean {
  if (params.quizType === "trial") {
    return true;
  }

  if (params.correct) {
    return true;
  }

  return params.attemptNumber >= 2;
}

export async function recordChronicleQuizAttemptForUser(
  userId: string,
  input: RecordChronicleQuizAttemptInput
) {
  const quizId = asString(input.quizId, "quizId");
  const answers = input.answers ?? {};
  const quizSnapshot = await db.collection("quizzes").doc(quizId).get();

  if (!quizSnapshot.exists) {
    throw new HttpsError("not-found", "Quiz was not found.");
  }

  const quiz = {
    id: quizSnapshot.id,
    ...quizSnapshot.data(),
  } as ChronicleQuizDocument;

  if (quiz.source !== "chronicle") {
    throw new HttpsError(
      "failed-precondition",
      "This quiz is not connected to Chronicles."
    );
  }

  if (quiz.ownerId !== userId) {
    throw new HttpsError(
      "permission-denied",
      "This chronicle quiz belongs to another user."
    );
  }

  const chapterId = asString(quiz.chapterId, "chapterId");
  const slotId = asString(quiz.slotId, "slotId");
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

  if (!questions.length) {
    throw new HttpsError(
      "failed-precondition",
      "This chronicle quiz has no questions."
    );
  }

  const progressRef = db.collection("userChallengeProgress")
    .doc(`${userId}_${slotId}`);
  const chapterProgressRef = db.collection("userChapterProgress")
    .doc(`${userId}_${chapterId}`);
  const [progressSnapshot, chapterProgressSnapshot] = await Promise.all([
    progressRef.get(),
    chapterProgressRef.get(),
  ]);
  const progress = progressSnapshot.data() ?? {};
  const chapterProgress = chapterProgressSnapshot.data() ?? {};
  const attemptsUsed = Number(progress.attemptsUsed ?? 0);
  const maxAttempts = Number(
    progress.maxAttempts ?? quiz.maxAttempts ?? (quiz.type === "trial" ? 1 : 3)
  );
  const sessionId = typeof input.sessionId === "string" ?
    input.sessionId.trim() :
    "";

  if (sessionId && progress.lastSessionId === sessionId) {
    const discovery = discoveryPayloadFromData(
      chapterProgress.pendingDiscovery
    );
    return {
      quizId,
      slotId,
      alreadyRecorded: true,
      attemptsUsed,
      maxAttempts,
      completed: progress.status === "completed" ||
        progress.status === "archived",
      nextAction: discovery ? "discovery_search" as const : "none" as const,
      ...(discovery ? {discovery} : {}),
    };
  }

  if (attemptsUsed >= maxAttempts) {
    return {
      quizId,
      slotId,
      alreadyCompleted: true,
      attemptsUsed,
      maxAttempts,
      nextAction: "none" as const,
    };
  }

  const attemptNumber = attemptsUsed + 1;
  const batch = db.batch();
  const affectedFragmentIds = new Set<string>();
  const sourceQuestionIds = questions.map((question) =>
    question.sourceQuestionId ?? question.id
  );
  const [userSnapshot, previousStatsSnapshots] = await Promise.all([
    db.collection("users").doc(userId).get(),
    Promise.all(sourceQuestionIds.map((questionId) =>
      db.collection("userQuestionStats").doc(`${userId}_${questionId}`).get()
    )),
  ]);
  const previousStatsByQuestionId = new Map(
    previousStatsSnapshots.map((snapshot) => [snapshot.id, snapshot.data()])
  );
  const userData = userSnapshot.data() ?? {};
  const userStats = typeof userData.stats === "object" &&
    userData.stats !== null ?
    userData.stats as Record<string, unknown> :
    {};
  let currentCorrectStreak = Number(
    userStats.currentCorrectStreak ?? userData.currentCorrectStreak ?? 0
  );
  let bestCorrectStreak = Number(
    userStats.bestCorrectStreak ?? userData.bestCorrectStreak ?? 0
  );
  let fixedMistakes = 0;
  let correctCount = 0;
  const learningPathQuiz = typeof quiz.passScore === "number";

  for (const question of questions) {
    const questionId = question.sourceQuestionId ?? question.id;
    const userAnswer = answers[question.id] ?? answers[questionId];
    const correct = isCorrectAnswer(question, userAnswer);
    const previousStats = previousStatsByQuestionId.get(
      `${userId}_${questionId}`
    );

    if (correct) {
      correctCount += 1;
      currentCorrectStreak += 1;
      bestCorrectStreak = Math.max(bestCorrectStreak, currentCorrectStreak);

      if (previousStats?.lastCorrect === false) {
        fixedMistakes += 1;
      }
    } else {
      currentCorrectStreak = 0;
    }

    const linkedFragmentIds = question.linkedFragmentIds?.length ?
      question.linkedFragmentIds :
      [question.primaryFragmentId];

    const cleanFragmentIds = linkedFragmentIds.filter((fragmentId) =>
      typeof fragmentId === "string" && fragmentId.trim()
    );

    const statsRef = db.collection("userQuestionStats")
      .doc(`${userId}_${questionId}`);

    batch.set(statsRef, {
      userId,
      questionId,
      chapterId,
      primaryFragmentId: question.primaryFragmentId,
      linkedFragmentIds: cleanFragmentIds,
      attempts: FieldValue.increment(1),
      correct: FieldValue.increment(correct ? 1 : 0),
      lastCorrect: correct,
      lastAnsweredAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    for (const fragmentId of cleanFragmentIds) {
      affectedFragmentIds.add(fragmentId);
      const fragmentRef = db.collection("userFragmentProgress")
        .doc(`${userId}_${fragmentId}`);
      const shouldUnlock = !learningPathQuiz && shouldUnlockFragment({
        quizType: quiz.type,
        attemptNumber,
        correct,
      });

      batch.set(fragmentRef, {
        userId,
        fragmentId,
        chapterId,
        answered: FieldValue.increment(1),
        correct: FieldValue.increment(correct ? 1 : 0),
        ...(shouldUnlock ? {unlocked: true} : {}),
        updatedAt: FieldValue.serverTimestamp(),
      }, {merge: true});
    }
  }

  batch.set(db.collection("users").doc(userId), {
    stats: {
      currentCorrectStreak,
      bestCorrectStreak,
      mistakesFixed: FieldValue.increment(fixedMistakes),
    },
    currentCorrectStreak,
    bestCorrectStreak,
    mistakesFixed: FieldValue.increment(fixedMistakes),
  }, {merge: true});

  const percentage = Math.round((correctCount / questions.length) * 100);
  const passed = learningPathQuiz ?
    percentage >= Number(quiz.passScore) :
    percentage >= 100;

  let progressionOutcome: ChronicleProgressionOutcome = {nextAction: "none"};
  const nextFragmentId = learningPathQuiz && passed ?
    asStringArray(quiz.unlockFragmentIds)[0] :
    undefined;

  if (nextFragmentId) {
    const readyAt = getNextChronicleDiscoveryAt();
    batch.set(chapterProgressRef, {
      userId,
      chapterId,
      pendingDiscovery: {
        fragmentId: nextFragmentId,
        readyAt,
        startedAt: FieldValue.serverTimestamp(),
        sourceType: "spark",
        sourceId: slotId,
      },
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
    progressionOutcome = {
      nextAction: "discovery_search",
      discovery: {
        fragmentId: nextFragmentId,
        readyAt: readyAt.toDate().toISOString(),
      },
    };
  } else if (learningPathQuiz && passed && quiz.type === "trial") {
    progressionOutcome = {nextAction: "chapter_completed"};
  } else if (learningPathQuiz && passed) {
    const reconstructionSnapshot = await db.collection("reconstructions")
      .where("chapterId", "==", chapterId)
      .get();
    const reconstructionFollows = reconstructionSnapshot.docs.some((doc) =>
      asStringArray(doc.data().requiredChallengeSlotIds).includes(slotId)
    );
    progressionOutcome = {
      nextAction: reconstructionFollows ? "reconstruction" : "trial",
    };
  }
  const bestScore = Math.max(Number(progress.bestScore ?? 0), percentage);
  const completed = passed || attemptNumber >= maxAttempts;

  batch.set(progressRef, {
    userId,
    chapterId,
    slotId,
    quizId,
    status: completed ? "completed" : "in_progress",
    attemptsUsed: attemptNumber,
    maxAttempts,
    bestScore,
    lastScore: percentage,
    lastSessionId: sessionId || null,
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});

  await batch.commit();
  await refreshProgressSummary({
    userId,
    chapterId,
    affectedFragmentIds: [...affectedFragmentIds],
  });

  if (quiz.type === "trial" && percentage >= 100) {
    await db.collection("userChapterProgress")
      .doc(`${userId}_${chapterId}`)
      .set({
        userId,
        chapterId,
        status: "completed",
        trialUnlocked: true,
        trialCompleted: true,
        trialQuizId: quizId,
        trialScore: percentage,
        trialBestScore: bestScore,
        trialCompletedAt: FieldValue.serverTimestamp(),
        completed: true,
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, {merge: true});
  }

  return {
    quizId,
    slotId,
    attemptNumber,
    maxAttempts,
    score: correctCount,
    total: questions.length,
    percentage,
    completed,
    ...progressionOutcome,
  };
}
