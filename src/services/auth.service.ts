import { auth, db } from "@nexo/services/firebase"
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"

export async function registerUser(email: string, password: string, name: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  const user = cred.user

  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    coins: 0,
    level: 1,
    streakDays: 0,
    completedQuizzes: [],
  })

  return user
}
// TODO : Add error handling and input validation
export async function loginUser(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function onAuthChanged(callback: (user: any) => void) {
  const auth = getAuth()
  return onAuthStateChanged(auth, callback)
}

export async function signInEmail (email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function signUpEmail (email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function logoutUser() {
  await signOut(auth)
}