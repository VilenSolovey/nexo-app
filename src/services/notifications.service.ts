import { Platform } from 'react-native'
import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'

type NotificationExtra = {
  eas?: {
    projectId?: string
  }
}

type NotificationData = {
  quizId?: unknown
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

function getProjectId() {
  const extra = (Constants.expoConfig?.extra ?? {}) as NotificationExtra
  return Constants.easConfig?.projectId ?? extra.eas?.projectId ?? null
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#34D399',
    })
  }

  const existingPermissions = await Notifications.getPermissionsAsync()
  let finalStatus = existingPermissions.status

  if (finalStatus !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync()
    finalStatus = requestedPermissions.status
  }

  if (finalStatus !== 'granted') {
    return null
  }

  const projectId = getProjectId()

  if (!projectId) {
    throw new Error('Missing EAS projectId for push notifications')
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId })
  return token.data
}

export function getNotificationQuizId(data: NotificationData | undefined) {
  if (!data || typeof data.quizId !== 'string' || !data.quizId.trim()) {
    return null
  }

  return data.quizId
}
