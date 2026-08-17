import React from "react"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { NexonsIcon } from "@nexo/components/Currency/NexonsIcon"
import { Avatar } from "@nexo/components/Home/Avatar"
import { AnimatedNumber } from "@nexo/components/Motion/AnimatedNumber"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"

import {
  HeaderRow,
  UserLeft,
  NameWrap,
  GreetingText,
  NameText,
  StorePill,
  CoinsGroup,
  CoinsText,
  StoreDivider,
  StoreText,
} from "@nexo/components/Home/UserHeader/UserHeader.styled"

type Props = {
  name?: string
  coins?: number
  avatarSeed?: string
  onPressShop: () => void
}
export const UserHeader: React.FC<Props> = ({ name = "Гравець", coins = 0, avatarSeed, onPressShop }) => {
  const appTheme = useAppTheme()

  const handlePressShop = () => {
    void Haptics.selectionAsync()
    onPressShop()
  }

  return (
    <HeaderRow>
      <UserLeft>
        <Avatar seed={avatarSeed ?? name ?? "guest"} size={55} />
        <NameWrap>
          <GreetingText>Привіт</GreetingText>
          <NameText numberOfLines={1} ellipsizeMode="tail">{name}</NameText>
        </NameWrap>
      </UserLeft>

      <StorePill
        accessibilityRole="button"
        accessibilityLabel="Відкрити магазин"
        onPress={handlePressShop}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
      >
        <CoinsGroup>
          <NexonsIcon size={21} />
          <AnimatedNumber value={coins}>
            {(value) => <CoinsText numberOfLines={1}>{value}</CoinsText>}
          </AnimatedNumber>
        </CoinsGroup>
        <StoreDivider />
        <Ionicons name="bag-outline" size={16} color={appTheme.primary} />
        <StoreText>Магазин</StoreText>
        <Ionicons name="chevron-forward" size={14} color={appTheme.primary} />
      </StorePill>
    </HeaderRow>
  )
}
