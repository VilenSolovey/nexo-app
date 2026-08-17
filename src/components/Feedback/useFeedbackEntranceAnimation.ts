import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

type EntranceAnimationOptions = {
  initialTranslateY?: number
  translateDurationMs?: number
  opacityDurationMs?: number
}

export function useFeedbackEntranceAnimation(
  active: boolean,
  {
    initialTranslateY = 42,
    translateDurationMs = 240,
    opacityDurationMs = 180,
  }: EntranceAnimationOptions = {},
) {
  const translateY = useRef(new Animated.Value(initialTranslateY)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!active) return

    translateY.setValue(initialTranslateY)
    opacity.setValue(0)

    const animation = Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: translateDurationMs,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: opacityDurationMs,
        useNativeDriver: true,
      }),
    ])

    animation.start()

    return () => {
      animation.stop()
    }
  }, [
    active,
    initialTranslateY,
    opacity,
    opacityDurationMs,
    translateDurationMs,
    translateY,
  ])

  return {
    opacity,
    transform: [{ translateY }],
  }
}
