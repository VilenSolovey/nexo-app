import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getAllQuizzes } from "@nexo/services/quiz.service"
import { normalizeQuizzes } from "@nexo/utils/quiz.mapper"
import type { Quiz } from "@nexo/types/quiz.types"

const PUBLIC_QUIZZES_CACHE_KEY = "__public__"
const quizzesCache = new Map<string, Quiz[]>()

export function useAllQuizzes(userId?: string | null) {
  const cacheKey = userId ?? PUBLIC_QUIZZES_CACHE_KEY
  const cachedQuizzes = useMemo(() => quizzesCache.get(cacheKey), [cacheKey])
  const [quizzes, setQuizzes] = useState<Quiz[]>(cachedQuizzes ?? [])
  const [loading, setLoading] = useState(!cachedQuizzes)
  const [ready, setReady] = useState(Boolean(cachedQuizzes))
  const [error, setError] = useState<string | null>(null)
  const hasLoadedRef = useRef(Boolean(cachedQuizzes))
  const requestIdRef = useRef(0)

  const refetch = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    if (!hasLoadedRef.current) setLoading(true)
    setError(null)

    try {
      const rows = await getAllQuizzes(userId)
      if (requestId !== requestIdRef.current) return
      const normalized = normalizeQuizzes(rows)
      quizzesCache.set(cacheKey, normalized)
      setQuizzes(normalized)
      setReady(true)
    } catch (e: any) {
      if (requestId !== requestIdRef.current) return
      setError(e?.message ?? "Failed to load quizzes")
    } finally {
      if (requestId === requestIdRef.current) {
        hasLoadedRef.current = true
        setLoading(false)
      }
    }
  }, [cacheKey, userId])

  useEffect(() => {
    const cached = quizzesCache.get(cacheKey)
    hasLoadedRef.current = Boolean(cached)

    if (cached) {
      setQuizzes(cached)
      setReady(true)
      setLoading(false)
    } else {
      setQuizzes([])
      setReady(false)
      setLoading(true)
    }

    void refetch()

    return () => {
      requestIdRef.current += 1
    }
  }, [cacheKey, refetch])

  return { quizzes, loading, ready, error, refetch }
}
