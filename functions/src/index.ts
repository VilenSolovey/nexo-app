import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import {
  claimAchievementRewardForUser,
  syncAchievementsForUser,
} from "./achievements/service.js";
import {handleHttpFunction} from "./http/handler.js";
import {recordChronicleQuizAttemptForUser} from "./chronicle/attempt.js";
import {
  claimChronicleDiscoveryForUser,
  markChronicleFragmentReadForUser,
} from "./chronicle/discovery.js";
import {createChronicleQuizForUser} from "./chronicle/quiz-factory.js";
import {
  completeChronicleReconstructionForUser,
} from "./chronicle/reconstruction.js";
import {finalizeQuizAttemptForUser} from "./quiz/attempts.js";
import {activateQuizPowerUpForUser} from "./quiz/power-ups.js";
import {purchaseShopItemForUser} from "./shop/purchase.js";
import type {
  ActivateQuizPowerUpInput,
  ClaimAchievementInput,
  ClaimChronicleDiscoveryInput,
  CompleteChronicleReconstructionInput,
  CreateChronicleQuizInput,
  FinalizeQuizAttemptInput,
  MarkChronicleFragmentReadInput,
  PurchaseShopItemInput,
  RecordChronicleQuizAttemptInput,
} from "./types.js";

setGlobalOptions({
  maxInstances: 5,
  region: "europe-west1",
});

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

export const activateQuizPowerUpHttp = onRequest(
  {
    invoker: "public",
    maxInstances: 5,
  },
  async (request, response) => {
    await handleHttpFunction<ActivateQuizPowerUpInput, unknown>({
      request,
      response,
      handler: activateQuizPowerUpForUser,
      requireTesterAccess: false,
    });
  }
);

export const purchaseShopItemHttp = onRequest(
  {
    invoker: "public",
    maxInstances: 5,
  },
  async (request, response) => {
    await handleHttpFunction<PurchaseShopItemInput, unknown>({
      request,
      response,
      handler: purchaseShopItemForUser,
      requireTesterAccess: false,
    });
  }
);

export const finalizeQuizAttemptHttp = onRequest(
  {
    invoker: "public",
    maxInstances: 5,
  },
  async (request, response) => {
    await handleHttpFunction<FinalizeQuizAttemptInput, unknown>({
      request,
      response,
      handler: finalizeQuizAttemptForUser,
      requireTesterAccess: false,
    });
  }
);

export const markChronicleFragmentReadHttp = onRequest(
  {
    invoker: "public",
    maxInstances: 5,
  },
  async (request, response) => {
    await handleHttpFunction<MarkChronicleFragmentReadInput, unknown>({
      request,
      response,
      handler: markChronicleFragmentReadForUser,
    });
  }
);

export const claimChronicleDiscoveryHttp = onRequest(
  {
    invoker: "public",
    maxInstances: 5,
  },
  async (request, response) => {
    await handleHttpFunction<ClaimChronicleDiscoveryInput, unknown>({
      request,
      response,
      handler: claimChronicleDiscoveryForUser,
    });
  }
);

export const completeChronicleReconstructionHttp = onRequest(
  {
    invoker: "public",
    maxInstances: 5,
  },
  async (request, response) => {
    await handleHttpFunction<CompleteChronicleReconstructionInput, unknown>({
      request,
      response,
      handler: completeChronicleReconstructionForUser,
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
