import {FieldValue} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import {db} from "../firebase.js";
import {asString} from "../shared/validation.js";
import type {
  ActivateQuizPowerUpInput,
  ChronicleQuizDocument,
} from "../types.js";

const QUIZ_SCOPED_POWER_UPS = new Set([
  "double_coins",
  "double_exp",
  "lucky_charm",
]);
const QUIZ_POWER_UPS = new Set([
  "hint_reveal",
  "fifty_fifty",
  "skip_question",
  "time_freeze",
  "answer_reveal",
  ...QUIZ_SCOPED_POWER_UPS,
]);
const SPARK_ONLY_POWER_UPS = new Set([
  "hint_reveal",
  "fifty_fifty",
  "time_freeze",
]);

export async function activateQuizPowerUpForUser(
  userId: string,
  input: ActivateQuizPowerUpInput
) {
  const sessionId = asString(input.sessionId, "sessionId");
  const quizId = asString(input.quizId, "quizId");
  const powerUpId = asString(input.powerUpId, "powerUpId");

  if (!QUIZ_POWER_UPS.has(powerUpId)) {
    throw new HttpsError("invalid-argument", "Unknown quiz power-up.");
  }

  const sessionRef = db.collection("quizSessions").doc(sessionId);
  const quizRef = db.collection("quizzes").doc(quizId);
  const userRef = db.collection("users").doc(userId);

  return db.runTransaction(async (transaction) => {
    const [sessionSnapshot, quizSnapshot, userSnapshot] = await Promise.all([
      transaction.get(sessionRef),
      transaction.get(quizRef),
      transaction.get(userRef),
    ]);

    if (!sessionSnapshot.exists) {
      throw new HttpsError("failed-precondition", "Quiz session is not ready.");
    }
    if (!quizSnapshot.exists) {
      throw new HttpsError("not-found", "Quiz was not found.");
    }
    if (!userSnapshot.exists) {
      throw new HttpsError("not-found", "User profile was not found.");
    }

    const session = sessionSnapshot.data() ?? {};
    const quiz = quizSnapshot.data() as ChronicleQuizDocument;
    if (session.userId !== userId || session.quizId !== quizId) {
      throw new HttpsError(
        "permission-denied",
        "Quiz session belongs to another user or quiz."
      );
    }
    if (session.status !== "in_progress") {
      throw new HttpsError(
        "failed-precondition",
        "This quiz session is already completed."
      );
    }

    if (quiz.type === "trial" && SPARK_ONLY_POWER_UPS.has(powerUpId)) {
      throw new HttpsError(
        "failed-precondition",
        "Польове спорядження доступне у Spark, але не у Trial."
      );
    }

    const quizScoped = QUIZ_SCOPED_POWER_UPS.has(powerUpId);
    const questionId = quizScoped ? "quiz" : asString(
      input.questionId,
      "questionId"
    );
    if (
      !quizScoped &&
      !(quiz.questions ?? []).some((question) => question.id === questionId)
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Question does not belong to this quiz."
      );
    }

    const activationKey = `${questionId}:${powerUpId}`;
    const usedPowerUpKeys = Array.isArray(session.usedPowerUpKeys) ?
      session.usedPowerUpKeys.map(String) :
      [];
    if (usedPowerUpKeys.includes(activationKey)) {
      return {powerUpId, alreadyActivated: true};
    }

    const user = userSnapshot.data() ?? {};
    const consumables = typeof user.consumables === "object" &&
      user.consumables !== null ?
      user.consumables as Record<string, unknown> :
      {};
    const consumableCount = Number(consumables[powerUpId] ?? 0);
    const inventory = Array.isArray(user.inventory) ?
      user.inventory.map(String) :
      [];
    const hasLegacyItem = inventory.includes(powerUpId);

    if (consumableCount <= 0 && !hasLegacyItem) {
      throw new HttpsError(
        "failed-precondition",
        "This power-up is not available in your inventory."
      );
    }

    transaction.update(userRef, consumableCount > 0 ? {
      [`consumables.${powerUpId}`]: FieldValue.increment(-1),
    } : {
      inventory: FieldValue.arrayRemove(powerUpId),
    });
    transaction.set(sessionRef, {
      usedPowerUpKeys: FieldValue.arrayUnion(activationKey),
      activatedPowerUps: FieldValue.arrayUnion(powerUpId),
      ...(powerUpId === "double_coins" ? {coinsBoostMultiplier: 2} : {}),
      ...(powerUpId === "double_exp" ? {expBoostMultiplier: 2} : {}),
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    return {powerUpId, alreadyActivated: false};
  });
}
