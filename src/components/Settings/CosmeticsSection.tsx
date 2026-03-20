import React from "react"
import { Ionicons } from "@expo/vector-icons"
import { Avatar } from "@nexo/components/Home/Avatar"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"
import {
  DEFAULT_AVATAR_ID,
  getAvatarSeed,
  getThemePreview,
} from "@nexo/utils/profile-customization"
import { SettingsSection } from "@nexo/components/Settings/SettingsSection"
import {
  AvatarOptionBadge,
  AvatarPreview,
  CosmeticsHint,
  CosmeticsHintText,
  OptionCard,
  OptionDescription,
  OptionTitle,
  OptionsGrid,
  SelectionPill,
  SelectionPillText,
  SubsectionTitle,
  ThemePreviewCard,
} from "@nexo/components/Settings/Settings.styled"

type ThemeOption = {
  id: string
  name: string
  description: string
  icon: string
}

type AvatarOption = {
  id: string
  name: string
  description: string
  icon: string
}

type CosmeticsSectionProps = {
  avatarFallback: string
  ownedThemes: ThemeOption[]
  ownedAvatars: AvatarOption[]
  selectedThemeId: string
  selectedAvatarId: string
  savingSelection: "theme" | "avatar" | null
  unlockedCosmeticsCount: number
  onSelectTheme: (value: string | null) => void
  onSelectAvatar: (value: string | null) => void
}

export function CosmeticsSection({
  avatarFallback,
  ownedThemes,
  ownedAvatars,
  selectedThemeId,
  selectedAvatarId,
  savingSelection,
  unlockedCosmeticsCount,
  onSelectTheme,
  onSelectAvatar,
}: CosmeticsSectionProps) {
  const Theme = useAppTheme()

  return (
    <SettingsSection
      icon="color-palette-outline"
      title="Косметика"
      subtitle="Обери активний вигляд із того, що вже куплено в магазині."
    >
      <SubsectionTitle>Теми</SubsectionTitle>
      <OptionsGrid>
        {ownedThemes.map((item) => {
          const preview = getThemePreview(item.id)
          const isSelected = selectedThemeId === item.id

          return (
            <OptionCard
              key={item.id}
              $selected={isSelected}
              onPress={() => onSelectTheme(item.id)}
              disabled={savingSelection === "theme"}
            >
              <ThemePreviewCard colors={preview.colors}>
                <Ionicons name={item.icon as any} size={18} color={preview.accent} />
              </ThemePreviewCard>
              <OptionTitle>{item.name}</OptionTitle>
              <OptionDescription>{item.description}</OptionDescription>
              <SelectionStatus selected={isSelected} />
            </OptionCard>
          )
        })}
      </OptionsGrid>

      <SubsectionTitle $spaced>Аватари</SubsectionTitle>
      <OptionsGrid>
        {ownedAvatars.map((item) => {
          const isSelected = selectedAvatarId === item.id
          const seed = getAvatarSeed(
            item.id === DEFAULT_AVATAR_ID ? null : item.id,
            avatarFallback,
          )

          return (
            <OptionCard
              key={item.id}
              $selected={isSelected}
              onPress={() => onSelectAvatar(item.id === DEFAULT_AVATAR_ID ? null : item.id)}
              disabled={savingSelection === "avatar"}
            >
              <AvatarPreview>
                <Avatar seed={seed} size={54} />
                <AvatarOptionBadge>
                  <Ionicons name={item.icon as any} size={14} color={Theme.primary} />
                </AvatarOptionBadge>
              </AvatarPreview>
              <OptionTitle>{item.name}</OptionTitle>
              <OptionDescription>{item.description}</OptionDescription>
              <SelectionStatus selected={isSelected} />
            </OptionCard>
          )
        })}
      </OptionsGrid>

      <CosmeticsHint>
        <Ionicons name="sparkles-outline" size={16} color={Theme.primary} />
        <CosmeticsHintText>Доступно косметики: {unlockedCosmeticsCount}</CosmeticsHintText>
      </CosmeticsHint>
    </SettingsSection>
  )
}

function SelectionStatus({ selected }: { selected: boolean }) {
  const Theme = useAppTheme()

  return (
    <SelectionPill $selected={selected}>
      <Ionicons
        name={selected ? "checkmark-circle" : "ellipse-outline"}
        size={14}
        color={selected ? Theme.success : Theme.textSecondary}
      />
      <SelectionPillText $selected={selected}>
        {selected ? "Активно" : "Обрати"}
      </SelectionPillText>
    </SelectionPill>
  )
}
