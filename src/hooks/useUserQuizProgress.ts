import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getUserQuizProgressList } from '@nexo/services/progress.service'
import type { UserQuizProgress } from '@nexo/types/result.types'

const progressCache = new Map<string, UserQuizProgress[]>()

export function useUserQuizProgress(userId?: string) {
  const cachedProgress = userId ? progressCache.get(userId) : undefined
  const [progressList, setProgressList] = useState<UserQuizProgress[]>(cachedProgress ?? [])
  const [loading, setLoading] = useState(!cachedProgress)
  const [ready, setReady] = useState(Boolean(cachedProgress))
  const [error, setError] = useState<string | null>(null)
  const hasLoadedRef = useRef(Boolean(cachedProgress))
  const requestIdRef = useRef(0)

  const refetch = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (!userId) {
      setProgressList([])
      setLoading(false)
      setReady(true)
      hasLoadedRef.current = true
      return
    }

    if (!hasLoadedRef.current) setLoading(true)
    setError(null)

    try {
      const rows = await getUserQuizProgressList(userId)
      if (requestId !== requestIdRef.current) return
      progressCache.set(userId, rows)
      setProgressList(rows)
      setReady(true)
    } catch (e: any) {
      if (requestId !== requestIdRef.current) return
      setError(e?.message ?? 'Failed to load quiz progress')
    } finally {
      if (requestId === requestIdRef.current) {
        hasLoadedRef.current = true
        setLoading(false)
      }
    }
  }, [userId])

  useEffect(() => {
    const cached = userId ? progressCache.get(userId) : undefined
    hasLoadedRef.current = Boolean(cached)

    if (cached) {
      setProgressList(cached)
      setReady(true)
      setLoading(false)
    } else {
      setProgressList([])
      setReady(false)
      setLoading(true)
    }

    void refetch()

    return () => {
      requestIdRef.current += 1
    }
  }, [refetch, userId])

  const progressMap = useMemo(
    () => new Map(progressList.map((item) => [item.quizId, item])),
    [progressList],
  )

  return { progressList, progressMap, loading, ready, error, refetch }
}
