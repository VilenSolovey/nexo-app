import {FieldValue} from "firebase-admin/firestore";
import {db} from "../firebase.js";
import type {TrialUnlockState} from "../types.js";

const FRAGMENT_MASTERY_MIN_ANSWERS = 2;
const FRAGMENT_MASTERY_MIN_ACCURACY_PERCENT = 75;

function getTrialUnlockState(params: {
  chapterData: FirebaseFirestore.DocumentData | undefined;
  progressRows: FirebaseFirestore.DocumentData[];
  questionStatsRows?: FirebaseFirestore.DocumentData[];
  reconstructionProgressRows?: FirebaseFirestore.DocumentData[];
}): TrialUnlockState {
  const answerRows = params.questionStatsRows ?
    params.questionStatsRows :
    params.progressRows;
  const answered = answerRows.reduce(
    (sum, row) => sum + Number(row.attempts ?? row.answered ?? 0),
    0
  );
  const correct = answerRows.reduce(
    (sum, row) => sum + Number(row.correct ?? 0),
    0
  );
  const unlockedFragments = params.progressRows.filter(
    (progress) => progress.unlocked === true
  ).length;
  const masteredFragments = params.progressRows.filter(
    (progress) => progress.mastered === true
  ).length;
  const completedReconstructions = (
    params.reconstructionProgressRows ?? []
  ).filter((progress) => progress.status === "completed").length;
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
  const requiredCompletedReconstructions = Number(
    trialUnlockRule.requiredCompletedReconstructions ?? 0
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
    completedReconstructions >= requiredCompletedReconstructions &&
    answered >= requiredAnsweredQuestions &&
    accuracyPercent >= requiredAccuracyPercent;

  return {
    answered,
    correct,
    accuracyPercent,
    unlockedFragments,
    masteredFragments,
    completedReconstructions,
    requiredUnlockedFragments,
    requiredMasteredFragments,
    requiredCompletedReconstructions,
    requiredAnsweredQuestions,
    requiredAccuracyPercent,
    trialUnlocked,
  };
}

export async function getTrialUnlockStateForUser(
  userId: string,
  chapterId: string
): Promise<TrialUnlockState> {
  const [
    chapterSnapshot,
    progressSnapshot,
    questionStatsSnapshot,
    reconstructionProgressSnapshot,
    chapterProgressSnapshot,
  ] = await Promise.all([
    db.collection("chapters").doc(chapterId).get(),
    db.collection("userFragmentProgress")
      .where("userId", "==", userId)
      .where("chapterId", "==", chapterId)
      .get(),
    db.collection("userQuestionStats")
      .where("userId", "==", userId)
      .where("chapterId", "==", chapterId)
      .get(),
    db.collection("userReconstructionProgress")
      .where("userId", "==", userId)
      .where("chapterId", "==", chapterId)
      .get(),
    db.collection("userChapterProgress").doc(`${userId}_${chapterId}`).get(),
  ]);

  const unlockState = getTrialUnlockState({
    chapterData: chapterSnapshot.data(),
    progressRows: progressSnapshot.docs.map((doc) => doc.data()),
    questionStatsRows: questionStatsSnapshot.docs.map((doc) => doc.data()),
    reconstructionProgressRows: reconstructionProgressSnapshot.docs.map(
      (doc) => doc.data()
    ),
  });
  const chapterProgress = chapterProgressSnapshot.data() ?? {};
  const persistedTrialUnlocked = chapterProgress.trialUnlocked === true ||
    chapterProgress.completed === true ||
    chapterProgress.status === "completed";
  const reconstructionRequirementMet =
    unlockState.completedReconstructions >=
    unlockState.requiredCompletedReconstructions;
  const chapterCompleted = chapterProgress.completed === true ||
    chapterProgress.status === "completed";

  return {
    ...unlockState,
    trialUnlocked: chapterCompleted || (
      reconstructionRequirementMet &&
      (persistedTrialUnlocked || unlockState.trialUnlocked)
    ),
  };
}

export async function refreshProgressSummary(params: {
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

  const chapterProgressRef = db.collection("userChapterProgress")
    .doc(`${params.userId}_${params.chapterId}`);
  const [
    chapterSnapshot,
    progressSnapshot,
    questionStatsSnapshot,
    reconstructionProgressSnapshot,
    chapterProgressSnapshot,
  ] = await Promise.all([
    db.collection("chapters").doc(params.chapterId).get(),
    db.collection("userFragmentProgress")
      .where("userId", "==", params.userId)
      .where("chapterId", "==", params.chapterId)
      .get(),
    db.collection("userQuestionStats")
      .where("userId", "==", params.userId)
      .where("chapterId", "==", params.chapterId)
      .get(),
    db.collection("userReconstructionProgress")
      .where("userId", "==", params.userId)
      .where("chapterId", "==", params.chapterId)
      .get(),
    chapterProgressRef.get(),
  ]);

  const progressRows = progressSnapshot.docs.map((doc) => doc.data());
  const unlockState = getTrialUnlockState({
    chapterData: chapterSnapshot.data(),
    progressRows,
    questionStatsRows: questionStatsSnapshot.docs.map((doc) => doc.data()),
    reconstructionProgressRows: reconstructionProgressSnapshot.docs.map(
      (doc) => doc.data()
    ),
  });

  const currentChapterProgress = chapterProgressSnapshot.data() ?? {};
  const alreadyCompleted = currentChapterProgress.completed === true ||
    currentChapterProgress.status === "completed";
  const reconstructionRequirementMet =
    unlockState.completedReconstructions >=
    unlockState.requiredCompletedReconstructions;
  const wasTrialUnlocked = currentChapterProgress.trialUnlocked === true;
  const trialUnlocked = alreadyCompleted || unlockState.trialUnlocked ||
    (wasTrialUnlocked && reconstructionRequirementMet);

  await chapterProgressRef.set({
    userId: params.userId,
    chapterId: params.chapterId,
    status: alreadyCompleted ? "completed" :
      trialUnlocked ? "trial_unlocked" : "active",
    answered: unlockState.answered,
    correct: unlockState.correct,
    accuracyPercent: unlockState.accuracyPercent,
    unlockedFragments: unlockState.unlockedFragments,
    masteredFragments: unlockState.masteredFragments,
    completedReconstructions: unlockState.completedReconstructions,
    requiredUnlockedFragments: unlockState.requiredUnlockedFragments,
    requiredMasteredFragments: unlockState.requiredMasteredFragments,
    requiredCompletedReconstructions:
      unlockState.requiredCompletedReconstructions,
    requiredAnsweredQuestions: unlockState.requiredAnsweredQuestions,
    requiredAccuracyPercent: unlockState.requiredAccuracyPercent,
    trialUnlocked,
    completed: alreadyCompleted,
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});
}
