import { useEffect, useState } from "react"
import { getCurrentUser, listenUser } from "@nexo/services/user.service"
import type { User } from "@nexo/types/user.types"

// Temporary: accept userId; later can be wired to Firebase Auth currentUser
// TODO : Integrate with Auth context to get current user ID
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const u = await getCurrentUser(userId)
        if (!mounted) return
        setUser(u)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message ?? "Failed to load user")
      } finally {
        mounted && setLoading(false)
      }
    })()

    const unsub = listenUser(userId, (u) => {
      setUser(u)
    })

    return () => {
      mounted = false
      unsub && unsub()
    }
  }, [userId])

  return { user, loading, error }
}
