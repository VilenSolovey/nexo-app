import { useCallback, useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from 'react'
import { AppState } from 'react-native'
import type { User } from 'firebase/auth'
import { auth } from '@nexo/services/firebase'
import { registerDailyActivity } from '@nexo/services/user.service'
import type { UserProfile } from '@nexo/types/user.types'
import type { AuthStatus } from '@nexo/contexts/AuthProvider'

type UseDailyActivitySyncParams = {
  status: AuthStatus
  userProfile: UserProfile | null
  userRef: MutableRefObject<User | null>
  userProfileRef: MutableRefObject<UserProfile | null>
  dailySyncKeyRef: MutableRefObject<string | null>
  dailySyncInFlightRef: MutableRefObject<boolean>
  setUserProfile: Dispatch<SetStateAction<UserProfile | null>>
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useDailyActivitySync({
  status,
  userProfile,
  userRef,
  userProfileRef,
  dailySyncKeyRef,
  dailySyncInFlightRef,
  setUserProfile,
}: UseDailyActivitySyncParams) {
  const syncDailyActivity = useCallback(async () => {
    const currentUser = auth.currentUser ?? userRef.current
    const currentProfile = userProfileRef.current
    if (!currentUser || currentProfile?.id !== currentUser.uid || dailySyncInFlightRef.current) return

    const syncKey = `${currentUser.uid}:${localDateKey()}`
    if (dailySyncKeyRef.current === syncKey) return

    dailySyncInFlightRef.current = true
    let lastError: unknown

    try {
      for (const retryDelay of [0, 400, 1200]) {
        if (retryDelay > 0) await delay(retryDelay)

        try {
          const result = await registerDailyActivity(currentUser.uid)
          dailySyncKeyRef.current = syncKey
          setUserProfile((current) => {
            if (!current || current.id !== currentUser.uid) return current

            const next = {
              ...current,
              streak: result.streakDays,
              streakDays: result.streakDays,
              lastActiveDate: result.lastActiveDate,
            }
            userProfileRef.current = next
            return next
          })
          return
        } catch (error) {
          lastError = error
        }
      }

      console.error('Failed to register daily activity after retries:', lastError)
    } finally {
      dailySyncInFlightRef.current = false
    }
  }, [dailySyncInFlightRef, dailySyncKeyRef, setUserProfile, userProfileRef, userRef])

  useEffect(() => {
    if (status === 'authenticated' && userProfile) {
      void syncDailyActivity()
    }
  }, [status, syncDailyActivity, userProfile])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void syncDailyActivity()
    })
    return () => subscription.remove()
  }, [syncDailyActivity])
}
