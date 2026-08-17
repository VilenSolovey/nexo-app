import {FieldValue} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import {
  getAchievementDefinitions,
  getLevelFromExp,
  type AchievementDefinition,
} from "../achievements.js";
import {db} from "../firebase.js";
import {asString} from "../shared/validation.js";
import type {
  AchievementMetrics,
  AchievementRecord,
  ClaimAchievementInput,
  QuizResultDocument,
  UserChallengeProgressDocument,
  UserChapterProgressDocument,
  UserFragmentProgressDocument,
} from "../types.js";

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

export async function syncAchievementsForUser(
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
  let hasWrites = false;

  for (const achievement of resolvedDefinitions) {
    const current = metrics[achievement.metric] ?? 0;
    const record = records.get(achievement.id);
    const tiersPayload: Record<string, {unlockedAt: unknown}> = {};
    const unlockedIndices = achievement.tiers
      .map((tier, index) => current >= tier.target ? index : -1)
      .filter((index) => index >= 0);
    const highestUnlockedTier = Math.max(...unlockedIndices, -1);
    const previousHighestUnlockedTier = Number(
      record?.highestUnlockedTier ?? -1
    );

    achievement.tiers.forEach((tier) => {
      const isUnlockedNow = current >= tier.target;
      const alreadyHasTimestamp = Boolean(record?.tiers?.[tier.id]?.unlockedAt);

      if (!isUnlockedNow || alreadyHasTimestamp) {
        return;
      }

      tiersPayload[tier.id] = {unlockedAt: FieldValue.serverTimestamp()};
      unlocked.push({achievementId: achievement.id, tierId: tier.id});
    });

    const shouldUpdateHighestUnlocked =
      highestUnlockedTier !== previousHighestUnlockedTier;

    if (!Object.keys(tiersPayload).length && !shouldUpdateHighestUnlocked) {
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
    hasWrites = true;
  }

  if (hasWrites) {
    await batch.commit();
  }

  return {
    unlocked,
    unlockedCount: unlocked.length,
    metrics,
  };
}

export async function claimAchievementRewardForUser(
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

  const metrics = await getAchievementMetrics(userId);
  const current = metrics[achievement.metric] ?? 0;

  if (current < tier.target) {
    throw new HttpsError(
      "failed-precondition",
      "Tier target is not reached yet."
    );
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
    const highestClaimedTier = Number(record.highestClaimedTier ?? -1);

    if (!requestedTier?.unlockedAt) {
      throw new HttpsError(
        "failed-precondition",
        "Tier is not unlocked yet."
      );
    }

    if (requestedTier.claimedAt || highestClaimedTier >= tierIndex) {
      throw new HttpsError(
        "failed-precondition",
        "Reward already claimed."
      );
    }

    const firstUnclaimedTier = achievement.tiers.find((item, index) =>
      current >= item.target &&
      tiers[item.id]?.unlockedAt &&
      !tiers[item.id]?.claimedAt &&
      highestClaimedTier < index
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
