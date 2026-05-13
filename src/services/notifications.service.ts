import { Platform } from "react-native"
import * as Device from "expo-device"
import Constants from "expo-constants"
import * as Notifications from "expo-notifications"
import { arrayUnion, doc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@nexo/services/firebase"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

function getProjectId() {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined
  return extra?.eas?.projectId
}

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") return

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#5EEAD4",
  })
}

async function requestNotificationPermission() {
  const currentPermission = await Notifications.getPermissionsAsync()

  if (currentPermission.granted) {
    return true
  }

  const requestedPermission = await Notifications.requestPermissionsAsync()
  return requestedPermission.granted
}

export async function registerUserForPushNotifications(userId: string) {
  if (!Device.isDevice) {
    return null
  }

  await ensureAndroidNotificationChannel()

  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) {
    return null
  }

  const projectId = getProjectId()
  if (!projectId) {
    throw new Error("Missing EAS projectId for Expo push notifications")
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId })
  const expoPushToken = token.data

  await setDoc(
    doc(db, "users", userId),
    {
      expoPushTokens: arrayUnion(expoPushToken),
      expoPushTokenUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  return expoPushToken
}
