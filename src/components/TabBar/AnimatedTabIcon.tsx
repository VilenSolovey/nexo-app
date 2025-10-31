import React, { useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"

type AnimatedTabIconProps = {
  name: keyof typeof Ionicons.glyphMap
  size: number
  color: string
  focused: boolean
}

export const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
  name,
  size,
  color,
  focused,
}) => {
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, {
      damping: 8,
      stiffness: 300,
    })
  }, [focused])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  )
}