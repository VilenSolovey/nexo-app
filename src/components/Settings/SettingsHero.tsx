import React from "react"
import { Ionicons } from "@expo/vector-icons"
import { Avatar } from "@nexo/components/Home/Avatar"
import type { ThemeOption } from "@nexo/constants/themes"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"
import { DEFAULT_AVATAR_ID } from "@nexo/utils/profile-customization"
import {
  ActiveThemePill,
  ActiveThemeText,
  AvatarBadge,
  AvatarWrap,
  HeroCard,
  HeroEmail,
  HeroName,
  HeroStatPill,
  HeroStatsRow,
  HeroStatValue,
  HeroTextWrap,
  HeroTopRow,
} from "@nexo/components/Settings/Settings.styled"

type SettingsHeroProps = {
  avatarSeed: string
  displayName: string
  email: string
  heroTheme: ThemeOption["preview"]
  level: number
  coins: number
  streakDays: number
  selectedAvatarId: string
}

export function SettingsHero({
  avatarSeed,
  displayName,
  email,
  heroTheme,
  level,
  coins,
  streakDays,
  selectedAvatarId,
}: SettingsHeroProps) {
  const Theme = useAppTheme()

  return (
    <HeroCard colors={heroTheme.colors}>
      <HeroTopRow>
        <AvatarWrap>
          <Avatar seed={avatarSeed} size={84} />
          {selectedAvatarId !== DEFAULT_AVATAR_ID ? (
            <AvatarBadge>
              <Ionicons name="sparkles" size={14} color={Theme.background} />
            </AvatarBadge>
          ) : null}
        </AvatarWrap>

        <HeroTextWrap>
          <HeroName>{displayName}</HeroName>
          <HeroEmail>{email}</HeroEmail>
          <ActiveThemePill style={{ borderColor: heroTheme.accent }}>
            <Ionicons name="color-palette-outline" size={14} color={heroTheme.accent} />
            <ActiveThemeText style={{ color: heroTheme.accent }}>{heroTheme.label}</ActiveThemeText>
          </ActiveThemePill>
        </HeroTextWrap>
      </HeroTopRow>

      <HeroStatsRow>
        <HeroStatPill>
          <Ionicons name="flash-outline" size={16} color={Theme.exp} />
          <HeroStatValue>Lv {level}</HeroStatValue>
        </HeroStatPill>
        <HeroStatPill>
          <Ionicons name="cash-outline" size={16} color={Theme.coin} />
          <HeroStatValue>{coins}</HeroStatValue>
        </HeroStatPill>
        <HeroStatPill>
          <Ionicons name="flame-outline" size={16} color={Theme.warning} />
          <HeroStatValue>{streakDays}</HeroStatValue>
        </HeroStatPill>
      </HeroStatsRow>
    </HeroCard>
  )
}
