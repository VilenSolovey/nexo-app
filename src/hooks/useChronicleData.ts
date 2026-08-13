import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  getChronicleChapters,
  getChapterChallengeSlots,
  getChapterFragments,
  getChapterReconstructions,
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
  ChronicleFragment,
  ChronicleReconstruction,
  UserChapterProgress,
  UserChallengeProgress,
  UserFragmentProgress,
  UserQuestionStats,
  UserReconstructionProgress,
} from '@nexo/types/chronicle.types'

type ChronicleStaticContent = {
  fragments: ChronicleFragment[]
  slots: ChallengeSlot[]
  reconstructions: ChronicleReconstruction[]
}

type ChronicleData = ChronicleStaticContent & {
  chapters: ChronicleChapter[]
  selectedChapterIndex: number
  chapter: ChronicleChapter | null
  progressList: UserFragmentProgress[]
  questionStatsList: UserQuestionStats[]
  challengeProgressList: UserChallengeProgress[]
  reconstructionProgressList: UserReconstructionProgress[]
  chapterProgress: UserChapterProgress | null
}

type LoadChronicleOptions = {
  chapterIndex?: number
  blocking?: boolean
  forceStatic?: boolean
}

function emptyChronicleData(): ChronicleData {
  return {
    chapters: [],
    selectedChapterIndex: 0,
    chapter: null,
    fragments: [],
    slots: [],
    reconstructions: [],
    progressList: [],
    questionStatsList: [],
    challengeProgressList: [],
    reconstructionProgressList: [],
    chapterProgress: null,
  }
}

function getInitialChapterIndex(
  chapters: ChronicleChapter[],
  progressRows: UserChapterProgress[],
) {
  const progressMap = new Map(progressRows.map((progress) => [progress.chapterId, progress]))
  const latestUnfinishedActiveIndex = chapters.reduce((latestIndex, chapter, index) => {
    const progress = progressMap.get(chapter.id)
    const completed = progress?.completed || progress?.status === 'completed'
    return chapter.isActive !== false && !completed ? index : latestIndex
  }, -1)

  return latestUnfinishedActiveIndex >= 0
    ? latestUnfinishedActiveIndex
    : Math.max(0, chapters.length - 1)
}

export function useChronicleData(userId?: string) {
  const [data, setData] = useState<ChronicleData>(emptyChronicleData)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedChapterIndexRef = useRef(0)
  const didAutoFocusChapterRef = useRef(false)
  const hasLoadedRef = useRef(false)
  const requestIdRef = useRef(0)
  const chaptersCacheRef = useRef<ChronicleChapter[] | null>(null)
  const contentCacheRef = useRef(new Map<string, ChronicleStaticContent>())

  const load = useCallback(async (options: LoadChronicleOptions = {}) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    const blocking = options.blocking ?? true

    if (blocking) setLoading(true)
    setError(null)

    try {
      const forceStatic = options.forceStatic === true
      const shouldAutoFocus = options.chapterIndex === undefined && !didAutoFocusChapterRef.current
      const [chapters, chapterProgressRows] = await Promise.all([
        !forceStatic && chaptersCacheRef.current
          ? Promise.resolve(chaptersCacheRef.current)
          : getChronicleChapters(),
        shouldAutoFocus && userId
          ? getUserChapterProgressList(userId)
          : Promise.resolve([]),
      ])

      if (requestId !== requestIdRef.current) return
      chaptersCacheRef.current = chapters

      const requestedIndex = options.chapterIndex ?? (
        shouldAutoFocus
          ? getInitialChapterIndex(chapters, chapterProgressRows)
          : selectedChapterIndexRef.current
      )
      const selectedChapterIndex = chapters.length > 0
        ? Math.min(Math.max(requestedIndex, 0), chapters.length - 1)
        : 0
      const chapter = chapters[selectedChapterIndex] ?? null

      didAutoFocusChapterRef.current = true
      selectedChapterIndexRef.current = selectedChapterIndex

      if (!chapter) {
        setData({
          ...emptyChronicleData(),
          chapters,
          selectedChapterIndex,
        })
        hasLoadedRef.current = true
        return
      }

      const cachedContent = forceStatic ? undefined : contentCacheRef.current.get(chapter.id)
      const staticContentPromise = cachedContent
        ? Promise.resolve(cachedContent)
        : Promise.all([
          getChapterFragments(chapter.id),
          getChapterChallengeSlots(chapter.id),
          getChapterReconstructions(chapter.id),
        ]).then(([fragments, slots, reconstructions]) => ({
          fragments,
          slots,
          reconstructions,
        }))

      const [
        staticContent,
        progressList,
        questionStatsList,
        challengeProgressList,
        reconstructionProgressList,
        chapterProgress,
      ] = await Promise.all([
        staticContentPromise,
        userId ? getUserFragmentProgressList(userId, chapter.id) : Promise.resolve([]),
        userId ? getUserQuestionStatsList(userId, chapter.id) : Promise.resolve([]),
        userId ? getUserChallengeProgressList(userId, chapter.id) : Promise.resolve([]),
        userId ? getUserReconstructionProgressList(userId, chapter.id) : Promise.resolve([]),
        userId ? getUserChapterProgress(userId, chapter.id) : Promise.resolve(null),
      ])

      if (requestId !== requestIdRef.current) return
      contentCacheRef.current.set(chapter.id, staticContent)
      setData({
        chapters,
        selectedChapterIndex,
        chapter,
        ...staticContent,
        progressList,
        questionStatsList,
        challengeProgressList,
        reconstructionProgressList,
        chapterProgress,
      })
      hasLoadedRef.current = true
    } catch (loadError: unknown) {
      if (requestId !== requestIdRef.current) return
      if (blocking || !hasLoadedRef.current) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не вдалося завантажити Хроніку',
        )
      }
    } finally {
      if (requestId === requestIdRef.current && blocking) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    requestIdRef.current += 1
    selectedChapterIndexRef.current = 0
    didAutoFocusChapterRef.current = false
    hasLoadedRef.current = false
    chaptersCacheRef.current = null
    contentCacheRef.current.clear()
    setData(emptyChronicleData())
    setError(null)
    setLoading(true)
  }, [userId])

  useFocusEffect(
    useCallback(() => {
      void load({ blocking: !hasLoadedRef.current })
    }, [load]),
  )

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await load({ blocking: false, forceStatic: true })
    } finally {
      setRefreshing(false)
    }
  }, [load])

  const selectPreviousChapter = useCallback(() => {
    const nextIndex = Math.max(0, selectedChapterIndexRef.current - 1)
    selectedChapterIndexRef.current = nextIndex
    didAutoFocusChapterRef.current = true
    void load({ chapterIndex: nextIndex })
  }, [load])

  const selectNextChapter = useCallback(() => {
    const nextIndex = Math.min(data.chapters.length - 1, selectedChapterIndexRef.current + 1)
    selectedChapterIndexRef.current = nextIndex
    didAutoFocusChapterRef.current = true
    void load({ chapterIndex: nextIndex })
  }, [data.chapters.length, load])

  return {
    ...data,
    loading,
    refreshing,
    error,
    refresh,
    reload: load,
    selectPreviousChapter,
    selectNextChapter,
  }
}
