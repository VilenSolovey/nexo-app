import { useEffect } from "react"
import { useRouter } from "expo-router"
import * as Notifications from "expo-notifications"
import { useAuth } from "@nexo/contexts/AuthProvider"
import { registerUserForPushNotifications } from "@nexo/services/notifications.service"

function getNotificationType(data: Record<string, unknown>) {
  return typeof data.type === "string" ? data.type : null
}

export function NotificationBootstrap() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user?.uid) return

    registerUserForPushNotifications(user.uid).catch((error) => {
      console.warn("Failed to register for push notifications:", error)
    })
  }, [user?.uid])

  useEffect(() => {
    const openNotificationDestination = (data: Record<string, unknown>) => {
      const type = getNotificationType(data)

      if (type === "new-quiz" || type === "new-quiz-batch") {
        router.push("/quiz")
      }
    }

    const lastResponse = Notifications.getLastNotificationResponse()
    if (lastResponse) {
      openNotificationDestination(lastResponse.notification.request.content.data)
      Notifications.clearLastNotificationResponse()
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openNotificationDestination(response.notification.request.content.data)
    })

    return () => subscription.remove()
  }, [router])

  return null
}
