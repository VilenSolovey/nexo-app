import React from "react"
import { Pressable } from "react-native"
import * as Haptics from "expo-haptics"
import { useRouter } from "expo-router"
import { Container, Left, Title, Subtitle, Cta, CtaText } from "@nexo/components/Home/Banner/Banner.styled"

type Props = {
  title?: string
  subtitle?: string
  ctaLabel?: string
  onPress?: () => void
}

export const Banner: React.FC<Props> = ({
  title = "Відвідай магазин!",
  subtitle = "Отримуй нові можливості та бонуси",
  ctaLabel = "Шопінг",
  onPress,
}) => {
  const router = useRouter()
  const handlePress = () => {
    Haptics.selectionAsync()
    if (onPress) return onPress()
    router.push("/shop")
  }
  return (
    <Container>
      <Left>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </Left>
      <Pressable onPress={handlePress} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
        <Cta>
          <CtaText>{ctaLabel}</CtaText>
        </Cta>
      </Pressable>
    </Container>
  )
}
