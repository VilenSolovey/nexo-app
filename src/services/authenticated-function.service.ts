import { app, auth } from '@nexo/services/firebase'

export async function callAuthenticatedFunction<TInput, TOutput>(
  functionName: string,
  input: TInput,
): Promise<TOutput> {
  if (!auth.currentUser) {
    throw new Error('Немає активної Firebase Auth сесії. Вийдіть і зайдіть в акаунт ще раз.')
  }

  const token = await auth.currentUser.getIdToken()
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

  if (!response.ok || payload?.error) {
    throw new Error(
      payload?.error?.message ??
      payload?.error?.status ??
      `Firebase Function ${functionName} failed.`,
    )
  }

  return payload.result as TOutput
}
