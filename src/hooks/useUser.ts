import { useEffect, useState } from "react"
import { listenUser } from "@nexo/services/user.service"
import type { UserProfile } from "@nexo/types/user.types"

export function useUser(userId: string) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)

    const unsubscribe = listenUser(userId, (u) => {
      setUser(u)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  return { user, loading, error }
}