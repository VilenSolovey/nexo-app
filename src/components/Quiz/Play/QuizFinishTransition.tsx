import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  type ReactNode,
} from 'react'
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import {
  FinishContent,
  FinishOverlay,
} from '@nexo/components/Quiz/Play/QuizPlay.styled'

const TRANSITION_DURATION_MS = 180
const TRANSITION_SETTLE_MS = 190

export type QuizFinishTransitionHandle = {
  play: () => Promise<void>
}

type QuizFinishTransitionProps = {
  children: ReactNode
}

function wait(durationMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, durationMs))
}

export const QuizFinishTransition = forwardRef<
  QuizFinishTransitionHandle,
  QuizFinishTransitionProps
>(function QuizFinishTransition({ children }, ref) {
  const screenScale = useSharedValue(1)
  const overlayOpacity = useSharedValue(0)

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: screenScale.value }],
  }))
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const play = useCallback(async () => {
    screenScale.value = withTiming(0.965, {
      duration: TRANSITION_DURATION_MS,
    })
    overlayOpacity.value = withTiming(1, {
      duration: TRANSITION_DURATION_MS,
    })

    await wait(TRANSITION_SETTLE_MS)
  }, [overlayOpacity, screenScale])

  useImperativeHandle(ref, () => ({ play }), [play])

  return (
    <>
      <FinishOverlay pointerEvents="none" style={overlayStyle} />
      <FinishContent style={contentStyle}>{children}</FinishContent>
    </>
  )
})
