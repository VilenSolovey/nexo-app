import {FieldValue} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import {db} from "../firebase.js";
import {asString, asStringArray} from "../shared/validation.js";
import type {
  ChronicleProgressionOutcome,
  CompleteChronicleReconstructionInput,
  ReconstructionDocument,
  ReconstructionStage,
} from "../types.js";
import {refreshProgressSummary} from "./progress.js";
import {
  discoveryPayloadFromData,
  getNextChronicleDiscoveryAt,
} from "./time.js";

function arraysMatch(left: string[], right: string[]): boolean {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

function setsMatch(left: string[], right: string[]): boolean {
  return left.length === right.length &&
    left.every((value) => right.includes(value));
}

function isReconstructionAnswerCorrect(
  stage: ReconstructionStage,
  answer: unknown
): boolean {
  if (stage.type === "sequence") {
    return arraysMatch(
      asStringArray(answer),
      asStringArray(stage.correctOrder)
    );
  }

  if (stage.type === "evidence") {
    return setsMatch(
      asStringArray(answer),
      asStringArray(stage.correctEvidenceIds)
    );
  }

  if (stage.type === "connections") {
    if (
      typeof answer !== "object" ||
      answer === null ||
      Array.isArray(answer)
    ) {
      return false;
    }
    const submitted = answer as Record<string, unknown>;
    const expectedEntries = Object.entries(stage.correctMatches ?? {});
    return expectedEntries.length > 0 && expectedEntries.every(
      ([sourceId, targetId]) => submitted[sourceId] === targetId
    );
  }

  return false;
}

export async function completeChronicleReconstructionForUser(
  userId: string,
  input: CompleteChronicleReconstructionInput
) {
  const chapterId = asString(input.chapterId, "chapterId");
  const reconstructionId = asString(
    input.reconstructionId,
    "reconstructionId"
  );
  const answers = input.answers ?? {};
  const reconstructionSnapshot = await db.collection("reconstructions")
    .doc(reconstructionId).get();

  if (!reconstructionSnapshot.exists) {
    throw new HttpsError("not-found", "Реконструкцію не знайдено.");
  }

  const reconstruction = reconstructionSnapshot.data() as
    ReconstructionDocument;
  if (reconstruction.chapterId !== chapterId) {
    throw new HttpsError(
      "failed-precondition",
      "Реконструкція не належить до цієї епохи."
    );
  }

  const progressRef = db.collection("userReconstructionProgress")
    .doc(`${userId}_${reconstructionId}`);
  const chapterProgressRef = db.collection("userChapterProgress")
    .doc(`${userId}_${chapterId}`);
  const [progressSnapshot, chapterProgressSnapshot] = await Promise.all([
    progressRef.get(),
    chapterProgressRef.get(),
  ]);
  if (progressSnapshot.data()?.status === "completed") {
    const discovery = discoveryPayloadFromData(
      chapterProgressSnapshot.data()?.pendingDiscovery
    );
    return {
      reconstructionId,
      completed: true as const,
      alreadyCompleted: true,
      nextAction: discovery ? "discovery_search" as const : "none" as const,
      ...(discovery ? {discovery} : {}),
    };
  }

  const requiredSlotIds = asStringArray(
    reconstruction.requiredChallengeSlotIds
  );
  const [slotSnapshots, challengeProgressSnapshots] = await Promise.all([
    Promise.all(requiredSlotIds.map((slotId) =>
      db.collection("challengeSlots").doc(slotId).get()
    )),
    Promise.all(requiredSlotIds.map((slotId) =>
      db.collection("userChallengeProgress")
        .doc(`${userId}_${slotId}`).get()
    )),
  ]);

  const prerequisitesMet = requiredSlotIds.every((_, index) => {
    const slot = slotSnapshots[index].data() ?? {};
    const progress = challengeProgressSnapshots[index].data() ?? {};
    return (
      progress.status === "completed" || progress.status === "archived"
    ) &&
      Number(progress.bestScore ?? 0) >= Number(slot.passScore ?? 70);
  });

  if (!prerequisitesMet) {
    throw new HttpsError(
      "failed-precondition",
      "Спочатку успішно завершіть пов’язані Spark."
    );
  }

  const stages = Array.isArray(reconstruction.stages) ?
    reconstruction.stages : [];
  const hasInvalidAnswer = !stages.length || stages.some((stage) => {
    const stageId = typeof stage.id === "string" ? stage.id : "";
    return !stageId || !isReconstructionAnswerCorrect(stage, answers[stageId]);
  });
  if (hasInvalidAnswer) {
    throw new HttpsError(
      "failed-precondition",
      "Не всі зв’язки реконструкції відновлено правильно."
    );
  }

  const nextFragmentId = asStringArray(reconstruction.unlockFragmentIds)[0];
  const batch = db.batch();
  batch.set(progressRef, {
    userId,
    chapterId,
    reconstructionId,
    status: "completed",
    currentStage: stages.length,
    mistakes: Math.max(0, Number(input.mistakes ?? 0)),
    completedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});

  let progressionOutcome: ChronicleProgressionOutcome = {nextAction: "trial"};
  if (nextFragmentId) {
    const readyAt = getNextChronicleDiscoveryAt();
    batch.set(chapterProgressRef, {
      userId,
      chapterId,
      pendingDiscovery: {
        fragmentId: nextFragmentId,
        readyAt,
        startedAt: FieldValue.serverTimestamp(),
        sourceType: "reconstruction",
        sourceId: reconstructionId,
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
  }

  await batch.commit();
  await refreshProgressSummary({
    userId,
    chapterId,
    affectedFragmentIds: [],
  });

  return {
    reconstructionId,
    completed: true as const,
    ...progressionOutcome,
  };
}
