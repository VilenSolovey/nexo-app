import { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore"

import { db } from "@nexo/services/firebase"
import type { QuizResult } from "@nexo/types/result.types"

export function useRecentResults(userId?: string) {
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const refetch = async () => {
    if (!userId) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const q = query(
        collection(db, "results"),
        where("userId", "==", userId),
        orderBy("completedAt", "desc"),
        limit(3)
      )

      const snap = await getDocs(q)
      const rows = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<QuizResult, "id">),
      }))

      setResults(rows)
    } catch (err) {
      console.error("Failed to fetch recent results:", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // initial load
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return { results, loading, refetch }
}