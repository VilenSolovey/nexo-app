import React from "react"
import { Ionicons } from "@expo/vector-icons"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"
import {
  SectionCard,
  SectionHeader,
  SectionIconWrap,
  SectionSubtitle,
  SectionTitle,
  SectionTitleWrap,
} from "@nexo/components/Settings/Settings.styled"

type SettingsSectionProps = {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  children: React.ReactNode
}

export function SettingsSection({ icon, title, subtitle, children }: SettingsSectionProps) {
  const Theme = useAppTheme()

  return (
    <SectionCard>
      <SectionHeader>
        <SectionIconWrap>
          <Ionicons name={icon} size={18} color={Theme.primary} />
        </SectionIconWrap>
        <SectionTitleWrap>
          <SectionTitle>{title}</SectionTitle>
          <SectionSubtitle>{subtitle}</SectionSubtitle>
        </SectionTitleWrap>
      </SectionHeader>
      {children}
    </SectionCard>
  )
}
