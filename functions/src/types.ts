import type {AchievementMetric} from "./achievements.js";

export type QuestionType = "single_answer" | "multiple_choice" |
  "true_false" | "fill_blank";

export type ChronicleQuestion = {
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

export type UserQuestionStats = {
  attempts?: number;
  correct?: number;
  lastCorrect?: boolean;
};

export type ChallengeSlot = {
  id: string;
  chapterId?: string;
  title?: string;
  description?: string;
  type?: string;
  questionCount?: number;
  studyFragmentIds?: unknown[];
  quizFragmentIds?: unknown[];
  unlockFragmentIds?: unknown[];
  passScore?: number;
  targetFragmentIds?: unknown[];
  opensAt?: unknown;
  closesAt?: unknown;
  maxAttempts?: number;
};

export type CreateChronicleQuizInput = {
  chapterId?: string;
  slotId?: string;
};

export type RecordChronicleQuizAttemptInput = {
  quizId?: string;
  answers?: Record<string, unknown>;
  sessionId?: string;
};

export type MarkChronicleFragmentReadInput = {
  chapterId?: string;
  fragmentId?: string;
};

export type ClaimChronicleDiscoveryInput = {
  chapterId?: string;
  fragmentId?: string;
};

export type CompleteChronicleReconstructionInput = {
  chapterId?: string;
  reconstructionId?: string;
  answers?: Record<string, unknown>;
  mistakes?: number;
};

export type ActivateQuizPowerUpInput = {
  sessionId?: string;
  quizId?: string;
  powerUpId?: string;
  questionId?: string;
};

export type PurchaseShopItemInput = {
  itemId?: string;
};

export type ShopCatalogItem = {
  price: number;
  type: "consumable" | "cosmetic";
  uses?: number;
  maxOwned?: number;
};

export type FinalizeQuizAttemptInput = {
  quizId?: string;
  sessionId?: string;
  answers?: Record<string, unknown>;
  timeExpired?: boolean;
  quitEarly?: boolean;
  timeSpent?: number;
  backgroundCount?: number;
  backgroundDurationMs?: number;
};

export type ReconstructionStage = {
  id?: string;
  type?: "sequence" | "connections" | "evidence";
  correctOrder?: unknown[];
  correctMatches?: Record<string, unknown>;
  correctEvidenceIds?: unknown[];
};

export type ReconstructionDocument = {
  chapterId?: string;
  requiredChallengeSlotIds?: unknown[];
  unlockFragmentIds?: unknown[];
  stages?: ReconstructionStage[];
};

export type ChronicleQuizDocument = {
  id: string;
  source?: string;
  ownerId?: string;
  chapterId?: string;
  slotId?: string;
  type?: string;
  questions?: ChronicleQuestion[];
  maxAttempts?: number;
  quizFragmentIds?: string[];
  unlockFragmentIds?: string[];
  passScore?: number;
  reward?: number;
  coinReward?: number;
  exp?: number;
  expReward?: number;
};

export type ChronicleDiscoveryPayload = {
  fragmentId: string;
  readyAt: string;
};

export type ChronicleProgressionOutcome = {
  nextAction: "discovery_search" | "reconstruction" |
    "trial" | "chapter_completed" | "none";
  discovery?: ChronicleDiscoveryPayload;
};

export type FinalizedQuizResult = {
  quizId: string;
  sessionId: string;
  source: string | null;
  correctCount: number;
  totalCount: number;
  percentage: number;
  passed: boolean;
  attempt: number;
  maxAttempts: number;
  mastered: boolean;
  canRetake: boolean;
  rewardMultiplier: number;
  coinsBoostMultiplier: number;
  expBoostMultiplier: number;
  baseCoins: number;
  baseExp: number;
  earnedCoins: number;
  earnedExp: number;
  chronicleOutcome?: ChronicleProgressionOutcome;
};

export type QuizResultDocument = {
  quizId?: string;
  score?: number;
  total?: number;
};

export type UserChapterProgressDocument = {
  completed?: boolean;
  answered?: number;
  accuracyPercent?: number;
};

export type UserFragmentProgressDocument = {
  unlocked?: boolean;
};

export type UserChallengeProgressDocument = {
  status?: string;
  bestScore?: number;
};

export type TrialUnlockState = {
  answered: number;
  correct: number;
  accuracyPercent: number;
  unlockedFragments: number;
  masteredFragments: number;
  completedReconstructions: number;
  requiredUnlockedFragments: number;
  requiredMasteredFragments: number;
  requiredCompletedReconstructions: number;
  requiredAnsweredQuestions: number;
  requiredAccuracyPercent: number;
  trialUnlocked: boolean;
};

export type AchievementRecord = {
  achievementId: string;
  highestUnlockedTier?: number;
  highestClaimedTier?: number;
  tiers?: Record<string, {
    unlockedAt?: unknown;
    claimedAt?: unknown;
  }>;
};

export type ClaimAchievementInput = {
  achievementId?: string;
  tierId?: string;
};

export type AchievementMetrics = Record<AchievementMetric, number>;
