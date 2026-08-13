import type {Firestore} from "firebase-admin/firestore";

export type AchievementCategory = "progress" | "skill" | "streak" |
  "mastery" | "chronicle";

export type AchievementMetric = "uniqueQuizzes" | "perfectScores" |
  "streakDays" | "level" | "completedChronicles" | "unlockedFragments" |
  "mistakesFixed" | "bestCorrectStreak" | "masteredChronicles" |
  "perfectChallenges";

export type AchievementTierDefinition = {
  id: string;
  title: string;
  target: number;
  rewardCoins: number;
  rewardExp?: number;
};

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  metric: AchievementMetric;
  icon: string;
  accentColor?: string;
  order?: number;
  active?: boolean;
  tiers: AchievementTierDefinition[];
};

const LEVEL_BASE_EXP = 40;
const LEVEL_STEP_EXP = 20;
const ACHIEVEMENT_DEFINITIONS_COLLECTION = "achievementDefinitions";
const ACHIEVEMENT_CATEGORIES = new Set<AchievementCategory>([
  "progress",
  "skill",
  "streak",
  "mastery",
  "chronicle",
]);
const ACHIEVEMENT_METRICS = new Set<AchievementMetric>([
  "uniqueQuizzes",
  "perfectScores",
  "streakDays",
  "level",
  "completedChronicles",
  "unlockedFragments",
  "mistakesFixed",
  "bestCorrectStreak",
  "masteredChronicles",
  "perfectChallenges",
]);

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeTier(value: unknown): AchievementTierDefinition | null {
  const raw = typeof value === "object" && value !== null ?
    value as Record<string, unknown> :
    {};
  const id = asOptionalString(raw.id);
  const title = asOptionalString(raw.title);
  const target = Number(raw.target);
  const rewardCoins = Number(raw.rewardCoins);
  const rewardExp = raw.rewardExp === undefined ?
    undefined :
    Number(raw.rewardExp);

  if (!id || !title || !Number.isFinite(target) || target <= 0) {
    return null;
  }

  if (!Number.isFinite(rewardCoins) || rewardCoins < 0) {
    return null;
  }

  if (
    rewardExp !== undefined &&
    (!Number.isFinite(rewardExp) || rewardExp < 0)
  ) {
    return null;
  }

  return {
    id,
    title,
    target,
    rewardCoins,
    ...(rewardExp !== undefined ? {rewardExp} : {}),
  };
}

function normalizeAchievementDefinition(
  id: string,
  data: Record<string, unknown>
): AchievementDefinition | null {
  if (data.active === false) {
    return null;
  }

  const title = asOptionalString(data.title);
  const description = asOptionalString(data.description);
  const category = asOptionalString(data.category);
  const metric = asOptionalString(data.metric);
  const icon = asOptionalString(data.icon);
  const tiers = Array.isArray(data.tiers) ?
    data.tiers
      .map(normalizeTier)
      .filter((tier): tier is AchievementTierDefinition => tier !== null) :
    [];

  if (
    !title ||
    !description ||
    !icon ||
    !category ||
    !metric ||
    !ACHIEVEMENT_CATEGORIES.has(category as AchievementCategory) ||
    !ACHIEVEMENT_METRICS.has(metric as AchievementMetric) ||
    tiers.length === 0
  ) {
    return null;
  }

  const order = Number(data.order);

  return {
    id,
    title,
    description,
    category: category as AchievementCategory,
    metric: metric as AchievementMetric,
    icon,
    accentColor: asOptionalString(data.accentColor),
    active: data.active !== false,
    order: Number.isFinite(order) ? order : undefined,
    tiers,
  };
}

export async function getAchievementDefinitions(
  db: Firestore
): Promise<AchievementDefinition[]> {
  const snapshot = await db.collection(ACHIEVEMENT_DEFINITIONS_COLLECTION)
    .get();

  return snapshot.docs
    .map((doc) => normalizeAchievementDefinition(doc.id, doc.data()))
    .filter((definition): definition is AchievementDefinition =>
      definition !== null
    )
    .sort((left, right) =>
      Number(left.order ?? Number.MAX_SAFE_INTEGER) -
      Number(right.order ?? Number.MAX_SAFE_INTEGER) ||
      left.title.localeCompare(right.title)
    );
}

export function getExpRequiredForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }

  let total = 0;

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    total += LEVEL_BASE_EXP + (currentLevel - 1) * LEVEL_STEP_EXP;
  }

  return total;
}

export function getLevelFromExp(totalExp: number): number {
  const safeExp = Math.max(0, Math.floor(totalExp));
  let level = 1;

  while (safeExp >= getExpRequiredForLevel(level + 1)) {
    level += 1;
  }

  return level;
}
