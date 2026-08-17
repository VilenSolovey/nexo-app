import React from "react"
import { Image, type ImageStyle, type StyleProp } from "react-native"

const nexonsSource = require("../../../assets/images/nexons-icon.png")

type Props = {
  size?: number
  style?: StyleProp<ImageStyle>
}

export function NexonsIcon({ size = 18, style }: Props) {
  return (
    <Image
      source={nexonsSource}
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
