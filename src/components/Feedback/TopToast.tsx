import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import { useFeedback } from '@nexo/contexts/FeedbackProvider'
import { getFeedbackAccent, getFeedbackIcon } from '@nexo/components/Feedback/feedback-style'
import {
  ToastCard,
  ToastCloseButton,
  ToastContainer,
  ToastText,
} from '@nexo/components/Feedback/Feedback.styled'

export function TopToast() {
  const Theme = useAppTheme()
  const insets = useSafeAreaInsets()
  const { toast, closeToast } = useFeedback()
  const translateY = useRef(new Animated.Value(-80)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!toast) return

    translateY.setValue(-80)
    opacity.setValue(0)

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(toast.durationMs ?? 3200),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]),
    ])

    animation.start(({ finished }) => {
      if (finished) {
        closeToast()
      }
    })

    return () => {
      animation.stop()
    }
  }, [closeToast, opacity, toast, translateY])

  if (!toast) return null

  const accent = getFeedbackAccent(toast.type, Theme)
  const icon = getFeedbackIcon(toast.type)

  return (
    <ToastContainer
      pointerEvents="box-none"
      style={{
        top: insets.top + 8,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <ToastCard $color={accent} $borderColor={`${accent}99`}>
        <Ionicons name={icon} size={20} color="#ffffff" />
        <ToastText>{toast.message}</ToastText>
        <ToastCloseButton onPress={closeToast}>
          <Ionicons name="close" size={18} color="#ffffff" />
        </ToastCloseButton>
      </ToastCard>
    </ToastContainer>
  )
}
