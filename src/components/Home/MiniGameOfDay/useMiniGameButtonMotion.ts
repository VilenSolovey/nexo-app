import { useCallback } from "react"
import { useFocusEffect } from "@react-navigation/native"
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { Motion } from "@nexo/constants/motion"

export function useMiniGameButtonMotion() {
  const idleY = useSharedValue(0)
  const pressScale = useSharedValue(1)
  const accentPulse = useSharedValue(0)

  useFocusEffect(
    useCallback(() => {
      idleY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 1400, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1400, easing: Easing.out(Easing.quad) }),
        ),
        -1,
        true,
      )
      accentPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1200, easing: Easing.out(Easing.quad) }),
        ),
        -1,
        true,
      )

      return () => {
        cancelAnimation(idleY)
        cancelAnimation(accentPulse)
        cancelAnimation(pressScale)
        idleY.value = 0
        accentPulse.value = 0
        pressScale.value = 1
      }
    }, [accentPulse, idleY, pressScale]),
  )

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: idleY.value },
      { scale: pressScale.value },
    ],
  }))

  const accentStyle = useAnimatedStyle(() => ({
    opacity: 0.82 + accentPulse.value * 0.18,
    transform: [{ scale: 1 + accentPulse.value * 0.12 }],
  }))

  const handlePressIn = useCallback(() => {
    pressScale.value = withSpring(0.97, Motion.spring)
  }, [pressScale])

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, Motion.spring)
  }, [pressScale])

  return {
    accentStyle,
    floatingStyle,
    handlePressIn,
    handlePressOut,
  }
}
