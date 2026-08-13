import type {
  ChallengeSlot,
  ChronicleChapter,
  ChronicleFragment,
  ChronicleReconstruction,
  UserChapterProgress,
  UserChallengeProgress,
  UserFragmentProgress,
  UserQuestionStats,
  UserReconstructionProgress,
} from '@nexo/types/chronicle.types'
import {
  buildChronicleRoute,
  getActiveChallengeSlot,
  getChronicleTrialState,
  getSlotStudyFragmentIds,
  isChallengeProgressCompleted,
  isChallengeProgressRetryReady,
  isChallengeSlotOpen,
  isReconstructionAvailable,
  toChronicleDate,
} from '@nexo/utils/chronicle-route'

type ChronicleViewModelParams = {
  chapter: ChronicleChapter | null
  fragments: ChronicleFragment[]
  slots: ChallengeSlot[]
  reconstructions: ChronicleReconstruction[]
  progressList: UserFragmentProgress[]
  questionStatsList: UserQuestionStats[]
  challengeProgressList: UserChallengeProgress[]
  reconstructionProgressList: UserReconstructionProgress[]
  chapterProgress: UserChapterProgress | null
  now: number
}

function sumField<T>(rows: T[], select: (row: T) => unknown) {
  return rows.reduce((sum, row) => sum + Number(select(row) ?? 0), 0)
}

export function createChronicleViewModel({
  chapter,
  fragments,
  slots,
  reconstructions,
  progressList,
  questionStatsList,
  challengeProgressList,
  reconstructionProgressList,
  chapterProgress,
  now,
}: ChronicleViewModelParams) {
  const progressMap = new Map(progressList.map((progress) => [progress.fragmentId, progress]))
  const challengeProgressMap = new Map(
    challengeProgressList.map((progress) => [progress.slotId, progress]),
  )
  const reconstructionProgressMap = new Map(
    reconstructionProgressList.map((progress) => [progress.reconstructionId, progress]),
  )
  const slotMap = new Map(slots.map((slot) => [slot.id, slot]))

  const masteredCount = progressList.filter((progress) => progress.mastered).length
  const unlockedCount = progressList.filter((progress) => progress.unlocked).length
  const fallbackAnsweredCount = sumField(progressList, (progress) => progress.answered)
  const fallbackCorrectCount = sumField(progressList, (progress) => progress.correct)
  const hasQuestionStats = questionStatsList.length > 0
  const answeredCount = hasQuestionStats
    ? sumField(questionStatsList, (stats) => stats.attempts)
    : Number(chapterProgress?.answered ?? fallbackAnsweredCount)
  const correctCount = hasQuestionStats
    ? sumField(questionStatsList, (stats) => stats.correct)
    : Number(chapterProgress?.correct ?? fallbackCorrectCount)
  const accuracyPercent = Number(
    chapterProgress?.accuracyPercent ??
    (answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0),
  )
  const completedReconstructionCount = reconstructionProgressList.filter(
    (progress) => progress.status === 'completed',
  ).length
  const rule = chapter?.trialUnlockRule
  const requiredUnlocked = rule?.requiredUnlockedFragments ?? 0
  const requiredMastered = rule?.requiredMasteredFragments ?? 0
  const requiredReconstructions = rule?.requiredCompletedReconstructions ?? 0
  const requiredAnswered = rule?.minAnsweredQuestions ?? 0
  const requiredAccuracy = rule?.minAccuracyPercent ?? 0
  const trialState = getChronicleTrialState({
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
  })

  const activeSlot = getActiveChallengeSlot({
    slots,
    challengeProgressMap,
    trialReady: trialState.trialReady,
    now,
  })
  const activeSlotProgress = activeSlot
    ? challengeProgressMap.get(activeSlot.id) ?? null
    : null
  const activeSlotOpen = activeSlot ? isChallengeSlotOpen(activeSlot, now) : false
  const activeSlotRetryReady = isChallengeProgressRetryReady(activeSlotProgress, activeSlot)
  const activeSlotCompleted = !activeSlotRetryReady && isChallengeProgressCompleted(activeSlotProgress)
  const activeSlotAlreadyCreated = Boolean(activeSlotProgress?.quizId) && !activeSlotRetryReady
  const studyFragmentIds = getSlotStudyFragmentIds(activeSlot)
  const activeStudyReady = studyFragmentIds.every(
    (fragmentId) => progressMap.get(fragmentId)?.read,
  )
  const pendingDiscovery = chapterProgress?.pendingDiscovery &&
    !progressMap.get(chapterProgress.pendingDiscovery.fragmentId)?.unlocked
    ? chapterProgress.pendingDiscovery
    : null
  const discoveryReadyAt = toChronicleDate(pendingDiscovery?.readyAt)?.getTime() ?? null
  const discoveryReady = discoveryReadyAt !== null && discoveryReadyAt <= now
  const visibleActiveSlot = pendingDiscovery ? null : activeSlot

  const activeReconstruction = reconstructions.find((reconstruction) =>
    reconstructionProgressMap.get(reconstruction.id)?.status !== 'completed' &&
    isReconstructionAvailable({
      reconstruction,
      slotMap,
      challengeProgressMap,
      reconstructionProgressMap,
    }),
  ) ?? null
  const routeItems = buildChronicleRoute({
    fragments,
    slots,
    reconstructions,
    activeSlotId: visibleActiveSlot?.id,
    trialReady: trialState.trialReady,
    now,
    progressMap,
    challengeProgressMap,
    reconstructionProgressMap,
  })
  const currentDiscovery = routeItems.find(
    (item): item is Extract<typeof item, { kind: 'fragment' }> =>
      item.kind === 'fragment' && item.status === 'discovered',
  ) ?? null
  const archivedFragments = fragments
    .filter((fragment) => progressMap.get(fragment.id)?.mastered)
    .sort((left, right) => left.order - right.order)
  const foggedFragmentCount = routeItems.filter(
    (item) => item.kind === 'fragment' && item.status === 'locked',
  ).length

  return {
    progressMap,
    masteredCount,
    unlockedCount,
    answeredCount,
    accuracyPercent,
    completedReconstructionCount,
    requiredUnlocked,
    requiredMastered,
    requiredReconstructions,
    requiredAnswered,
    requiredAccuracy,
    ...trialState,
    completedTrialScore: chapterProgress?.trialBestScore ?? chapterProgress?.trialScore ?? null,
    activeSlot: visibleActiveSlot,
    activeSlotOpen: visibleActiveSlot ? activeSlotOpen : false,
    activeSlotCompleted: visibleActiveSlot ? activeSlotCompleted : false,
    activeSlotAlreadyCreated: visibleActiveSlot ? activeSlotAlreadyCreated : false,
    activeSlotRetryReady: visibleActiveSlot ? activeSlotRetryReady : false,
    activeStudyReady: visibleActiveSlot ? activeStudyReady : false,
    pendingDiscovery,
    discoveryReady,
    activeReconstruction,
    routeItems,
    currentDiscovery,
    archivedFragments,
    foggedFragmentCount,
    routeProgress: fragments.length > 0
      ? Math.round((masteredCount / fragments.length) * 100)
      : 0,
  }
}
