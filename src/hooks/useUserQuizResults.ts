import { useCallback, useEffect, useRef, useState } from 'react'
import { getUserResultsList } from '@nexo/services/result.service'
import type { QuizResult } from '@nexo/types/result.types'

export function useUserQuizResults(userId?: string) {
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const refetch = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (!userId) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const nextResults = await getUserResultsList(userId)
      if (requestId !== requestIdRef.current) return
      setResults(nextResults)
    } catch (caughtError: any) {
      if (requestId !== requestIdRef.current) return
      setError(caughtError?.message ?? 'Failed to load quiz results')
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [userId])

  useEffect(() => {
    setResults([])
    setLoading(true)
    setError(null)
    void refetch()

    return () => {
      requestIdRef.current += 1
    }
  }, [refetch])

  return { results, loading, error, refetch }
}
