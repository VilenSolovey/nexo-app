import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getFunctions } from "firebase/functions"
import { getStorage } from "firebase/storage"

type ExpoExtra = {
  FIREBASE_API_KEY?: string
  FIREBASE_AUTH_DOMAIN?: string
  FIREBASE_PROJECT_ID?: string
  FIREBASE_STORAGE_BUCKET?: string
  FIREBASE_MESSAGING_SENDER_ID?: string
  FIREBASE_APP_ID?: string
  FIREBASE_MEASUREMENT_ID?: string
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra

function resolveConfigValue(
  publicEnvValue: string | undefined,
  extraValue: string | undefined,
  key: string,
) {
  const value = publicEnvValue ?? extraValue

  if (!value) {
    throw new Error(`Missing Firebase config value: ${key}`)
  }

  return value
}

const firebaseConfig = {
  apiKey: resolveConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    extra.FIREBASE_API_KEY,
    "apiKey",
  ),
  authDomain: resolveConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    extra.FIREBASE_AUTH_DOMAIN,
    "authDomain",
  ),
  projectId: resolveConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    extra.FIREBASE_PROJECT_ID,
    "projectId",
  ),
  storageBucket: resolveConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    extra.FIREBASE_STORAGE_BUCKET,
    "storageBucket",
  ),
  messagingSenderId: resolveConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    extra.FIREBASE_MESSAGING_SENDER_ID,
    "messagingSenderId",
  ),
  appId: resolveConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    extra.FIREBASE_APP_ID,
    "appId",
  ),
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? extra.FIREBASE_MEASUREMENT_ID,
}

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

function createAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  } catch {
    return getAuth(app)
  }
}

export const db = getFirestore(app)
export const auth = createAuth()
export const storage = getStorage(app)
export const functions = getFunctions(app, "europe-west1")
