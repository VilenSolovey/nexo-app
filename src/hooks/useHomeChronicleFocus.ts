import { useCallback, useEffect, useState } from 'react'
import {
  getChapterChallengeSlots,
  getChapterReconstructions,
  getChronicleChapters,
  getUserChapterProgress,
  getUserChapterProgressList,
  getUserChallengeProgressList,
  getUserFragmentProgressList,
  getUserQuestionStatsList,
  getUserReconstructionProgressList,
} from '@nexo/services/chronicle.service'
import type {
  ChallengeSlot,
  ChronicleChapter,
} from '@nexo/types/chronicle.types'
import {
  formatChronicleDate,
  formatChronicleDiscoveryReadyAt,
  getChronicleTrialState,
  getSlotStudyFragmentIds,
  isChallengeProgressCompleted,
  isChallengeSlotOpen,
  isReconstructionAvailable,
  toChronicleDate,
} from '@nexo/utils/chronicle-route'

export type HomeFocusStatus =
  | 'loading'
  | 'available'
  | 'created'
  | 'study'
  | 'reconstruction'
  | 'searching'
  | 'discovery_ready'
  | 'waiting'
  | 'complete'
  | 'error'
  | 'empty'

export type HomeChronicleFocus = {
  status: HomeFocusStatus
  challengeTitle?: string
  opensAtLabel?: string
  readyAtMs?: number
}

const INITIAL_FOCUS: HomeChronicleFocus = { status: 'loading' }

function getActiveChapter(
  chapters: ChronicleChapter[],
  completedChapterIds: Set<string>,
) {
  return chapters.find((chapter) => chapter.isActive !== false && !completedChapterIds.has(chapter.id))
}

export function useHomeChronicleFocus(userId?: string | null) {
  const [focus, setFocus] = useState<HomeChronicleFocus>(INITIAL_FOCUS)

  const refresh = useCallback(async () => {
    try {
      const [chapters, chapterProgressList] = await Promise.all([
        getChronicleChapters(),
        userId ? getUserChapterProgressList(userId) : Promise.resolve([]),
      ])
      const completedChapterIds = new Set(
        chapterProgressList
          .filter((progress) => progress.completed || progress.status === 'completed')
          .map((progress) => progress.chapterId),
      )
      const chapter = getActiveChapter(chapters, completedChapterIds)

      if (!chapter) {
        setFocus({ status: chapters.length ? 'complete' : 'empty' })
        return
      }

      const [
        slots,
        reconstructions,
        challengeProgressList,
        reconstructionProgressList,
        fragmentProgressList,
        questionStatsList,
        chapterProgress,
      ] = await Promise.all([
        getChapterChallengeSlots(chapter.id),
        getChapterReconstructions(chapter.id),
        userId ? getUserChallengeProgressList(userId, chapter.id) : Promise.resolve([]),
        userId ? getUserReconstructionProgressList(userId, chapter.id) : Promise.resolve([]),
        userId ? getUserFragmentProgressList(userId, chapter.id) : Promise.resolve([]),
        userId ? getUserQuestionStatsList(userId, chapter.id) : Promise.resolve([]),
        userId ? getUserChapterProgress(userId, chapter.id) : Promise.resolve(null),
      ])
      const challengeProgressMap = new Map(challengeProgressList.map((progress) => [progress.slotId, progress]))
      const reconstructionProgressMap = new Map(
        reconstructionProgressList.map((progress) => [progress.reconstructionId, progress]),
      )
      const slotMap = new Map(slots.map((slot) => [slot.id, slot]))
      const unlockedCount = fragmentProgressList.filter((progress) => progress.unlocked).length
      const masteredCount = fragmentProgressList.filter((progress) => progress.mastered).length
      const answeredCount = questionStatsList.reduce((sum, item) => sum + Number(item.attempts ?? 0), 0)
      const correctCount = questionStatsList.reduce((sum, item) => sum + Number(item.correct ?? 0), 0)
      const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
      const rule = chapter.trialUnlockRule
      const requiredUnlocked = rule.requiredUnlockedFragments ?? 0
      const requiredReconstructions = rule.requiredCompletedReconstructions ?? 0
      const completedReconstructionCount = reconstructionProgressList.filter(
        (progress) => progress.status === 'completed',
      ).length
      const { trialReady } = getChronicleTrialState({
        chapterProgress,
        unlockedCount,
        masteredCount,
        completedReconstructionCount,
        answeredCount,
        accuracyPercent,
        requiredUnlocked,
        requiredMastered: rule.requiredMasteredFragments,
        requiredReconstructions,
        requiredAnswered: rule.minAnsweredQuestions,
        requiredAccuracy: rule.minAccuracyPercent,
      })
      const availableSlots = slots.filter((slot) => slot.type !== 'trial_gate' || trialReady)
      const readFragmentIds = new Set(
        fragmentProgressList.filter((progress) => progress.read).map((progress) => progress.fragmentId),
      )
      const isStudyReady = (slot: ChallengeSlot) =>
        getSlotStudyFragmentIds(slot).every((fragmentId) => readFragmentIds.has(fragmentId))
      const pendingDiscovery = chapterProgress?.pendingDiscovery
      const pendingAlreadyUnlocked = pendingDiscovery
        ? fragmentProgressList.some((progress) =>
          progress.fragmentId === pendingDiscovery.fragmentId && progress.unlocked)
        : false
      if (pendingDiscovery && !pendingAlreadyUnlocked) {
        const readyAtMs = toChronicleDate(pendingDiscovery.readyAt)?.getTime() ?? 0
        setFocus({
          status: readyAtMs > Date.now() ? 'searching' : 'discovery_ready',
          opensAtLabel: formatChronicleDiscoveryReadyAt(pendingDiscovery.readyAt) ?? undefined,
          readyAtMs,
        })
        return
      }
      const activeReconstruction = reconstructions.find((reconstruction) => {
        if (reconstructionProgressMap.get(reconstruction.id)?.status === 'completed') return false
        return isReconstructionAvailable({
          reconstruction,
          slotMap,
          challengeProgressMap,
          reconstructionProgressMap,
        })
      })

      if (activeReconstruction) {
        setFocus({
          status: 'reconstruction',
          challengeTitle: activeReconstruction.title,
        })
        return
      }
      const openSlot = availableSlots.find(
        (slot) => isChallengeSlotOpen(slot) && !isChallengeProgressCompleted(challengeProgressMap.get(slot.id)),
      )

      if (openSlot && !isStudyReady(openSlot)) {
        setFocus({ status: 'study', challengeTitle: openSlot.title })
        return
      }

      if (openSlot) {
        const progress = challengeProgressMap.get(openSlot.id)
        setFocus({
          status: progress?.quizId ? 'created' : 'available',
          challengeTitle: openSlot.title,
        })
        return
      }

      const nextSlot = availableSlots.find((slot) => {
        const opensAt = toChronicleDate(slot.opensAt)?.getTime() ?? 0
        return opensAt > Date.now() && !isChallengeProgressCompleted(challengeProgressMap.get(slot.id))
      })
      setFocus({
        status: 'waiting',
        opensAtLabel: nextSlot ? formatChronicleDate(nextSlot.opensAt) ?? undefined : undefined,
      })
    } catch (error) {
      console.error('Failed to load Home focus:', error)
      setFocus((current) => current.status === 'loading' ? { status: 'error' } : current)
    }
  }, [userId])

  useEffect(() => {
    setFocus(INITIAL_FOCUS)
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (focus.status !== 'searching' || !focus.readyAtMs) return
    const delay = focus.readyAtMs - Date.now()
    if (delay <= 0) {
      void refresh()
      return
    }
    const timeout = setTimeout(() => { void refresh() }, delay + 100)
    return () => clearTimeout(timeout)
  }, [focus.readyAtMs, focus.status, refresh])

  return { focus, refresh }
}
