import { callAuthenticatedFunction } from '@nexo/services/authenticated-function.service'

export type CreateChronicleQuizResponse = {
  quizId: string
  alreadyCreated: boolean
}

type CreateChronicleQuizInput = {
  chapterId: string
  slotId: string
}

type MarkChronicleFragmentReadInput = {
  chapterId: string
  fragmentId: string
}

type ClaimChronicleDiscoveryInput = {
  chapterId: string
  fragmentId: string
}

export type ChronicleProgressionOutcome = {
  nextAction: 'discovery_search' | 'reconstruction' | 'trial' | 'chapter_completed' | 'none'
  discovery?: {
    fragmentId: string
    readyAt: string
  }
}

type CompleteChronicleReconstructionInput = {
  chapterId: string
  reconstructionId: string
  answers: Record<string, unknown>
  mistakes: number
}

export async function createChronicleChallengeQuiz(
  input: CreateChronicleQuizInput,
): Promise<CreateChronicleQuizResponse> {
  return callAuthenticatedFunction<CreateChronicleQuizInput, CreateChronicleQuizResponse>(
    'createChronicleQuizHttp',
    input,
  )
}

export async function markChronicleFragmentRead(
  input: MarkChronicleFragmentReadInput,
): Promise<{ fragmentId: string; read: true }> {
  return callAuthenticatedFunction<MarkChronicleFragmentReadInput, { fragmentId: string; read: true }>(
    'markChronicleFragmentReadHttp',
    input,
  )
}

export async function claimChronicleDiscovery(
  input: ClaimChronicleDiscoveryInput,
): Promise<{ fragmentId: string; title: string; alreadyClaimed: boolean }> {
  return callAuthenticatedFunction<
    ClaimChronicleDiscoveryInput,
    { fragmentId: string; title: string; alreadyClaimed: boolean }
  >('claimChronicleDiscoveryHttp', input)
}

export async function completeChronicleReconstruction(
  input: CompleteChronicleReconstructionInput,
): Promise<{
    reconstructionId: string
    completed: true
    alreadyCompleted?: boolean
  } & ChronicleProgressionOutcome> {
  return callAuthenticatedFunction<
    CompleteChronicleReconstructionInput,
    {
      reconstructionId: string
      completed: true
      alreadyCompleted?: boolean
    } & ChronicleProgressionOutcome
  >(
    'completeChronicleReconstructionHttp',
    input,
  )
}
