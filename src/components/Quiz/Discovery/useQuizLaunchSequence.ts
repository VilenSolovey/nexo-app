import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as Haptics from 'expo-haptics'
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Motion } from '@nexo/constants/motion'

const countdownSteps = ['3', '2', '1', 'Старт'] as const

const wait = (durationMs: number) =>
  new Promise((resolve) => setTimeout(resolve, durationMs))

export function useQuizLaunchSequence() {
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchProgress, setLaunchProgress] = useState(0)
  const [countdownStep, setCountdownStep] = useState<string | null>(null)
  const countdownScale = useSharedValue(0.8)
  const countdownOpacity = useSharedValue(0)
  const activeRunRef = useRef(0)
  const launchingRef = useRef(false)

  const stopAnimations = useCallback(() => {
    cancelAnimation(countdownScale)
    cancelAnimation(countdownOpacity)
    countdownScale.value = 0.8
    countdownOpacity.value = 0
  }, [countdownOpacity, countdownScale])

  const resetLaunch = useCallback(() => {
    activeRunRef.current += 1
    launchingRef.current = false
    stopAnimations()
    setIsLaunching(false)
    setLaunchProgress(0)
    setCountdownStep(null)
  }, [stopAnimations])

  useEffect(() => () => {
    activeRunRef.current += 1
    launchingRef.current = false
    cancelAnimation(countdownScale)
    cancelAnimation(countdownOpacity)
  }, [countdownOpacity, countdownScale])

  useEffect(() => {
    if (!countdownStep) return

    countdownOpacity.value = 0
    countdownScale.value = 0.72
    countdownOpacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(1, { duration: 260 }),
      withTiming(0, { duration: 150 }),
    )
    countdownScale.value = withSequence(
      withSpring(1.08, Motion.spring),
      withTiming(0.96, { duration: 220 }),
    )
  }, [countdownOpacity, countdownScale, countdownStep])

  const countdownAnimatedStyle = useAnimatedStyle(() => ({
    opacity: countdownOpacity.value,
    transform: [{ scale: countdownScale.value }],
  }))

  const launchMessage = useMemo(() => {
    if (launchProgress < 35) return 'Готуємо питання'
    if (launchProgress < 72) return 'Нестор звіряє фрагменти'
    if (launchProgress < 100) return 'Відкриваємо виклик'
    return 'Стартуємо'
  }, [launchProgress])

  const startLaunch = useCallback(async (onComplete: () => void) => {
    if (launchingRef.current) return

    launchingRef.current = true
    const runId = activeRunRef.current + 1
    activeRunRef.current = runId
    setIsLaunching(true)
    setLaunchProgress(8)

    for (let index = 0; index < countdownSteps.length; index += 1) {
      if (activeRunRef.current !== runId) return
      setCountdownStep(countdownSteps[index])
      setLaunchProgress((current) => Math.min(current + 23, 96))
      await wait(index === countdownSteps.length - 1 ? 280 : 520)
    }

    if (activeRunRef.current !== runId) return
    setLaunchProgress(100)
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await wait(180)

    if (activeRunRef.current !== runId) return
    launchingRef.current = false
    onComplete()
  }, [])

  return {
    countdownAnimatedStyle,
    countdownStep,
    isLaunching,
    launchMessage,
    launchProgress,
    resetLaunch,
    startLaunch,
  }
}
