import { useCallback, useEffect, useMemo, useState } from 'react'
import { getUserQuizProgressList } from '@nexo/services/progress.service'
import type { UserQuizProgress } from '@nexo/types/result.types'

export function useUserQuizProgress(userId?: string) {
  const [progressList, setProgressList] = useState<UserQuizProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!userId) {
      setProgressList([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rows = await getUserQuizProgressList(userId)
      setProgressList(rows)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load quiz progress')
      setProgressList([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refetch()
  }, [userId])

  const progressMap = useMemo(
    () => new Map(progressList.map((item) => [item.quizId, item])),
    [progressList],
  )

  return { progressList, progressMap, loading, error, refetch }
}
