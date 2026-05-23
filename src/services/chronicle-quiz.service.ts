import { app, auth } from '@nexo/services/firebase'

export type CreateChronicleQuizResponse = {
  quizId: string
  alreadyCreated: boolean
}

export type RecordChronicleQuizAttemptResponse = {
  quizId: string
  slotId: string
  attemptNumber?: number
  maxAttempts: number
  score?: number
  total?: number
  percentage?: number
  completed?: boolean
  alreadyRecorded?: boolean
  alreadyCompleted?: boolean
}

type CreateChronicleQuizInput = {
  chapterId: string
  slotId: string
}

type RecordChronicleQuizAttemptInput = {
  quizId: string
  answers: Record<string, unknown>
  sessionId?: string
}

async function callChronicleFunction<TInput, TOutput>(
  functionName: string,
  input: TInput,
): Promise<TOutput> {
  if (!auth.currentUser) {
    throw new Error('Немає активної Firebase Auth сесії. Вийдіть і зайдіть в акаунт ще раз.')
  }

  const token = await auth.currentUser.getIdToken(true)
  const projectId = app.options.projectId

  if (!projectId) {
    throw new Error('Firebase projectId не налаштований.')
  }

  const response = await fetch(
    `https://europe-west1-${projectId}.cloudfunctions.net/${functionName}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: input }),
    },
  )

  const responseText = await response.text()
  let payload: any = null

  try {
    payload = responseText ? JSON.parse(responseText) : null
  } catch {
    throw new Error(
      `Firebase Function ${functionName} returned non-JSON response: ${response.status} ${responseText.slice(0, 120)}`,
    )
  }

  if (!response.ok || payload.error) {
    const errorMessage =
      payload.error?.message ??
      payload.error?.status ??
      `Firebase Function ${functionName} failed.`

    throw new Error(errorMessage)
  }

  return payload.result as TOutput
}

export async function createChronicleChallengeQuiz(
  input: CreateChronicleQuizInput,
): Promise<CreateChronicleQuizResponse> {
  return callChronicleFunction<CreateChronicleQuizInput, CreateChronicleQuizResponse>(
    'createChronicleQuizHttp',
    input,
  )
}

export async function recordChronicleQuizAttempt(
  input: RecordChronicleQuizAttemptInput,
): Promise<RecordChronicleQuizAttemptResponse> {
  return callChronicleFunction<
    RecordChronicleQuizAttemptInput,
    RecordChronicleQuizAttemptResponse
  >(
    'recordChronicleQuizAttemptHttp',
    input,
  )
}
