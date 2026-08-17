import type {
  ChallengeSlot,
  ChronicleFragment,
  ChronicleReconstruction,
  UserChapterProgress,
  UserChallengeProgress,
  UserFragmentProgress,
  UserReconstructionProgress,
} from '@nexo/types/chronicle.types'
import {
  getChronicleFragmentStage,
  type ChronicleFragmentStage,
} from '@nexo/utils/chronicle-progress'

export type ChronicleRouteStatus = 'locked' | 'available' | 'created' | 'completed' | 'trial'

export type ChronicleRouteItem =
  | { kind: 'fragment'; fragment: ChronicleFragment; status: ChronicleFragmentStage }
  | { kind: 'challenge'; slot: ChallengeSlot; status: ChronicleRouteStatus }
  | { kind: 'reconstruction'; reconstruction: ChronicleReconstruction; status: ChronicleRouteStatus }

type ReconstructionAvailabilityParams = {
  reconstruction: ChronicleReconstruction
  slotMap: Map<string, ChallengeSlot>
  challengeProgressMap: Map<string, UserChallengeProgress>
  reconstructionProgressMap: Map<string, UserReconstructionProgress>
}

type BuildChronicleRouteParams = {
  fragments: ChronicleFragment[]
  slots: ChallengeSlot[]
  reconstructions: ChronicleReconstruction[]
  activeSlotId?: string
  trialReady: boolean
  now: number
  progressMap: Map<string, UserFragmentProgress>
  challengeProgressMap: Map<string, UserChallengeProgress>
  reconstructionProgressMap: Map<string, UserReconstructionProgress>
}

type ChronicleTrialStateParams = {
  chapterProgress?: UserChapterProgress | null
  unlockedCount: number
  masteredCount: number
  completedReconstructionCount: number
  answeredCount: number
  accuracyPercent: number
  requiredUnlocked: number
  requiredMastered: number
  requiredReconstructions: number
  requiredAnswered: number
  requiredAccuracy: number
}

type ActiveChallengeSlotParams = {
  slots: ChallengeSlot[]
  challengeProgressMap: Map<string, UserChallengeProgress>
  trialReady: boolean
  now: number
}

const ARCHIVE_META = {
  event: { label: 'Подія', icon: 'flash-outline' },
  person: { label: 'Постать', icon: 'person-outline' },
  document: { label: 'Документ', icon: 'document-text-outline' },
  artifact: { label: 'Артефакт', icon: 'cube-outline' },
  place: { label: 'Місце', icon: 'location-outline' },
} as const

export function getArchiveMeta(fragment: ChronicleFragment) {
  return fragment.archiveKind
    ? ARCHIVE_META[fragment.archiveKind]
    : { label: 'Фрагмент', icon: 'book-outline' } as const
}

export function toChronicleDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate()
  }
  return null
}

export function formatChronicleDate(value: unknown) {
  return toChronicleDate(value)?.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
  }) ?? null
}

function chronicleDayKey(value: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}

export function formatChronicleDiscoveryReadyAt(value: unknown, now = Date.now()) {
  const readyAt = toChronicleDate(value)
  if (!readyAt) return null
  const today = new Date(now)
  const tomorrow = new Date(now + 86_400_000)
  const readyDay = chronicleDayKey(readyAt)
  const dayLabel = readyDay === chronicleDayKey(today)
    ? 'сьогодні'
    : readyDay === chronicleDayKey(tomorrow)
      ? 'завтра'
      : readyAt.toLocaleDateString('uk-UA', {
        timeZone: 'Europe/Kyiv',
        day: 'numeric',
        month: 'long',
      })
  const time = readyAt.toLocaleTimeString('uk-UA', {
    timeZone: 'Europe/Kyiv',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${dayLabel} о ${time}`
}

export function formatChronicleCountdown(value: unknown, now = Date.now()) {
  const readyAt = toChronicleDate(value)?.getTime()
  if (!readyAt) return null
  const remainingMinutes = Math.max(0, Math.ceil((readyAt - now) / 60_000))
  if (remainingMinutes <= 0) return 'знахідка готова'
  const hours = Math.floor(remainingMinutes / 60)
  const minutes = remainingMinutes % 60

  if (hours <= 0) return `${minutes} хв`
  return minutes > 0 ? `${hours} год ${minutes} хв` : `${hours} год`
}

export function isChallengeProgressCompleted(
  progress: UserChallengeProgress | null | undefined,
) {
  return progress?.status === 'completed' || progress?.status === 'archived'
}

export function isChallengeProgressRetryReady(
  progress: UserChallengeProgress | null | undefined,
  slot: ChallengeSlot | null | undefined,
) {
  if (!progress || !slot || slot.type === 'trial_gate') return false
  const maxAttempts = Number(progress.maxAttempts ?? slot.maxAttempts ?? 3)
  const attemptsUsed = Number(progress.attemptsUsed ?? 0)
  const bestScore = Number(progress.bestScore ?? 0)
  const passScore = Number(slot.passScore ?? 70)

  return progress.status === 'retry_ready' || (attemptsUsed >= maxAttempts && bestScore < passScore)
}

export function isChallengeSlotOpen(slot: ChallengeSlot, now = Date.now()) {
  const opensAt = toChronicleDate(slot.opensAt)?.getTime() ?? 0
  const closesAt = toChronicleDate(slot.closesAt)?.getTime() ?? Number.POSITIVE_INFINITY
  return opensAt <= now && closesAt >= now
}

export function getSlotStudyFragmentIds(slot: ChallengeSlot | null | undefined) {
  if (!slot) return []
  if (slot.studyFragmentIds?.length) return slot.studyFragmentIds
  if (slot.quizFragmentIds?.length) return slot.quizFragmentIds
  return slot.targetFragmentIds ?? []
}

export function isReconstructionAvailable({
  reconstruction,
  slotMap,
  challengeProgressMap,
  reconstructionProgressMap,
}: ReconstructionAvailabilityParams) {
  if (reconstructionProgressMap.get(reconstruction.id)?.status === 'completed') return true

  return reconstruction.requiredChallengeSlotIds.every((slotId) => {
    const slot = slotMap.get(slotId)
    const progress = challengeProgressMap.get(slotId)
    return isChallengeProgressCompleted(progress) &&
      Number(progress?.bestScore ?? 0) >= Number(slot?.passScore ?? 70)
  })
}

export function getChronicleTrialState({
  chapterProgress,
  unlockedCount,
  masteredCount,
  completedReconstructionCount,
  answeredCount,
  accuracyPercent,
  requiredUnlocked,
  requiredMastered,
  requiredReconstructions,
  requiredAnswered,
  requiredAccuracy,
}: ChronicleTrialStateParams) {
  const requirements = [
    { enabled: requiredUnlocked > 0, met: unlockedCount >= requiredUnlocked },
    { enabled: requiredMastered > 0, met: masteredCount >= requiredMastered },
    {
      enabled: requiredReconstructions > 0,
      met: completedReconstructionCount >= requiredReconstructions,
    },
    { enabled: requiredAnswered > 0, met: answeredCount >= requiredAnswered },
    { enabled: requiredAccuracy > 0, met: accuracyPercent >= requiredAccuracy },
  ].filter((requirement) => requirement.enabled)
  const chapterCompleted = Boolean(
    chapterProgress?.completed || chapterProgress?.status === 'completed',
  )
  const reconstructionRequirementMet =
    requiredReconstructions <= 0 || completedReconstructionCount >= requiredReconstructions
  const persistedTrialUnlocked = Boolean(
    chapterCompleted || (chapterProgress?.trialUnlocked && reconstructionRequirementMet),
  )

  return {
    chapterCompleted,
    reconstructionRequirementMet,
    trialReady: persistedTrialUnlocked || requirements.every((requirement) => requirement.met),
    completedRequirements: requirements.filter((requirement) => requirement.met).length,
    requirementCount: requirements.length,
  }
}

export function getActiveChallengeSlot({
  slots,
  challengeProgressMap,
  trialReady,
  now,
}: ActiveChallengeSlotParams) {
  const openSlots = slots.filter((slot) => isChallengeSlotOpen(slot, now))
  const visibleOpenSlots = trialReady
    ? openSlots
    : openSlots.filter((slot) => slot.type !== 'trial_gate')
  const isSlotDone = (slot: ChallengeSlot) => {
    const progress = challengeProgressMap.get(slot.id)
    return isChallengeProgressCompleted(progress) && !isChallengeProgressRetryReady(progress, slot)
  }
  const trialSlot = visibleOpenSlots.find((slot) =>
    slot.type === 'trial_gate' &&
    !isSlotDone(slot),
  )
  const nextPracticeSlot = visibleOpenSlots.find((slot) =>
    slot.type !== 'trial_gate' &&
    !isSlotDone(slot),
  )
  const nextUnfinishedSlot = visibleOpenSlots.find((slot) =>
    !isSlotDone(slot),
  )

  if (trialReady && trialSlot) return trialSlot
  return nextPracticeSlot ?? nextUnfinishedSlot ?? visibleOpenSlots[0] ?? slots[0] ?? null
}

export function buildChronicleRoute({
  fragments,
  slots,
  reconstructions,
  activeSlotId,
  trialReady,
  now,
  progressMap,
  challengeProgressMap,
  reconstructionProgressMap,
}: BuildChronicleRouteParams): ChronicleRouteItem[] {
  const orderedFragments = [...fragments].sort((left, right) => left.order - right.order)
  const fragmentIndex = new Map(orderedFragments.map((fragment, index) => [fragment.id, index]))
  const slotMap = new Map(slots.map((slot) => [slot.id, slot]))
  const slotsAtIndex = new Map<number, ChallengeSlot[]>()
  const reconstructionsAtIndex = new Map<number, ChronicleReconstruction[]>()

  for (const slot of slots) {
    const targetIndexes = getSlotStudyFragmentIds(slot)
      .map((fragmentId) => fragmentIndex.get(fragmentId))
      .filter((index): index is number => index !== undefined)
    const routeIndex = slot.type === 'trial_gate'
      ? orderedFragments.length
      : targetIndexes.length > 0
        ? Math.max(...targetIndexes) + 1
        : 0
    slotsAtIndex.set(routeIndex, [...(slotsAtIndex.get(routeIndex) ?? []), slot])
  }

  for (const reconstruction of reconstructions) {
    const requiredIndexes = reconstruction.requiredFragmentIds
      .map((fragmentId) => fragmentIndex.get(fragmentId))
      .filter((index): index is number => index !== undefined)
    const routeIndex = requiredIndexes.length > 0 ? Math.max(...requiredIndexes) + 1 : 0
    reconstructionsAtIndex.set(routeIndex, [
      ...(reconstructionsAtIndex.get(routeIndex) ?? []),
      reconstruction,
    ])
  }

  const getSlotStatus = (slot: ChallengeSlot): ChronicleRouteStatus => {
    const progress = challengeProgressMap.get(slot.id)
    if (isChallengeProgressRetryReady(progress, slot)) return 'available'
    if (isChallengeProgressCompleted(progress)) return 'completed'
    if (slot.type === 'trial_gate') return trialReady ? 'trial' : 'locked'
    if (progress?.quizId) return 'created'

    const studyIsRead = getSlotStudyFragmentIds(slot)
      .every((fragmentId) => progressMap.get(fragmentId)?.read)
    if (!studyIsRead) return 'locked'
    if (slot.id === activeSlotId && isChallengeSlotOpen(slot, now)) return 'available'
    return 'locked'
  }

  const result: ChronicleRouteItem[] = []
  for (let index = 0; index <= orderedFragments.length; index += 1) {
    const scheduledSlots = slotsAtIndex.get(index) ?? []
    scheduledSlots
      .sort((left, right) =>
        Number(toChronicleDate(left.opensAt)?.getTime() ?? 0) -
        Number(toChronicleDate(right.opensAt)?.getTime() ?? 0),
      )
      .forEach((slot) => result.push({ kind: 'challenge', slot, status: getSlotStatus(slot) }))

    const scheduledReconstructions = reconstructionsAtIndex.get(index) ?? []
    scheduledReconstructions
      .sort((left, right) => left.order - right.order)
      .forEach((reconstruction) => {
        const completed = reconstructionProgressMap.get(reconstruction.id)?.status === 'completed'
        const available = isReconstructionAvailable({
          reconstruction,
          slotMap,
          challengeProgressMap,
          reconstructionProgressMap,
        })
        result.push({
          kind: 'reconstruction',
          reconstruction,
          status: completed ? 'completed' : available ? 'available' : 'locked',
        })
      })

    const fragment = orderedFragments[index]
    if (!fragment) continue
    result.push({
      kind: 'fragment',
      fragment,
      status: getChronicleFragmentStage({
        fragment,
        progress: progressMap.get(fragment.id),
        isFirstFragment: fragment.id === orderedFragments[0]?.id,
      }),
    })
  }

  return result
}
