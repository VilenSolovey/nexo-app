import React, { useState } from "react"
import { ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"
import { SettingsSection } from "./SettingsSection"
import {
  AccountAction,
  AccountActionBody,
  AccountActionDetail,
  AccountActionIcon,
  AccountActionTitle,
  AccountEditActions,
  AccountEditor,
  DangerButton,
  DangerButtonText,
  FieldLabel,
  PrimaryButton,
  PrimaryButtonText,
  ProfileInput,
  SecondaryButton,
  SecondaryButtonText,
} from "./Settings.styled"

type AccountSectionProps = {
  displayName: string
  savedDisplayName: string
  isSavingName: boolean
  onChangeDisplayName: (value: string) => void
  onSaveDisplayName: () => Promise<boolean>
  onCancelDisplayName: () => void
  onLogout: () => void
}

export function AccountSection({
  displayName,
  savedDisplayName,
  isSavingName,
  onChangeDisplayName,
  onSaveDisplayName,
  onCancelDisplayName,
  onLogout,
}: AccountSectionProps) {
  const Theme = useAppTheme()
  const [editingName, setEditingName] = useState(false)

  const cancelEditing = () => {
    if (isSavingName) return
    onCancelDisplayName()
    setEditingName(false)
  }

  const saveName = async () => {
    if (isSavingName) return
    const saved = await onSaveDisplayName()
    if (saved) setEditingName(false)
  }

  return (
    <SettingsSection
      icon="shield-checkmark-outline"
      title="Акаунт"
      subtitle="Нікнейм і керування поточною сесією."
    >
      <AccountAction
        disabled={isSavingName}
        onPress={() => setEditingName((current) => !current)}
      >
        <AccountActionIcon>
          <Ionicons name="create-outline" size={18} color={Theme.primary} />
        </AccountActionIcon>
        <AccountActionBody>
          <AccountActionTitle>Змінити нікнейм</AccountActionTitle>
          <AccountActionDetail numberOfLines={1}>{savedDisplayName}</AccountActionDetail>
        </AccountActionBody>
        <Ionicons
          name={editingName ? "chevron-up" : "chevron-forward"}
          size={18}
          color={Theme.textSecondary}
        />
      </AccountAction>

      {editingName ? (
        <AccountEditor>
          <FieldLabel>Новий нікнейм</FieldLabel>
          <ProfileInput
            value={displayName}
            onChangeText={onChangeDisplayName}
            placeholder="Введіть нікнейм"
            placeholderTextColor={Theme.textSecondary}
            autoCapitalize="words"
            returnKeyType="done"
            maxLength={24}
            editable={!isSavingName}
            onSubmitEditing={() => { void saveName() }}
          />
          <AccountEditActions>
            <SecondaryButton
              onPress={cancelEditing}
              disabled={isSavingName}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <SecondaryButtonText>Скасувати</SecondaryButtonText>
            </SecondaryButton>
            <PrimaryButton
              onPress={() => { void saveName() }}
              disabled={isSavingName}
              $disabled={isSavingName}
              style={{ flex: 1 }}
            >
              {isSavingName ? (
                <ActivityIndicator size="small" color={Theme.background} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color={Theme.background} />
                  <PrimaryButtonText>Зберегти</PrimaryButtonText>
                </>
              )}
            </PrimaryButton>
          </AccountEditActions>
        </AccountEditor>
      ) : null}

      <DangerButton onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color={Theme.text} />
        <DangerButtonText>Вийти з акаунту</DangerButtonText>
      </DangerButton>
    </SettingsSection>
  )
}
