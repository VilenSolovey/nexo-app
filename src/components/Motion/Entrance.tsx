import React from "react"
import { StyleProp, ViewStyle } from "react-native"
import Animated, { FadeInDown, FadeInUp, ZoomInEasyDown } from "react-native-reanimated"
import { Motion } from "@nexo/constants/motion"

type Props = {
  children: React.ReactNode
  index?: number
  delay?: number
  variant?: "default" | "hero" | "pop"
  style?: StyleProp<ViewStyle>
}

export function Entrance({
  children,
  index = 0,
  delay = 0,
  variant = "default",
  style,
}: Props) {
  const animationDelay = delay + index * Motion.stagger
  const entering = variant === "hero"
    ? FadeInUp
      .delay(animationDelay)
      .duration(Motion.duration.slow)
      .springify()
      .damping(16)
      .stiffness(150)
      .mass(0.82)
    : variant === "pop"
      ? ZoomInEasyDown
        .delay(animationDelay)
        .duration(Motion.duration.normal)
        .springify()
        .damping(Motion.spring.damping)
        .stiffness(Motion.spring.stiffness)
      : FadeInDown
        .delay(animationDelay)
        .duration(Motion.duration.slow)
        .springify()
        .damping(Motion.spring.damping)
        .stiffness(Motion.spring.stiffness)
        .mass(Motion.spring.mass)

  return (
    <Animated.View
      entering={entering}
      style={[{ width: "100%", alignItems: "center" }, style]}
    >
      {children}
    </Animated.View>
  )
}
