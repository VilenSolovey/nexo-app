import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {
  FieldValue,
  Timestamp,
  getFirestore,
} from "firebase-admin/firestore";
import {setGlobalOptions} from "firebase-functions/v2";
import {HttpsError, onRequest} from "firebase-functions/v2/https";
import {
  getAchievementDefinitions,
  getLevelFromExp,
  type AchievementDefinition,
  type AchievementMetric,
} from "./achievements.js";

initializeApp();

setGlobalOptions({
  maxInstances: 5,
  region: "europe-west1",
});

const db = getFirestore();

type QuestionType = "single_answer" | "multiple_choice" | "true_false" |
  "fill_blank";

type ChronicleQuestion = {
  id: string;
  sourceQuestionId?: string;
  chapterId: string;
  primaryFragmentId: string;
  linkedFragmentIds?: string[];
  difficulty?: number;
  active?: boolean;
  type: QuestionType;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  correctOptionIndexes?: number[];
  correctAnswer?: boolean | string;
  explanation?: string;
};

type UserQuestionStats = {
  attempts?: number;
  correct?: number;
  lastCorrect?: boolean;
};

type ChallengeSlot = {
  id: string;
  chapterId?: string;
  title?: string;
  description?: string;
  type?: string;
  questionCount?: number;
  targetFragmentIds?: unknown[];
  opensAt?: unknown;
  closesAt?: unknown;
  maxAttempts?: number;
};

type CreateChronicleQuizInput = {
  chapterId?: string;
  slotId?: string;
};

type RecordChronicleQuizAttemptInput = {
  quizId?: string;
  answers?: Record<string, unknown>;
  sessionId?: string;
};

type ChronicleQuizDocument = {
  id: string;
  source?: string;
  ownerId?: string;
  chapterId?: string;
  slotId?: string;
  type?: string;
  questions?: ChronicleQuestion[];
  maxAttempts?: number;
};

type QuizResultDocument = {
  quizId?: string;
  score?: number;
  total?: number;
};

type UserChapterProgressDocument = {
  completed?: boolean;
  answered?: number;
  accuracyPercent?: number;
};

type UserFragmentProgressDocument = {
  unlocked?: boolean;
};

type UserChallengeProgressDocument = {
  status?: string;
  bestScore?: number;
};

type TrialUnlockState = {
  answered: number;
  correct: number;
  accuracyPercent: number;
  unlockedFragments: number;
  masteredFragments: number;
  requiredUnlockedFragments: number;
  requiredMasteredFragments: number;
  requiredAnsweredQuestions: number;
  requiredAccuracyPercent: number;
  trialUnlocked: boolean;
};

type AchievementRecord = {
  achievementId: string;
  highestUnlockedTier?: number;
  highestClaimedTier?: number;
  tiers?: Record<string, {
    unlockedAt?: unknown;
    claimedAt?: unknown;
  }>;
};

type ClaimAchievementInput = {
  achievementId?: string;
  tierId?: string;
};

type AchievementMetrics = Record<AchievementMetric, number>;

type HttpRequest = {
  method: string;
  headers: {authorization?: string | string[]};
  body?: {data?: unknown};
};

type HttpResponse = {
  status: (code: number) => {json: (body: unknown) => void};
  json: (body: unknown) => void;
};

const FRAGMENT_MASTERY_MIN_ANSWERS = 2;
const FRAGMENT_MASTERY_MIN_ACCURACY_PERCENT = 75;
const CHRONICLE_PRACTICE_REWARD_PER_QUESTION = 4;
const CHRONICLE_PRACTICE_EXP_PER_QUESTION = 3;
const CHRONICLE_TRIAL_REWARD_PER_QUESTION = 5;
const CHRONICLE_TRIAL_EXP_PER_QUESTION = 3.5;

async function requireRequestUserId(request: HttpRequest): Promise<string> {
  const authorization = Array.isArray(request.headers.authorization) ?
    request.headers.authorization[0] :
    request.headers.authorization;
  const match = authorization?.match(/^Bearer (.+)$/);

  if (!match?.[1]) {
    throw new HttpsError("unauthenticated", "Sign in is required.");
  }

  const decodedToken = await getAuth().verifyIdToken(match[1]);

  return decodedToken.uid;
}

function getHttpStatus(error: unknown): number {
  const code = typeof error === "object" && error !== null && "code" in error ?
    String((error as {code?: unknown}).code) :
    "internal";

  switch (code) {
  case "unauthenticated":
    return 401;
  case "permission-denied":
    return 403;
  case "invalid-argument":
    return 400;
  case "not-found":
    return 404;
  case "failed-precondition":
    return 412;
  default:
    return 500;
  }
}

function getErrorCode(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error ?
    String((error as {code?: unknown}).code) :
    "internal";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal error.";
}

function sendCallableError(response: HttpResponse, error: unknown): void {
  response.status(getHttpStatus(error)).json({
    error: {
      status: getErrorCode(error),
      message: getErrorMessage(error),
    },
  });
}

async function handleHttpFunction<TInput, TResult>(params: {
  request: HttpRequest;
  response: HttpResponse;
  handler: (userId: string, input: TInput) => Promise<TResult>;
  requireTesterAccess?: boolean;
}): Promise<void> {
  if (params.request.method !== "POST") {
    params.response.status(405).json({
      error: {
        status: "invalid-argument",
        message: "Only POST requests are supported.",
      },
    });
    return;
  }

  try {
    const userId = await requireRequestUserId(params.request);
    if (params.requireTesterAccess !== false) {
      await requireTester(userId);
    }
    const result = await params.handler(
      userId,
      (params.request.body?.data ?? {}) as TInput
    );

    params.response.json({result});
  } catch (error) {
    sendCallableError(params.response, error);
  }
}

async function requireTester(userId: string): Promise<void> {
  const snapshot = await db.collection("functionTesters").doc(userId).get();
  const tester = snapshot.data();

  if (!snapshot.exists || tester?.enabled !== true) {
    throw new HttpsError(
      "permission-denied",
      "Chronicle functions are available only for testers."
    );
  }
}

function asString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${fieldName} is required.`);
  }

  return value.trim();
}

async function getAchievementRecords(
  userId: string
): Promise<Map<string, AchievementRecord>> {
  const snapshot = await db.collection("users")
    .doc(userId)
    .collection("achievements")
    .get();

  return new Map(snapshot.docs.map((doc): [string, AchievementRecord] => {
    const data = doc.data() as AchievementRecord;

    return [
      data.achievementId || doc.id,
      {
        achievementId: data.achievementId || doc.id,
        highestUnlockedTier: Number(data.highestUnlockedTier ?? -1),
        highestClaimedTier: Number(data.highestClaimedTier ?? -1),
        tiers: data.tiers ?? {},
      },
    ];
  }));
}

async function getAchievementMetrics(
  userId: string
): Promise<AchievementMetrics> {
  const [userSnapshot, resultsSnapshot] = await Promise.all([
    db.collection("users").doc(userId).get(),
    db.collection("results").where("userId", "==", userId).get(),
  ]);
  const [
    chapterProgressSnapshot,
    fragmentProgressSnapshot,
    challengeProgressSnapshot,
  ] = await Promise.all([
    db.collection("userChapterProgress").where("userId", "==", userId).get(),
    db.collection("userFragmentProgress").where("userId", "==", userId).get(),
    db.collection("userChallengeProgress").where("userId", "==", userId).get(),
  ]);
  const userData = userSnapshot.data() ?? {};
  const userStats = typeof userData.stats === "object" &&
    userData.stats !== null ?
    userData.stats as Record<string, unknown> :
    {};
  const results = resultsSnapshot.docs.map((doc) =>
    doc.data() as QuizResultDocument
  );
  const chapterProgressRows = chapterProgressSnapshot.docs.map((doc) =>
    doc.data() as UserChapterProgressDocument
  );
  const fragmentProgressRows = fragmentProgressSnapshot.docs.map((doc) =>
    doc.data() as UserFragmentProgressDocument
  );
  const challengeProgressRows = challengeProgressSnapshot.docs.map((doc) =>
    doc.data() as UserChallengeProgressDocument
  );
  const uniqueQuizzes = new Set(
    results
      .map((result) => result.quizId)
      .filter((quizId): quizId is string => typeof quizId === "string")
  ).size;
  const perfectScores = results.filter((result) =>
    Number(result.total ?? 0) > 0 &&
    Number(result.score ?? 0) === Number(result.total ?? 0)
  ).length;
  const streakDays = Number(userData.streakDays ?? userData.streak ?? 0);
  const exp = Number(userData.exp ?? 0);
  const level = getLevelFromExp(exp);
  const completedChronicles = chapterProgressRows.filter((progress) =>
    progress.completed === true
  ).length;
  const unlockedFragments = fragmentProgressRows.filter((progress) =>
    progress.unlocked === true
  ).length;
  const masteredChronicles = chapterProgressRows.filter((progress) =>
    Number(progress.answered ?? 0) >= 30 &&
    Number(progress.accuracyPercent ?? 0) >= 80
  ).length;
  const perfectChallenges = challengeProgressRows.filter((progress) =>
    (progress.status === "completed" || progress.status === "archived") &&
    Number(progress.bestScore ?? 0) >= 100
  ).length;
  const mistakesFixed = Number(
    userStats.mistakesFixed ?? userData.mistakesFixed ?? 0
  );
  const bestCorrectStreak = Number(
    userStats.bestCorrectStreak ?? userData.bestCorrectStreak ?? 0
  );

  return {
    uniqueQuizzes,
    perfectScores,
    streakDays,
    level,
    completedChronicles,
    unlockedFragments,
    mistakesFixed,
    bestCorrectStreak,
    masteredChronicles,
    perfectChallenges,
  };
}

async function syncAchievementsForUser(
  userId: string,
  definitions?: AchievementDefinition[]
) {
  const [resolvedDefinitions, metrics, records] = await Promise.all([
    definitions ?? getAchievementDefinitions(db),
    getAchievementMetrics(userId),
    getAchievementRecords(userId),
  ]);

  if (!resolvedDefinitions.length) {
    throw new HttpsError(
      "failed-precondition",
      "No active achievement definitions found."
    );
  }

  const batch = db.batch();
  const unlocked: Array<{achievementId: string; tierId: string}> = [];

  for (const achievement of resolvedDefinitions) {
    const current = metrics[achievement.metric] ?? 0;
    const record = records.get(achievement.id);
    const tiersPayload: Record<string, {unlockedAt: unknown}> = {};
    let highestUnlockedTier = Number(record?.highestUnlockedTier ?? -1);

    achievement.tiers.forEach((tier, index) => {
      const alreadyUnlocked =
        Boolean(record?.tiers?.[tier.id]?.unlockedAt) ||
        highestUnlockedTier >= index;

      if (current < tier.target || alreadyUnlocked) {
        return;
      }

      tiersPayload[tier.id] = {unlockedAt: FieldValue.serverTimestamp()};
      highestUnlockedTier = Math.max(highestUnlockedTier, index);
      unlocked.push({achievementId: achievement.id, tierId: tier.id});
    });

    if (!Object.keys(tiersPayload).length) {
      continue;
    }

    batch.set(
      db.collection("users").doc(userId)
        .collection("achievements").doc(achievement.id),
      {
        achievementId: achievement.id,
        highestUnlockedTier,
        highestClaimedTier: Number(record?.highestClaimedTier ?? -1),
        tiers: tiersPayload,
        updatedAt: FieldValue.serverTimestamp(),
      },
      {merge: true}
    );
  }

  if (unlocked.length > 0) {
    await batch.commit();
  }

  return {
    unlocked,
    unlockedCount: unlocked.length,
    metrics,
  };
}

async function claimAchievementRewardForUser(
  userId: string,
  input: ClaimAchievementInput
) {
  const definitions = await getAchievementDefinitions(db);

  await syncAchievementsForUser(userId, definitions);

  const achievementId = asString(input.achievementId, "achievementId");
  const tierId = asString(input.tierId, "tierId");
  const achievement = definitions.find((item) => item.id === achievementId);

  if (!achievement) {
    throw new HttpsError("not-found", "Achievement definition not found.");
  }

  const tierIndex = achievement.tiers.findIndex((tier) => tier.id === tierId);
  const tier = achievement.tiers[tierIndex];

  if (!tier || tierIndex < 0) {
    throw new HttpsError("not-found", "Achievement tier not found.");
  }

  return db.runTransaction(async (transaction) => {
    const userRef = db.collection("users").doc(userId);
    const achievementRef = userRef.collection("achievements")
      .doc(achievementId);
    const [userSnapshot, achievementSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(achievementRef),
    ]);

    if (!userSnapshot.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }

    if (!achievementSnapshot.exists) {
      throw new HttpsError(
        "failed-precondition",
        "Achievement is not unlocked yet."
      );
    }

    const record = achievementSnapshot.data() as AchievementRecord;
    const tiers = record.tiers ?? {};
    const requestedTier = tiers[tierId];

    if (!requestedTier?.unlockedAt) {
      throw new HttpsError(
        "failed-precondition",
        "Tier is not unlocked yet."
      );
    }

    if (requestedTier.claimedAt) {
      throw new HttpsError(
        "failed-precondition",
        "Reward already claimed."
      );
    }

    const firstUnclaimedTier = achievement.tiers.find((item) =>
      tiers[item.id]?.unlockedAt && !tiers[item.id]?.claimedAt
    );

    if (firstUnclaimedTier?.id !== tierId) {
      throw new HttpsError(
        "failed-precondition",
        "Claim previous unlocked tier first."
      );
    }

    const userData = userSnapshot.data() ?? {};
    const currentCoins = Number(userData.coins ?? 0);
    const currentExp = Number(userData.exp ?? 0);
    const nextCoins = Math.max(0, currentCoins + tier.rewardCoins);
    const nextExp = Math.max(0, currentExp + Number(tier.rewardExp ?? 0));
    const nextLevel = getLevelFromExp(nextExp);

    transaction.set(achievementRef, {
      highestClaimedTier: Math.max(
        Number(record.highestClaimedTier ?? -1),
        tierIndex
      ),
      tiers: {
        [tierId]: {
          unlockedAt: requestedTier.unlockedAt,
          claimedAt: FieldValue.serverTimestamp(),
        },
      },
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    transaction.update(userRef, {
      coins: nextCoins,
      exp: nextExp,
      level: nextLevel,
    });

    return {
      achievementId,
      tierId,
      rewardCoins: tier.rewardCoins,
      rewardExp: Number(tier.rewardExp ?? 0),
      coins: nextCoins,
      exp: nextExp,
      level: nextLevel,
    };
  });
}

function toMillis(value: unknown): number | null {
  if (!value) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as {toMillis?: unknown}).toMillis === "function"
  ) {
    return (value as {toMillis: () => number}).toMillis();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as {toDate?: unknown}).toDate === "function"
  ) {
    return (value as {toDate: () => Date}).toDate().getTime();
  }

  if (typeof value === "number") {
    return value > 1_000_000_000_000 ? value : value * 1000;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

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

function buildQuizQuestion(question: ChronicleQuestion) {
  return {
    ...question,
    sourceQuestionId: question.id,
  };
}

function normalizeAnswer(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function getCorrectAnswerValue(question: ChronicleQuestion): unknown {
  if (question.correctAnswer !== undefined) {
    return question.correctAnswer;
  }

  if (
    Array.isArray(question.correctOptionIndexes) &&
    Array.isArray(question.options)
  ) {
    return question.correctOptionIndexes
      .map((index) => question.options?.[index])
      .filter((option): option is string => typeof option === "string");
  }

  if (
    typeof question.correctOptionIndex === "number" &&
    Array.isArray(question.options)
  ) {
    return question.options[question.correctOptionIndex];
  }

  return undefined;
}

function isCorrectAnswer(
  question: ChronicleQuestion,
  userAnswer: unknown
): boolean {
  const correctAnswer = getCorrectAnswerValue(question);

  if (question.type === "true_false") {
    return userAnswer === correctAnswer;
  }

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
    CHRONICLE_TRIAL_REWARD_PER_QUESTION :
    CHRONICLE_PRACTICE_REWARD_PER_QUESTION;
  const expPerQuestion = isTrial ?
    CHRONICLE_TRIAL_EXP_PER_QUESTION :
    CHRONICLE_PRACTICE_EXP_PER_QUESTION;

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

function getTrialUnlockState(params: {
  chapterData: FirebaseFirestore.DocumentData | undefined;
  progressRows: FirebaseFirestore.DocumentData[];
}): TrialUnlockState {
  const answered = params.progressRows.reduce(
    (sum, progress) => sum + Number(progress.answered ?? 0),
    0
  );
  const correct = params.progressRows.reduce(
    (sum, progress) => sum + Number(progress.correct ?? 0),
    0
  );
  const unlockedFragments = params.progressRows.filter(
    (progress) => progress.unlocked === true
  ).length;
  const masteredFragments = params.progressRows.filter(
    (progress) => progress.mastered === true
  ).length;
  const accuracyPercent = answered > 0 ?
    Math.round((correct / answered) * 100) :
    0;
  const trialUnlockRule = params.chapterData?.trialUnlockRule ?? {};
  const requiredUnlockedFragments = Number(
    trialUnlockRule.requiredUnlockedFragments ?? 0
  );
  const requiredMasteredFragments = Number(
    trialUnlockRule.requiredMasteredFragments ?? 0
  );
  const requiredAnsweredQuestions = Number(
    trialUnlockRule.minAnsweredQuestions ?? 0
  );
  const requiredAccuracyPercent = Number(
    trialUnlockRule.minAccuracyPercent ?? 0
  );
  const trialUnlocked =
    unlockedFragments >= requiredUnlockedFragments &&
    masteredFragments >= requiredMasteredFragments &&
    answered >= requiredAnsweredQuestions &&
    accuracyPercent >= requiredAccuracyPercent;

  return {
    answered,
    correct,
    accuracyPercent,
    unlockedFragments,
    masteredFragments,
    requiredUnlockedFragments,
    requiredMasteredFragments,
    requiredAnsweredQuestions,
    requiredAccuracyPercent,
    trialUnlocked,
  };
}

async function getTrialUnlockStateForUser(
  userId: string,
  chapterId: string
): Promise<TrialUnlockState> {
  const [chapterSnapshot, progressSnapshot] = await Promise.all([
    db.collection("chapters").doc(chapterId).get(),
    db.collection("userFragmentProgress")
      .where("userId", "==", userId)
      .where("chapterId", "==", chapterId)
      .get(),
  ]);

  return getTrialUnlockState({
    chapterData: chapterSnapshot.data(),
    progressRows: progressSnapshot.docs.map((doc) => doc.data()),
  });
}

async function refreshProgressSummary(params: {
  userId: string;
  chapterId: string;
  affectedFragmentIds: string[];
}): Promise<void> {
  const affectedFragmentIds = [...new Set(params.affectedFragmentIds)];
  const fragmentBatch = db.batch();

  await Promise.all(
    affectedFragmentIds.map(async (fragmentId) => {
      const fragmentRef = db.collection("userFragmentProgress")
        .doc(`${params.userId}_${fragmentId}`);
      const snapshot = await fragmentRef.get();
      const progress = snapshot.data() ?? {};
      const answered = Number(progress.answered ?? 0);
      const correct = Number(progress.correct ?? 0);
      const accuracyPercent = answered > 0 ?
        Math.round((correct / answered) * 100) :
        0;

      fragmentBatch.set(fragmentRef, {
        accuracyPercent,
        mastered: answered >= FRAGMENT_MASTERY_MIN_ANSWERS &&
          accuracyPercent >= FRAGMENT_MASTERY_MIN_ACCURACY_PERCENT,
        updatedAt: FieldValue.serverTimestamp(),
      }, {merge: true});
    })
  );

  await fragmentBatch.commit();

  const [chapterSnapshot, progressSnapshot] = await Promise.all([
    db.collection("chapters").doc(params.chapterId).get(),
    db.collection("userFragmentProgress")
      .where("userId", "==", params.userId)
      .where("chapterId", "==", params.chapterId)
      .get(),
  ]);

  const progressRows = progressSnapshot.docs.map((doc) => doc.data());
  const unlockState = getTrialUnlockState({
    chapterData: chapterSnapshot.data(),
    progressRows,
  });

  await db.collection("userChapterProgress")
    .doc(`${params.userId}_${params.chapterId}`)
    .set({
      userId: params.userId,
      chapterId: params.chapterId,
      status: unlockState.trialUnlocked ? "trial_unlocked" : "active",
      answered: unlockState.answered,
      correct: unlockState.correct,
      accuracyPercent: unlockState.accuracyPercent,
      unlockedFragments: unlockState.unlockedFragments,
      masteredFragments: unlockState.masteredFragments,
      requiredUnlockedFragments: unlockState.requiredUnlockedFragments,
      trialUnlocked: unlockState.trialUnlocked,
      completed: false,
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
}

async function createChronicleQuizForUser(
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
  const existingQuizId = existingProgress.data()?.quizId;

  if (typeof existingQuizId === "string" && existingQuizId.trim()) {
    return {
      quizId: existingQuizId,
      alreadyCreated: true,
    };
  }

  const count = Math.min(
    Math.max(Number(slot.questionCount ?? 5), 1),
    10
  );
  const targetFragmentIds = Array.isArray(slot.targetFragmentIds) ?
    slot.targetFragmentIds.filter((id): id is string =>
      typeof id === "string") :
    [];
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

  const selectedQuestions = pickWeightedQuestions({
    questions,
    statsByQuestionId,
    targetFragmentIds,
    count,
  });
  const quizRef = db.collection("quizzes")
    .doc(`chronicle_${slotId}_${userId}`);
  const quizType = slot.type === "trial_gate" ? "trial" : "spark";

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
    maxAttempts: Number(slot.maxAttempts ?? (quizType === "trial" ? 1 : 3)),
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
    maxAttempts: Number(slot.maxAttempts ?? (quizType === "trial" ? 1 : 3)),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});

  return {
    quizId: quizRef.id,
    alreadyCreated: false,
  };
}

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

async function recordChronicleQuizAttemptForUser(
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
  const progressSnapshot = await progressRef.get();
  const progress = progressSnapshot.data() ?? {};
  const attemptsUsed = Number(progress.attemptsUsed ?? 0);
  const maxAttempts = Number(
    progress.maxAttempts ?? quiz.maxAttempts ?? (quiz.type === "trial" ? 1 : 3)
  );
  const sessionId = typeof input.sessionId === "string" ?
    input.sessionId.trim() :
    "";

  if (sessionId && progress.lastSessionId === sessionId) {
    return {
      quizId,
      slotId,
      alreadyRecorded: true,
      attemptsUsed,
      maxAttempts,
      completed: progress.status === "completed" ||
        progress.status === "archived",
    };
  }

  if (attemptsUsed >= maxAttempts) {
    return {
      quizId,
      slotId,
      alreadyCompleted: true,
      attemptsUsed,
      maxAttempts,
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
      typeof fragmentId === "string" && fragmentId.trim());

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
      const shouldUnlock = shouldUnlockFragment({
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
  const bestScore = Math.max(Number(progress.bestScore ?? 0), percentage);
  const completed = percentage >= 100 || attemptNumber >= maxAttempts;

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

  if (quiz.type === "trial" && completed) {
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
  };
}

export const createChronicleQuizHttp = onRequest(
  {
    invoker: "public",
    maxInstances: 5,
  },
  async (request, response) => {
    await handleHttpFunction<CreateChronicleQuizInput, unknown>({
      request,
      response,
      handler: createChronicleQuizForUser,
    });
  }
);

export const recordChronicleQuizAttemptHttp = onRequest(
  {
    invoker: "public",
    maxInstances: 5,
  },
  async (request, response) => {
    await handleHttpFunction<RecordChronicleQuizAttemptInput, unknown>({
      request,
      response,
      handler: recordChronicleQuizAttemptForUser,
    });
  }
);

export const syncAchievementsHttp = onRequest(
  {
    invoker: "public",
    maxInstances: 5,
  },
  async (request, response) => {
    await handleHttpFunction<Record<string, never>, unknown>({
      request,
      response,
      requireTesterAccess: false,
      handler: (userId) => syncAchievementsForUser(userId),
    });
  }
);

export const claimAchievementRewardHttp = onRequest(
  {
    invoker: "public",
    maxInstances: 5,
  },
  async (request, response) => {
    await handleHttpFunction<ClaimAchievementInput, unknown>({
      request,
      response,
      requireTesterAccess: false,
      handler: claimAchievementRewardForUser,
    });
  }
);
