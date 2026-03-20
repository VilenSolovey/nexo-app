import React from "react"
import { ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"
import { SettingsSection } from "@nexo/components/Settings/SettingsSection"
import {
  FieldLabel,
  PrimaryButton,
  PrimaryButtonText,
  ProfileInput,
  ReadonlyField,
  ReadonlyText,
} from "@nexo/components/Settings/Settings.styled"

type ProfileSectionProps = {
  displayName: string
  email: string
  isSavingName: boolean
  onChangeDisplayName: (value: string) => void
  onSaveDisplayName: () => void
}

export function ProfileSection({
  displayName,
  email,
  isSavingName,
  onChangeDisplayName,
  onSaveDisplayName,
}: ProfileSectionProps) {
  const Theme = useAppTheme()

  return (
    <SettingsSection
      icon="person-circle-outline"
      title="Профіль"
      subtitle="Онови ім'я, яке бачиш у головному екрані та профілі."
    >
      <FieldLabel>Display name</FieldLabel>
      <ProfileInput
        value={displayName}
        onChangeText={onChangeDisplayName}
        placeholder="Введіть ім'я"
        placeholderTextColor={Theme.textSecondary}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={onSaveDisplayName}
      />

      <FieldLabel>Email</FieldLabel>
      <ReadonlyField>
        <Ionicons name="mail-outline" size={18} color={Theme.textSecondary} />
        <ReadonlyText>{email}</ReadonlyText>
      </ReadonlyField>

      <PrimaryButton onPress={onSaveDisplayName} disabled={isSavingName} $disabled={isSavingName}>
        {isSavingName ? (
          <ActivityIndicator size="small" color={Theme.background} />
        ) : (
          <>
            <Ionicons name="save-outline" size={18} color={Theme.background} />
            <PrimaryButtonText>Зберегти ім&apos;я</PrimaryButtonText>
          </>
        )}
      </PrimaryButton>
    </SettingsSection>
  )
}
