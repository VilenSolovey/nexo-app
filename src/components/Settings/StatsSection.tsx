import React from "react"
import { ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"
import { SettingsSection } from "./SettingsSection"
import {
  StatCard,
  StatHelper,
  StatLabel,
  StatsGrid,
  StatsLoading,
  StatsLoadingText,
  StatValue,
} from "@nexo/components/Settings/Settings.styled"

type StatsSectionProps = {
  quizzesCount: string
  longestStreak: number
  achievementsCount: string
  achievementsTotal: number
  unlockedCosmeticsCount: number
  isRefreshing: boolean
  isAchievementsLoading: boolean
}

export function StatsSection({
  quizzesCount,
  longestStreak,
  achievementsCount,
  achievementsTotal,
  unlockedCosmeticsCount,
  isRefreshing,
  isAchievementsLoading,
}: StatsSectionProps) {
  const Theme = useAppTheme()

  return (
    <SettingsSection
      icon="stats-chart-outline"
      title="Статистика"
      subtitle="Короткий зріз того, як просувається твій прогрес у додатку."
    >
      <StatsGrid>
        <StatsItem label="Квізів зіграно" value={quizzesCount} icon="game-controller-outline" />
        <StatsItem label="Рекорд streak" value={String(longestStreak)} icon="flame-outline" />
        <StatsItem
          label="Етапів ачівок"
          value={achievementsCount}
          icon="medal-outline"
          helper={isAchievementsLoading ? undefined : `із ${achievementsTotal}`}
        />
        <StatsItem label="Косметики" value={String(unlockedCosmeticsCount)} icon="shirt-outline" />
      </StatsGrid>

      {isRefreshing ? (
        <StatsLoading>
          <ActivityIndicator size="small" color={Theme.primary} />
          <StatsLoadingText>Оновлюємо статистику…</StatsLoadingText>
        </StatsLoading>
      ) : null}
    </SettingsSection>
  )
}

type StatsItemProps = {
  label: string
  value: string
  icon: keyof typeof Ionicons.glyphMap
  helper?: string
}

function StatsItem({ label, value, icon, helper }: StatsItemProps) {
  const Theme = useAppTheme()

  return (
    <StatCard>
      <Ionicons name={icon} size={18} color={Theme.primary} />
      <StatValue>{value}</StatValue>
      <StatLabel>{label}</StatLabel>
      {helper ? <StatHelper>{helper}</StatHelper> : null}
    </StatCard>
  )
}
