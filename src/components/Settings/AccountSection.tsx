import React from "react"
import { Ionicons } from "@expo/vector-icons"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"
import { SettingsSection } from "./SettingsSection"
import {
  DangerButton,
  DangerButtonText,
  SecondaryButton,
  SecondaryButtonText,
} from "./Settings.styled"

type AccountSectionProps = {
  canLogout: boolean
  onOpenShop: () => void
  onLogout: () => void
}

export function AccountSection({ canLogout, onOpenShop, onLogout }: AccountSectionProps) {
  const Theme = useAppTheme()

  return (
    <SettingsSection
      icon="shield-checkmark-outline"
      title="Акаунт"
      subtitle="Швидкі дії для магазину та керування сесією."
    >
      <SecondaryButton onPress={onOpenShop}>
        <Ionicons name="cart-outline" size={18} color={Theme.text} />
        <SecondaryButtonText>Перейти в магазин</SecondaryButtonText>
      </SecondaryButton>

      {canLogout ? (
        <DangerButton onPress={onLogout}>
          <Ionicons name="log-out-outline" size={18} color={Theme.text} />
          <DangerButtonText>Вийти з акаунту</DangerButtonText>
        </DangerButton>
      ) : null}
    </SettingsSection>
  )
}
