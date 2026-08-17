import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocFromCache, onSnapshot, updateDoc } from 'firebase/firestore';
import { LevelUpModal } from '@nexo/components/LevelUpModal/LevelUpModal';
import { auth, db } from '@nexo/services/firebase';
import { useDailyActivitySync } from '@nexo/hooks/useDailyActivitySync';
import { UserProfile } from '@nexo/types/user.types';
import { normalizeUserProfile } from '@nexo/utils/user-profile';

type RefreshUserProfileOptions = {
  showLevelUp?: boolean;
}

interface AuthContextType {
  user: User | null;
  userId: string | undefined;
  userProfile: UserProfile | null;
  status: AuthStatus;
  loading: boolean;
  profileError: string | null;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: (options?: RefreshUserProfileOptions) => Promise<void>;
  retryProfile: () => Promise<void>;
}

export type AuthStatus =
  | 'restoring'
  | 'loading-profile'
  | 'authenticated'
  | 'unauthenticated'
  | 'profile-error'

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function debugAuth(message: string, payload?: Record<string, unknown>) {
  if (__DEV__) {
    console.log(`[AuthProvider] ${message}`, payload ?? '')
  }
}

const PROFILE_RETRY_DELAYS = [0, 250, 800]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function profileErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message?: unknown }).message ?? '').trim()
    if (message) return message
  }
  return 'Не вдалося завантажити профіль. Перевірте інтернет і спробуйте ще раз.'
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [levelUpState, setLevelUpState] = useState<{ previousLevel: number; nextLevel: number } | null>(null);
  const userRef = useRef<User | null>(null);
  const userProfileRef = useRef<UserProfile | null>(null);
  const profileListenerRef = useRef<(() => void) | null>(null);
  const profileRequestRef = useRef(0);
  const pendingSignUpRef = useRef<{ email: string; displayName: string } | null>(null);
  const dailySyncKeyRef = useRef<string | null>(null);
  const dailySyncInFlightRef = useRef(false);
  const userId = user?.uid ?? userProfile?.uid ?? userProfile?.id;
  const loading = status === 'restoring' || status === 'loading-profile';

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    userProfileRef.current = userProfile
  }, [userProfile])

  const createUserProfile = useCallback(async (uid: string, email: string, displayName: string) => {
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: uid,
      email,
      displayName,
      coins: 0,
      consumables: {},
      exp: 0,
      level: 1,
      streak: 0,
      streakDays: 0,
      longestStreak: 0,
      completedQuizzes: [],
      achievements: [],
      inventory: [],
      selectedThemeId: null,
      selectedAvatarId: null,
      createdAt: now,
    };

    await setDoc(doc(db, 'users', uid), profile, { merge: true });
    return profile;
  }, []);

  const fetchUserProfile = useCallback(async (firebaseUser: User): Promise<UserProfile | null> => {
    const uid = firebaseUser.uid
    const docRef = doc(db, 'users', uid);
    let lastError: unknown

    for (const retryDelay of PROFILE_RETRY_DELAYS) {
      if (retryDelay > 0) await delay(retryDelay)

      try {
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) return null

        const raw = docSnap.data() as Record<string, unknown>
        const profile = normalizeUserProfile(uid, raw, firebaseUser)
        const profileUpdates: Partial<UserProfile> = {}

        if (raw.displayName !== profile.displayName) profileUpdates.displayName = profile.displayName
        if (raw.email !== profile.email && profile.email) profileUpdates.email = profile.email
        if (Number(raw.level ?? 1) !== profile.level) profileUpdates.level = profile.level

        if (Object.keys(profileUpdates).length > 0) {
          await updateDoc(docRef, profileUpdates)
        }

        return profile
      } catch (error) {
        lastError = error
      }
    }

    try {
      const cachedSnap = await getDocFromCache(docRef)
      if (cachedSnap.exists()) {
        debugAuth('using cached profile after Firestore error', { uid })
        return normalizeUserProfile(uid, cachedSnap.data() as Record<string, unknown>, firebaseUser)
      }
    } catch {
      // The original Firestore error below is more useful than a cache miss.
    }

    throw lastError ?? new Error('User profile could not be loaded')
  }, []);

  const commitProfile = useCallback((profile: UserProfile) => {
    userProfileRef.current = profile
    setUserProfile(profile)
    setProfileError(null)
    setStatus('authenticated')
  }, [])

  const startProfileListener = useCallback((firebaseUser: User) => {
    profileListenerRef.current?.()
    profileListenerRef.current = onSnapshot(
      doc(db, 'users', firebaseUser.uid),
      (snapshot) => {
        if (auth.currentUser?.uid !== firebaseUser.uid || !snapshot.exists()) return
        commitProfile(normalizeUserProfile(
          firebaseUser.uid,
          snapshot.data() as Record<string, unknown>,
          firebaseUser,
        ))
      },
      (error) => {
        console.error('User profile listener failed:', error)
        // Keep the last valid profile visible. A listener failure is not logout.
        setProfileError(profileErrorMessage(error))
      },
    )
  }, [commitProfile])

  const resolveUserProfile = useCallback(async (firebaseUser: User) => {
    const requestId = profileRequestRef.current + 1
    profileRequestRef.current = requestId
    setStatus('loading-profile')
    setProfileError(null)

    try {
      let profile = await fetchUserProfile(firebaseUser)
      if (requestId !== profileRequestRef.current || auth.currentUser?.uid !== firebaseUser.uid) return

      if (!profile) {
        const pending = pendingSignUpRef.current
        profile = await createUserProfile(
          firebaseUser.uid,
          pending?.email || firebaseUser.email || '',
          pending?.displayName || firebaseUser.displayName || 'Гравець',
        )
      }

      if (requestId !== profileRequestRef.current || auth.currentUser?.uid !== firebaseUser.uid) return

      debugAuth('auth profile loaded', {
        uid: firebaseUser.uid,
        level: profile.level,
        exp: profile.exp,
      })
      commitProfile(profile)
      startProfileListener(firebaseUser)
    } catch (error) {
      if (requestId !== profileRequestRef.current) return
      console.error('Failed to resolve auth profile:', error)

      // A temporary read error must not erase a profile that was already valid.
      if (userProfileRef.current?.id === firebaseUser.uid) {
        setProfileError(profileErrorMessage(error))
        setStatus('authenticated')
        return
      }

      setProfileError(profileErrorMessage(error))
      setStatus('profile-error')
    }
  }, [commitProfile, createUserProfile, fetchUserProfile, startProfileListener])

  const refreshUserProfile = useCallback(async (options: RefreshUserProfileOptions = {}) => {
    const currentUser = userRef.current ?? user

    if (currentUser) {
      const previousProfile = userProfileRef.current
      const profile = await fetchUserProfile(currentUser);
      if (!profile) throw new Error('User profile not found')

      debugAuth('refreshUserProfile', {
        showLevelUp: Boolean(options.showLevelUp),
        previousLevel: previousProfile?.level ?? null,
        nextLevel: profile?.level ?? null,
      })

      if (options.showLevelUp && previousProfile && profile) {
        const previousLevel = Number(previousProfile.level ?? 1)
        const nextLevel = Number(profile.level ?? 1)

        if (nextLevel > previousLevel) {
          debugAuth('show level-up modal', {
            previousLevel,
            nextLevel,
          })

          setLevelUpState({
            previousLevel,
            nextLevel,
          })
        }
      }

      commitProfile(profile)
    }
  }, [commitProfile, fetchUserProfile, user]);

  const retryProfile = useCallback(async () => {
    const currentUser = auth.currentUser ?? userRef.current
    if (!currentUser) {
      setStatus('unauthenticated')
      return
    }
    await resolveUserProfile(currentUser)
  }, [resolveUserProfile])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      profileRequestRef.current += 1
      profileListenerRef.current?.()
      profileListenerRef.current = null
      userRef.current = nextUser
      setUser(nextUser)

      if (nextUser) {
        if (userProfileRef.current?.id !== nextUser.uid) {
          userProfileRef.current = null
          setUserProfile(null)
        }
        void resolveUserProfile(nextUser)
      } else {
        dailySyncKeyRef.current = null
        setStatus('unauthenticated')
        setProfileError(null)
        userProfileRef.current = null;
        setUserProfile(null);
        setLevelUpState(null);
      }
    });

    return () => {
      profileRequestRef.current += 1
      profileListenerRef.current?.()
      unsubscribe()
    };
  }, [resolveUserProfile]);

  useDailyActivitySync({
    status,
    userProfile,
    userRef,
    userProfileRef,
    dailySyncKeyRef,
    dailySyncInFlightRef,
    setUserProfile,
  })

  const signInEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    pendingSignUpRef.current = { email, displayName }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user.uid, email, displayName);
    } finally {
      pendingSignUpRef.current = null
    }
  }, [createUserProfile]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    userId,
    userProfile,
    status,
    loading,
    profileError,
    signInEmail,
    signUp,
    signOut,
    refreshUserProfile,
    retryProfile,
  }), [
    loading,
    profileError,
    refreshUserProfile,
    retryProfile,
    signInEmail,
    signOut,
    signUp,
    status,
    user,
    userId,
    userProfile,
  ])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <LevelUpModal levelUp={levelUpState} onClose={() => setLevelUpState(null)} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
