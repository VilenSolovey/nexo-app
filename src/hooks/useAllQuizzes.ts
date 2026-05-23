import { useCallback, useEffect, useState } from "react"
import { getAllQuizzes } from "@nexo/services/quiz.service"
import { normalizeQuizzes } from "@nexo/utils/quiz.mapper"
import type { Quiz } from "@nexo/types/quiz.types"

export function useAllQuizzes(userId?: string | null) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)

    getAllQuizzes(userId)
      .then(rows => setQuizzes(normalizeQuizzes(rows)))
      .catch(e => setError(e?.message ?? "Failed to load quizzes"))
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    let mounted = true;
  
    (async () => {
      try {
        const rows = await getAllQuizzes(userId)
        if (!mounted) return
        
        setQuizzes(normalizeQuizzes(rows))
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message ?? "Failed to load quizzes")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [userId])

  return { quizzes, loading, error, refetch }
}
