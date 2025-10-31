import React from "react"
import { View } from "react-native"
import { SvgXml } from "react-native-svg"
import multiavatar from "@multiavatar/multiavatar"

type Props = {
  seed?: string
  size?: number
}

export const Avatar: React.FC<Props> = ({ seed = "guest", size = 55 }) => {
  const safeSeed = seed?.trim?.() || "guest"

  let svgCode = ""
  try {
    svgCode = multiavatar(safeSeed)
  } catch (err) {
    console.error("Failed to generate avatar:", err)
  }

  if (!svgCode) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#2f4f39",
        }}
      />
    )
  }

  return (
    <SvgXml
      xml={svgCode}
      width={size}
      height={size}
      style={{
        borderRadius: size / 2,
        overflow: "hidden",
      }}
    />
  )
}