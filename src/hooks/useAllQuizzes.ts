import { useCallback, useEffect, useState } from "react"
import { getAllQuizzes } from "@nexo/services/quiz.service"
import { normalizeQuizzes } from "@nexo/utils/quiz.mapper"
import type { Quiz } from "@nexo/types/quiz.types"

export function useAllQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)

    getAllQuizzes()
      .then(rows => setQuizzes(normalizeQuizzes(rows)))
      .catch(e => setError(e?.message ?? "Failed to load quizzes"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let mounted = true;
  
    (async () => {
      try {
        const rows = await getAllQuizzes()
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
  }, [])

  return { quizzes, loading, error, refetch }
}