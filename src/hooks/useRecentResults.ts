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

  useEffect(() => {
    if (!userId) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(
      collection(db, "results"),
      where("userId", "==", userId),
      orderBy("completedAt", "desc"),
      limit(3)
    )

    getDocs(q)
      .then((snap) => {
        const rows = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<QuizResult, "id">),
        }))

        setResults(rows)
      })
      .catch((err) => {
        console.error("Failed to fetch recent results:", err)
        setResults([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId])

  return { results, loading }
} 