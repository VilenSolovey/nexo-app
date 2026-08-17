import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import { markNestorIntroSeen } from '@nexo/services/user.service'

const TYPE_CHUNK_SIZE = 2
const TYPE_INTERVAL_MS = 16
const NESTOR_INTRO_VERSION = 2
const INTRO_DECISION_GRACE_MS = 280
const INTRO_STORAGE_PREFIX = '@nexo/nestor-intro'

function getIntroStorageKey(userId: string) {
  return `${INTRO_STORAGE_PREFIX}:${userId}:v${NESTOR_INTRO_VERSION}`
}

type NestorMood = 'neutral' | 'focused' | 'happy'

type StoryBeat = {
  eyebrow: string
  title: string
  message: string
  buttonLabel: string
  icon: keyof typeof Ionicons.glyphMap
  mood?: NestorMood
  isSignal?: boolean
}

const STORY_BEATS: StoryBeat[] = [
  {
    eyebrow: 'ВХІДНИЙ СИГНАЛ · ДЖЕРЕЛО НЕВІДОМЕ',
    title: 'Сигнал знайдено',
    message:
      'З’єднання з Хронікою нестабільне. Більшість зв’язків між історичними записами втрачено. Але хтось усе ще намагається вийти на зв’язок.',
    buttonLabel: 'Відкрити сигнал',
    icon: 'radio-outline',
    isSignal: true,
  },
  {
    eyebrow: 'НЕСТОР · ХРАНИТЕЛЬ ХРОНІКИ',
    title: 'Ти все ж почув мене.',
    message:
      'Я Нестор. Після Розриву я залишився тут один — серед тисяч фрагментів, які більше не пам’ятають, до якої історії належать.',
    buttonLabel: 'Що сталося?',
    icon: 'chatbubble-ellipses-outline',
    mood: 'neutral',
  },
  {
    eyebrow: 'ПОДІЯ · РОЗРИВ ХРОНІКИ',
    title: 'Минуле не змінилося.',
    message:
      'Пошкодився наш запис про нього. Причини відокремилися від наслідків, імена — від учинків, а документи — від подій. Так з’явився туман.',
    buttonLabel: 'Але чому я?',
    icon: 'git-compare-outline',
    mood: 'focused',
  },
  {
    eyebrow: 'ЗАПИТ НА ДОПОМОГУ',
    title: 'Сам я не впораюся.',
    message:
      'Я частина Хроніки, тому моя пам’ять пошкоджена разом із нею. Я можу знаходити уламки, але лише розум ззовні здатен відрізнити правду від спотворення.',
    buttonLabel: 'І що я маю зробити?',
    icon: 'finger-print-outline',
    mood: 'focused',
  },
  {
    eyebrow: 'НОВА РОЛЬ · ВІДНОВЛЮВАЧ ХРОНІКИ',
    title: 'Тепер ми можемо почати.',
    message:
      'Дякую, що відповів на сигнал. Досліджуй уцілілі записи, а Spark перевірить зв’язки між фактами. Trial збере відновлені фрагменти в цілісну історію.',
    buttonLabel: 'Знайти перший слід',
    icon: 'sparkles-outline',
    mood: 'neutral',
  },
  {
    eyebrow: 'ПЕРША ЕКСПЕДИЦІЯ · 1657–1687',
    title: 'Перший слід уже знайдено.',
    message:
      'Він веде до 1657 року — початку Руїни. Десять записів приховано в тумані. Якщо ми їх відновимо, можливо, дізнаємося, що насправді спричинило Розрив.',
    buttonLabel: 'Відповісти на сигнал',
    icon: 'compass-outline',
    mood: 'happy',
  },
]

const avatarByMood = {
  neutral: require('../../../assets/images/nestor-neutral.png'),
  focused: require('../../../assets/images/nestor-focused.png'),
  happy: require('../../../assets/images/nestor-happy.png'),
} as const

/** One-time story prologue persisted in the user profile. */
export function NestorOnboarding() {
  const { userId, userProfile } = useAuth()
  const theme = useAppTheme()
  const insets = useSafeAreaInsets()
  const [visible, setVisible] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [visibleCharacters, setVisibleCharacters] = useState(0)
  const resolvedUserRef = useRef<string | null>(null)
  const finishingRef = useRef(false)
  const transition = useRef(new Animated.Value(1)).current
  const signalPulse = useRef(new Animated.Value(0.35)).current

  const beat = STORY_BEATS[stepIndex]
  const isLastStep = stepIndex === STORY_BEATS.length - 1
  const isTyping = visible && visibleCharacters < beat.message.length
  const typedMessage = beat.message.slice(0, visibleCharacters)
  const avatarSource = useMemo(
    () => (beat.mood ? avatarByMood[beat.mood] : null),
    [beat.mood],
  )

  useEffect(() => {
    if (!userId || !userProfile) {
      setVisible(false)
      return
    }

    const storageKey = getIntroStorageKey(userId)

    if ((userProfile.nestorIntroVersion ?? 0) >= NESTOR_INTRO_VERSION) {
      resolvedUserRef.current = userId
      setVisible(false)
      void AsyncStorage.setItem(storageKey, 'seen').catch((error) => {
        console.warn('Failed to cache Nestor onboarding state:', error)
      })
      return
    }

    if (resolvedUserRef.current === userId) return

    let cancelled = false
    const timer = setTimeout(() => {
      void AsyncStorage.getItem(storageKey)
        .then((localState) => {
          if (cancelled) return

          if (localState === 'seen') {
            resolvedUserRef.current = userId
            setVisible(false)
            return
          }

          setStepIndex(0)
          setVisible(true)
        })
        .catch((error) => {
          if (cancelled) return
          console.warn('Failed to read Nestor onboarding cache:', error)
          setStepIndex(0)
          setVisible(true)
        })
    }, INTRO_DECISION_GRACE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [userId, userProfile])

  useEffect(() => {
    if (!visible) return
    setVisibleCharacters(Math.min(TYPE_CHUNK_SIZE, beat.message.length))
  }, [beat.message, visible])

  useEffect(() => {
    if (!visible || visibleCharacters >= beat.message.length) return

    const timer = setTimeout(() => {
      setVisibleCharacters((current) =>
        Math.min(current + TYPE_CHUNK_SIZE, beat.message.length),
      )
    }, TYPE_INTERVAL_MS)

    return () => clearTimeout(timer)
  }, [beat.message.length, visible, visibleCharacters])

  useEffect(() => {
    if (!visible) return

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(signalPulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(signalPulse, {
          toValue: 0.35,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [signalPulse, visible])

  const finishIntro = async () => {
    if (!userId || finishingRef.current) return

    finishingRef.current = true
    resolvedUserRef.current = userId
    setVisible(false)

    try {
      await Promise.all([
        AsyncStorage.setItem(getIntroStorageKey(userId), 'seen').catch((error) => {
          console.warn('Failed to cache Nestor onboarding state:', error)
        }),
        markNestorIntroSeen(userId, NESTOR_INTRO_VERSION),
      ])
    } catch (error) {
      // The prologue must never block entry if the profile write fails.
      console.warn('Failed to save Nestor onboarding state:', error)
    } finally {
      finishingRef.current = false
    }
  }

  const revealMessage = () => setVisibleCharacters(beat.message.length)

  const moveToStep = (nextStep: number) => {
    Animated.timing(transition, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setStepIndex(nextStep)
      transition.setValue(0)
      Animated.spring(transition, {
        toValue: 1,
        damping: 18,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }).start()
    })
  }

  const handlePrimary = () => {
    if (isTyping) {
      revealMessage()
      return
    }

    if (isLastStep) {
      void finishIntro()
      return
    }

    moveToStep(stepIndex + 1)
  }

  const handleBack = () => {
    if (stepIndex > 0) moveToStep(stepIndex - 1)
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={() => {}}
      statusBarTranslucent
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['#07120F', theme.background, '#0B1914']}
        locations={[0, 0.58, 1]}
        style={styles.screen}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[
              styles.fogOrb,
              styles.fogOrbTop,
              { backgroundColor: `${theme.primary}12`, opacity: signalPulse },
            ]}
          />
          <View
            style={[
              styles.fogOrb,
              styles.fogOrbBottom,
              { backgroundColor: `${theme.accentAlt}0c` },
            ]}
          />
          <View style={[styles.scanLine, { backgroundColor: `${theme.primary}0d` }]} />
        </View>

        <View
          style={[
            styles.safeContent,
            { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 18) },
          ]}
        >
          <View style={styles.topBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Повернутися до попередньої сторінки"
              disabled={stepIndex === 0}
              onPress={handleBack}
              style={({ pressed }) => [
                styles.topIconButton,
                {
                  borderColor: `${theme.primary}28`,
                  opacity: stepIndex === 0 ? 0 : pressed ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={theme.text} />
            </Pressable>

            <View style={styles.progressDots}>
              {STORY_BEATS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor:
                        index <= stepIndex ? theme.primary : `${theme.textSecondary}38`,
                      width: index === stepIndex ? 24 : 6,
                    },
                  ]}
                />
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => { void finishIntro() }}
              style={({ pressed }) => [styles.skipButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.skipText, { color: theme.textSecondary }]}>Пропустити</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View
              style={[
                styles.story,
                {
                  opacity: transition,
                  transform: [
                    {
                      translateY: transition.interpolate({
                        inputRange: [0, 1],
                        outputRange: [18, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.visualStage}>
                {avatarSource ? (
                  <>
                    <View
                      style={[
                        styles.avatarHaloOuter,
                        { borderColor: `${theme.primary}1f` },
                      ]}
                    />
                    <View
                      style={[
                        styles.avatarHalo,
                        {
                          backgroundColor: `${theme.primary}12`,
                          borderColor: `${theme.primary}4a`,
                        },
                      ]}
                    >
                      <Image source={avatarSource} style={styles.avatar} resizeMode="contain" />
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: theme.primary }]}>
                      <Ionicons name={beat.icon} size={16} color="#07120F" />
                    </View>
                  </>
                ) : (
                  <View style={styles.signalStage}>
                    <Animated.View
                      style={[
                        styles.signalRing,
                        {
                          borderColor: `${theme.primary}55`,
                          opacity: signalPulse,
                          transform: [
                            {
                              scale: signalPulse.interpolate({
                                inputRange: [0.35, 1],
                                outputRange: [0.88, 1.08],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.signalCore,
                        {
                          backgroundColor: `${theme.primary}16`,
                          borderColor: `${theme.primary}6b`,
                        },
                      ]}
                    >
                      <Ionicons name="radio-outline" size={54} color={theme.primary} />
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.copy}>
                <View style={styles.eyebrowRow}>
                  <View style={[styles.eyebrowLine, { backgroundColor: theme.primary }]} />
                  <Text style={[styles.eyebrow, { color: theme.primary }]}>{beat.eyebrow}</Text>
                </View>

                <Text style={[styles.title, { color: theme.text }]}>{beat.title}</Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isTyping ? 'Показати текст повністю' : undefined}
                  onPress={revealMessage}
                  style={[
                    styles.messageCard,
                    {
                      backgroundColor: `${theme.card}d9`,
                      borderColor: `${theme.primary}2e`,
                    },
                  ]}
                >
                  <View style={styles.messageBody}>
                    <Text style={[styles.message, styles.messageSizer]}>{beat.message}</Text>
                    <Text style={[styles.message, styles.typedMessage, { color: theme.textSecondary }]}>
                      {typedMessage}
                      {isTyping ? <Text style={{ color: theme.primary }}>▍</Text> : null}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            onPress={handlePrimary}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.82 : 1,
                shadowColor: theme.primary,
              },
            ]}
          >
            <Text style={styles.primaryText}>{isTyping ? 'Показати повністю' : beat.buttonLabel}</Text>
            <Ionicons
              name={isLastStep && !isTyping ? 'radio-outline' : 'arrow-forward'}
              size={19}
              color="#07120F"
            />
          </Pressable>
        </View>
      </LinearGradient>
    </Modal>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeContent: { flex: 1, paddingHorizontal: 20 },
  fogOrb: { position: 'absolute', borderRadius: 999 },
  fogOrbTop: { width: 360, height: 360, top: -150, right: -150 },
  fogOrbBottom: { width: 440, height: 440, bottom: -230, left: -220 },
  scanLine: { position: 'absolute', top: '38%', right: 0, left: 0, height: 1 },
  topBar: { minHeight: 44, flexDirection: 'row', alignItems: 'center' },
  topIconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDots: {
    position: 'absolute',
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  progressDot: { height: 6, borderRadius: 99 },
  skipButton: { marginLeft: 'auto', paddingVertical: 10, paddingLeft: 12 },
  skipText: { fontSize: 13, fontWeight: '800' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 12 },
  story: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  visualStage: {
    height: 245,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarHaloOuter: {
    position: 'absolute',
    width: 226,
    height: 226,
    borderRadius: 113,
    borderWidth: 1,
  },
  avatarHalo: {
    width: 184,
    height: 184,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: { width: 202, height: 202 },
  statusBadge: {
    position: 'absolute',
    bottom: 20,
    right: '30%',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#0B1914',
  },
  signalStage: { width: 224, height: 224, alignItems: 'center', justifyContent: 'center' },
  signalRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
  },
  signalCore: {
    width: 138,
    height: 138,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { width: '100%' },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  eyebrowLine: { width: 18, height: 2, borderRadius: 1 },
  eyebrow: { flex: 1, fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 1.25 },
  title: { fontSize: 34, lineHeight: 39, fontWeight: '900', marginTop: 12, letterSpacing: -0.8 },
  messageCard: { marginTop: 18, borderRadius: 22, borderWidth: 1, padding: 17 },
  messageBody: { position: 'relative' },
  message: { fontSize: 16, lineHeight: 24 },
  messageSizer: { opacity: 0 },
  typedMessage: { position: 'absolute', top: 0, right: 0, left: 0 },
  primaryButton: {
    width: '100%',
    maxWidth: 520,
    minHeight: 58,
    borderRadius: 18,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  primaryText: { color: '#07120F', fontSize: 15, fontWeight: '900' },
})
