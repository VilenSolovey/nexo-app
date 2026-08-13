import React from "react"
import { Image, type ImageStyle, type StyleProp } from "react-native"
import type { QuizType } from "@nexo/types/quiz.types"

const icons: Record<QuizType, number> = {
  spark: require("../../../assets/images/spark-icon.png"),
  trial: require("../../../assets/images/trial-icon.png"),
}

type Props = {
  type: QuizType
  size?: number
  style?: StyleProp<ImageStyle>
}

export function QuizTypeIcon({ type, size = 22, style }: Props) {
  return (
    <Image
      source={icons[type]}
      resizeMode="contain"
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  )
}
