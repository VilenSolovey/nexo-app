import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Theme } from '@nexo/constants/theme';
import { auth, db } from '@nexo/services/firebase';
import { UserProfile } from '@nexo/types/user.types';
import { getLevelFromExp } from '@nexo/utils/level';

interface AuthContextType {
  user: User | null;
  userId: string | undefined;
  userProfile: UserProfile | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelUpState, setLevelUpState] = useState<{ previousLevel: number; nextLevel: number } | null>(null);
  const hasHydratedProfileRef = useRef(false);
  const lastLevelRef = useRef<number | null>(null);
  const userId = user?.uid ?? userProfile?.uid ?? userProfile?.id;

  const createUserProfile = async (uid: string, email: string, displayName: string) => {
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
      completedQuizzes: [],
      achievements: [],
      inventory: [],
      selectedThemeId: null,
      selectedAvatarId: null,
      createdAt: now,
    };

    await setDoc(doc(db, 'users', uid), profile);
    return profile;
  };

  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile
      const exp = Number(data.exp ?? 0)
      const normalizedLevel = getLevelFromExp(exp)
      const storedLevel = Number(data.level ?? 1)
      const storedEmail = typeof data.email === 'string' ? data.email.trim() : ''
      const fallbackEmail = auth.currentUser?.email?.trim() ?? ''
      const resolvedEmail = storedEmail || fallbackEmail
      const profileUpdates: Partial<UserProfile> = {}

      if (normalizedLevel !== storedLevel) {
        profileUpdates.level = normalizedLevel
      }

      if (!storedEmail && fallbackEmail) {
        profileUpdates.email = fallbackEmail
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateDoc(docRef, profileUpdates)
      }

      return {
        ...data,
        id: uid,
        uid,
        email: resolvedEmail,
        consumables:
          typeof data.consumables === 'object' && data.consumables !== null
            ? Object.fromEntries(
                Object.entries(data.consumables).map(([key, value]) => [key, Number(value ?? 0)]),
              )
            : {},
        exp,
        level: normalizedLevel,
      };
    }
    return null;
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    if (!userProfile) {
      hasHydratedProfileRef.current = false
      lastLevelRef.current = null
      return
    }

    const currentLevel = Number(userProfile.level ?? 1)

    if (!hasHydratedProfileRef.current) {
      hasHydratedProfileRef.current = true
      lastLevelRef.current = currentLevel
      return
    }

    const previousLevel = lastLevelRef.current ?? currentLevel

    if (currentLevel > previousLevel) {
      setLevelUpState({
        previousLevel,
        nextLevel: currentLevel,
      })
    }

    lastLevelRef.current = currentLevel
  }, [userProfile])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        let profile = await fetchUserProfile(user.uid);
        if (!profile) {
          profile = await createUserProfile(user.uid, user.email || '', user.displayName || 'User');
        }
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user.uid, email, displayName);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        userProfile,
        loading,
        signInEmail,
        signUp,
        signOut,
        refreshUserProfile,
      }}
    >
      {children}

      <Modal
        visible={Boolean(levelUpState)}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelUpState(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.iconWrap}>
              <Ionicons name="sparkles" size={28} color={Theme.exp} />
            </View>
            <Text style={styles.title}>Новий рівень!</Text>
            <Text style={styles.levelText}>Lv {levelUpState?.nextLevel ?? 1}</Text>
            <Text style={styles.subtitle}>
              Ви піднялися з Lv {levelUpState?.previousLevel ?? 1} на Lv {levelUpState?.nextLevel ?? 1}
            </Text>
            <Pressable style={styles.button} onPress={() => setLevelUpState(null)}>
              <Text style={styles.buttonText}>Круто</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 14, 12, 0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    backgroundColor: Theme.card,
    borderWidth: 1,
    borderColor: '#5B4A8A',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.26)',
  },
  title: {
    marginTop: 16,
    color: Theme.text,
    fontSize: 24,
    fontWeight: '800',
  },
  levelText: {
    marginTop: 10,
    color: Theme.exp,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 10,
    color: Theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: Theme.exp,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
})
