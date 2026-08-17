import React, { useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated"
import { Motion } from "@nexo/constants/motion"

type AnimatedTabIconProps = {
  name: keyof typeof Ionicons.glyphMap
  activeName?: keyof typeof Ionicons.glyphMap
  size: number
  color: string
  focused: boolean
}

export const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
  name,
  activeName,
  size,
  color,
  focused,
}) => {
  const scale = useSharedValue(1)
  const activeProgress = useSharedValue(focused ? 1 : 0)

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, {
      damping: 8,
      stiffness: 300,
    })
    activeProgress.value = withTiming(focused ? 1 : 0, {
      duration: Motion.duration.normal,
    })
  }, [activeProgress, focused, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    width: 38,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      ["rgba(255, 255, 255, 0)", "rgba(94, 234, 212, 0.14)"],
    ),
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={focused ? activeName ?? name : name} size={size} color={color} />
    </Animated.View>
  )
}
