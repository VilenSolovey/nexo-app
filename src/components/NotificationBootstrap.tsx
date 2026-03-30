import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { useAuth } from '@nexo/contexts/AuthProvider'
import {
  getNotificationQuizId,
  registerForPushNotificationsAsync,
} from '@nexo/services/notifications.service'
import { saveExpoPushToken } from '@nexo/services/user.service'

export function NotificationBootstrap() {
  const router = useRouter()
  const { user, userProfile, refreshUserProfile } = useAuth()

  useEffect(() => {
    const navigateFromResponse = (response: Notifications.NotificationResponse | null) => {
      if (!response) {
        return
      }

      const quizId = getNotificationQuizId(
        response.notification.request.content.data as { quizId?: unknown },
      )

      if (quizId) {
        router.push(`/quiz-play/${quizId}`)
        return
      }

      router.push('/(tabs)/quiz')
    }

    void Notifications.getLastNotificationResponseAsync().then(navigateFromResponse)

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      navigateFromResponse(response)
    })

    return () => {
      subscription.remove()
    }
  }, [router])

  useEffect(() => {
    if (!user?.uid || !userProfile?.id) {
      return
    }

    let isCancelled = false

    const syncPushToken = async () => {
      try {
        const expoPushToken = await registerForPushNotificationsAsync()

        if (!expoPushToken || isCancelled) {
          return
        }

        const existingTokens = userProfile.expoPushTokens ?? []

        if (existingTokens.includes(expoPushToken)) {
          return
        }

        await saveExpoPushToken(user.uid, expoPushToken)

        if (!isCancelled) {
          await refreshUserProfile()
        }
      } catch (error) {
        console.warn('Failed to register push notifications', error)
      }
    }

    void syncPushToken()

    return () => {
      isCancelled = true
    }
  }, [refreshUserProfile, user?.uid, userProfile?.expoPushTokens, userProfile?.id])

  return null
}
