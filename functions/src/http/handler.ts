import {getAuth} from "firebase-admin/auth";
import {HttpsError} from "firebase-functions/v2/https";
import {db} from "../firebase.js";

export type HttpRequest = {
  method: string;
  headers: {authorization?: string | string[]};
  body?: {data?: unknown};
};

export type HttpResponse = {
  status: (code: number) => {json: (body: unknown) => void};
  json: (body: unknown) => void;
};

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

export async function handleHttpFunction<TInput, TResult>(params: {
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
