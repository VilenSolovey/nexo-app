import {FieldValue} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import {db} from "../firebase.js";
import {buildQuizQuestion} from "../quiz/grading.js";
import {asString, asStringArray} from "../shared/validation.js";
import type {
  ChallengeSlot,
  ChronicleQuestion,
  CreateChronicleQuizInput,
  UserQuestionStats,
} from "../types.js";
import {getTrialUnlockStateForUser} from "./progress.js";
import {toMillis} from "./time.js";

const PRACTICE_REWARD_PER_QUESTION = 4;
const PRACTICE_EXP_PER_QUESTION = 3;
const TRIAL_REWARD_PER_QUESTION = 5;
const TRIAL_EXP_PER_QUESTION = 3.5;

function assertSlotOpen(slot: ChallengeSlot): void {
  const now = Date.now();
  const opensAt = toMillis(slot.opensAt) ?? 0;
  const closesAt = toMillis(slot.closesAt) ?? Number.POSITIVE_INFINITY;

  if (opensAt > now) {
    throw new HttpsError(
      "failed-precondition",
      "Challenge slot is not open yet."
    );
  }

  if (closesAt < now) {
    throw new HttpsError(
      "failed-precondition",
      "Challenge slot is already closed."
    );
  }
}

function pickWeightedQuestions(params: {
  questions: ChronicleQuestion[];
  statsByQuestionId: Map<string, UserQuestionStats>;
  targetFragmentIds: string[];
  count: number;
}): ChronicleQuestion[] {
  const targetFragmentIds = new Set(params.targetFragmentIds);

  return params.questions
    .map((question) => {
      const stats = params.statsByQuestionId.get(question.id);
      const attempts = stats?.attempts ?? 0;
      const correct = stats?.correct ?? 0;
      const accuracy = attempts > 0 ? correct / attempts : 0;
      const isTarget = targetFragmentIds.has(question.primaryFragmentId);
      const isWeak = attempts > 0 && accuracy < 0.8;
      const isNew = attempts === 0;
      const randomTieBreaker = Math.random() * 10;

      const score =
        (isTarget ? 50 : 0) +
        (isNew ? 35 : 0) +
        (isWeak ? 25 : 0) -
        attempts * 2 +
        randomTieBreaker;

      return {question, score};
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, params.count)
    .map((item) => item.question);
}

function getChronicleQuizEconomy(params: {
  quizType: string;
  questionCount: number;
}) {
  const safeQuestionCount = Math.max(1, params.questionCount);
  const isTrial = params.quizType === "trial";
  const rewardPerQuestion = isTrial ?
    TRIAL_REWARD_PER_QUESTION :
    PRACTICE_REWARD_PER_QUESTION;
  const expPerQuestion = isTrial ?
    TRIAL_EXP_PER_QUESTION :
    PRACTICE_EXP_PER_QUESTION;

  return {
    reward: Math.round(safeQuestionCount * rewardPerQuestion),
    exp: Math.round(safeQuestionCount * expPerQuestion),
  };
}

async function getQuestionStats(
  userId: string,
  chapterId: string
): Promise<Map<string, UserQuestionStats>> {
  const snapshot = await db.collection("userQuestionStats")
    .where("userId", "==", userId)
    .where("chapterId", "==", chapterId)
    .get();

  return new Map(
    snapshot.docs.map((doc) => [doc.data().questionId, doc.data()])
  );
}

async function getSlot(slotId: string): Promise<ChallengeSlot> {
  const snapshot = await db.collection("challengeSlots").doc(slotId).get();

  if (!snapshot.exists) {
    throw new HttpsError("not-found", "Challenge slot was not found.");
  }

  return {id: snapshot.id, ...snapshot.data()} as ChallengeSlot;
}

async function getActiveChapterQuestions(
  chapterId: string
): Promise<ChronicleQuestion[]> {
  const snapshot = await db.collection("questions")
    .where("chapterId", "==", chapterId)
    .where("active", "==", true)
    .get();

  return snapshot.docs
    .map((doc) => ({id: doc.id, ...doc.data()} as ChronicleQuestion));
}

function getSafeMaxAttempts(slot: ChallengeSlot, quizType: string): number {
  return Number(slot.maxAttempts ?? (quizType === "trial" ? 1 : 3));
}

function isSparkRetryEligible(params: {
  slot: ChallengeSlot;
  progress: Record<string, unknown>;
}): boolean {
  if (params.slot.type === "trial_gate") return false;

  const maxAttempts = Number(
    params.progress.maxAttempts ?? params.slot.maxAttempts ?? 3
  );
  const attemptsUsed = Number(params.progress.attemptsUsed ?? 0);
  const bestScore = Number(params.progress.bestScore ?? 0);
  const passScore = Number(params.slot.passScore ?? 70);

  return params.progress.status === "retry_ready" ||
    (attemptsUsed >= maxAttempts && bestScore < passScore);
}

function getChronicleQuizId(params: {
  slotId: string;
  userId: string;
  rerollCount: number;
}) {
  const baseId = `chronicle_${params.slotId}_${params.userId}`;
  return params.rerollCount > 0 ? `${baseId}_r${params.rerollCount}` : baseId;
}

export async function createChronicleQuizForUser(
  userId: string,
  input: CreateChronicleQuizInput
) {
  const chapterId = asString(input.chapterId, "chapterId");
  const slotId = asString(input.slotId, "slotId");
  const slot = await getSlot(slotId);

  if (slot.chapterId !== chapterId) {
    throw new HttpsError(
      "failed-precondition",
      "Challenge slot does not belong to this chapter."
    );
  }

  assertSlotOpen(slot);

  const progressRef = db.collection("userChallengeProgress")
    .doc(`${userId}_${slotId}`);
  const existingProgress = await progressRef.get();
  const existingProgressData = existingProgress.data() ?? {};
  const existingQuizId = existingProgressData.quizId;

  if (
    typeof existingQuizId === "string" &&
    existingQuizId.trim() &&
    !isSparkRetryEligible({slot, progress: existingProgressData})
  ) {
    return {
      quizId: existingQuizId,
      alreadyCreated: true,
    };
  }

  const count = Math.min(
    Math.max(Number(slot.questionCount ?? 5), 1),
    10
  );
  const studyFragmentIds = asStringArray(slot.studyFragmentIds);
  const quizFragmentIds = asStringArray(slot.quizFragmentIds);
  const legacyTargetFragmentIds = asStringArray(slot.targetFragmentIds);
  const targetFragmentIds = legacyTargetFragmentIds;
  const quizPoolFragmentIds = quizFragmentIds.length ?
    quizFragmentIds :
    legacyTargetFragmentIds;
  const unlockFragmentIds = asStringArray(slot.unlockFragmentIds);
  const usesLearningPath = Boolean(
    studyFragmentIds.length ||
    quizFragmentIds.length ||
    unlockFragmentIds.length
  );

  if (studyFragmentIds.length) {
    const studyProgress = await Promise.all(studyFragmentIds.map((fragmentId) =>
      db.collection("userFragmentProgress").doc(`${userId}_${fragmentId}`).get()
    ));
    const unreadCount = studyProgress.filter((snapshot) =>
      snapshot.data()?.read !== true
    ).length;

    if (unreadCount > 0) {
      throw new HttpsError(
        "failed-precondition",
        "Спочатку позначте теорію цього блоку як прочитану."
      );
    }
  }

  const [questions, statsByQuestionId] = await Promise.all([
    getActiveChapterQuestions(chapterId),
    getQuestionStats(userId, chapterId),
  ]);

  if (!questions.length) {
    throw new HttpsError(
      "not-found",
      "No active questions found for this chapter."
    );
  }

  const eligibleQuestions = quizFragmentIds.length ?
    questions.filter((question) =>
      quizPoolFragmentIds.includes(question.primaryFragmentId)
    ) :
    questions;

  if (!eligibleQuestions.length) {
    throw new HttpsError(
      "not-found",
      "Для цього блоку теорії ще немає активних питань."
    );
  }

  const selectedQuestions = pickWeightedQuestions({
    questions: eligibleQuestions,
    statsByQuestionId,
    targetFragmentIds,
    count,
  });
  const quizType = slot.type === "trial_gate" ? "trial" : "spark";
  const isRetry = isSparkRetryEligible({slot, progress: existingProgressData});
  const rerollCount = isRetry ?
    Number(existingProgressData.rerollCount ?? 0) + 1 :
    Number(existingProgressData.rerollCount ?? 0);
  const quizRef = db.collection("quizzes")
    .doc(getChronicleQuizId({slotId, userId, rerollCount}));

  if (quizType === "trial") {
    const unlockState = await getTrialUnlockStateForUser(userId, chapterId);

    if (!unlockState.trialUnlocked) {
      throw new HttpsError(
        "failed-precondition",
        "Trial is not unlocked yet."
      );
    }
  }

  const {reward, exp} = getChronicleQuizEconomy({
    quizType,
    questionCount: selectedQuestions.length,
  });

  await quizRef.set({
    title: slot.title ?? "Виклик Хроніки",
    description: slot.description ??
      "Виклик, створений із поточної хроніки.",
    category: "Хроніка",
    type: quizType,
    questionsCount: selectedQuestions.length,
    questions: selectedQuestions.map(buildQuizQuestion),
    reward,
    exp,
    time: Math.max(selectedQuestions.length * 60, 180),
    source: "chronicle",
    ownerId: userId,
    chapterId,
    slotId,
    targetFragmentIds,
    studyFragmentIds,
    quizFragmentIds: quizPoolFragmentIds,
    unlockFragmentIds,
    passScore: usesLearningPath ?
      Math.min(Math.max(Number(slot.passScore ?? 70), 1), 100) :
      null,
    maxAttempts: getSafeMaxAttempts(slot, quizType),
    rerollCount,
    revealPolicy: quizType === "trial" ? "full_after_first" : "staged",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await progressRef.set({
    userId,
    chapterId,
    slotId,
    quizId: quizRef.id,
    status: "created",
    attemptsUsed: 0,
    maxAttempts: getSafeMaxAttempts(slot, quizType),
    rerollCount,
    ...(isRetry ? {
      previousQuizId: typeof existingQuizId === "string" ?
        existingQuizId :
        null,
      retriedAt: FieldValue.serverTimestamp(),
    } : {}),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});

  return {
    quizId: quizRef.id,
    alreadyCreated: false,
    retried: isRetry,
  };
}
