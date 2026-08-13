import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import {db} from "../firebase.js";
import {asString} from "../shared/validation.js";
import type {
  ClaimChronicleDiscoveryInput,
  MarkChronicleFragmentReadInput,
} from "../types.js";
import {refreshProgressSummary} from "./progress.js";

export async function markChronicleFragmentReadForUser(
  userId: string,
  input: MarkChronicleFragmentReadInput
) {
  const chapterId = asString(input.chapterId, "chapterId");
  const fragmentId = asString(input.fragmentId, "fragmentId");
  const fragmentRef = db.collection("fragments").doc(fragmentId);
  const progressRef = db.collection("userFragmentProgress").doc(
    `${userId}_${fragmentId}`
  );
  const [fragmentSnapshot, progressSnapshot] = await Promise.all([
    fragmentRef.get(),
    progressRef.get(),
  ]);

  if (
    !fragmentSnapshot.exists ||
    fragmentSnapshot.data()?.chapterId !== chapterId
  ) {
    throw new HttpsError("not-found", "Фрагмент цієї епохи не знайдено.");
  }

  const fragment = fragmentSnapshot.data() ?? {};
  const progress = progressSnapshot.data() ?? {};
  const isFirstFragment = Number(fragment.order) === 1;
  const wasAlreadyAccessible = progress.unlocked === true ||
    progress.read === true ||
    progress.mastered === true;
  if (!isFirstFragment && !wasAlreadyAccessible) {
    throw new HttpsError(
      "failed-precondition",
      "Спочатку дочекайтеся повернення Нестора і прийміть знахідку."
    );
  }

  await progressRef.set({
    userId,
    chapterId,
    fragmentId,
    read: true,
    unlocked: true,
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});

  return {fragmentId, read: true};
}

export async function claimChronicleDiscoveryForUser(
  userId: string,
  input: ClaimChronicleDiscoveryInput
) {
  const chapterId = asString(input.chapterId, "chapterId");
  const fragmentId = asString(input.fragmentId, "fragmentId");
  const chapterProgressRef = db.collection("userChapterProgress")
    .doc(`${userId}_${chapterId}`);
  const fragmentRef = db.collection("fragments").doc(fragmentId);
  const fragmentProgressRef = db.collection("userFragmentProgress")
    .doc(`${userId}_${fragmentId}`);

  const result = await db.runTransaction(async (transaction) => {
    const [chapterProgressSnapshot, fragmentSnapshot] = await Promise.all([
      transaction.get(chapterProgressRef),
      transaction.get(fragmentRef),
    ]);
    const chapterProgress = chapterProgressSnapshot.data() ?? {};
    const lastDiscovery = typeof chapterProgress.lastDiscovery === "object" &&
      chapterProgress.lastDiscovery !== null ?
      chapterProgress.lastDiscovery as Record<string, unknown> :
      {};

    if (
      !chapterProgress.pendingDiscovery &&
      lastDiscovery.fragmentId === fragmentId
    ) {
      const fragment = fragmentSnapshot.data() ?? {};
      return {
        fragmentId,
        title: typeof fragment.title === "string" ?
          fragment.title :
          "Новий запис",
        alreadyClaimed: true,
      };
    }

    const pending = chapterProgress.pendingDiscovery;
    if (
      typeof pending !== "object" ||
      pending === null ||
      Array.isArray(pending)
    ) {
      throw new HttpsError(
        "failed-precondition",
        "Нестор зараз не має готової знахідки."
      );
    }
    const pendingData = pending as Record<string, unknown>;
    if (pendingData.fragmentId !== fragmentId) {
      throw new HttpsError(
        "failed-precondition",
        "Цей фрагмент не є поточною знахідкою Нестора."
      );
    }
    const readyAt = pendingData.readyAt;
    if (!(readyAt instanceof Timestamp)) {
      throw new HttpsError("internal", "Discovery ready time is invalid.");
    }
    if (readyAt.toMillis() > Date.now()) {
      throw new HttpsError(
        "failed-precondition",
        "Пошук ще триває. Нестор повернеться о 08:00 за Києвом."
      );
    }
    if (
      !fragmentSnapshot.exists ||
      fragmentSnapshot.data()?.chapterId !== chapterId
    ) {
      throw new HttpsError("not-found", "Знайдений фрагмент не існує.");
    }

    transaction.set(fragmentProgressRef, {
      userId,
      chapterId,
      fragmentId,
      unlocked: true,
      discoveredAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
    transaction.set(chapterProgressRef, {
      pendingDiscovery: FieldValue.delete(),
      lastDiscovery: {
        fragmentId,
        discoveredAt: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    const fragment = fragmentSnapshot.data() ?? {};
    return {
      fragmentId,
      title: typeof fragment.title === "string" ?
        fragment.title :
        "Новий запис",
      alreadyClaimed: false,
    };
  });

  await refreshProgressSummary({
    userId,
    chapterId,
    affectedFragmentIds: [fragmentId],
  });

  return result;
}
