import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient'
import { styled } from 'styled-components/native'

export const ScreenContent = styled.View`
  width: 100%;
  gap: 16px;
  padding-bottom: 140px;
`

export const HeroCard = styled(LinearGradient)<LinearGradientProps>`
  width: 100%;
  border-radius: 28px;
  padding: 20px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.08);
  overflow: hidden;
`

export const HeroTopRow = styled.View`
  flex-direction: row;
  align-items: center;
`

export const AvatarWrap = styled.View`
  position: relative;
`

export const AvatarBadge = styled.View`
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.primary};
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-color: ${({ theme }) => theme.card};
`

export const HeroTextWrap = styled.View`
  flex: 1;
  margin-left: 16px;
  gap: 6px;
`

export const HeroName = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  font-weight: 800;
`

export const HeroEmail = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
`

export const ActiveThemePill = styled.View`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  gap: 6px;
  border-width: 1px;
  border-radius: 999px;
  padding: 6px 10px;
  background-color: rgba(10, 18, 15, 0.18);
`

export const ActiveThemeText = styled.Text`
  font-size: 12px;
  font-weight: 700;
`

export const HeroStatsRow = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 18px;
  flex-wrap: wrap;
`

export const HeroStatPill = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 10px 12px;
  background-color: rgba(12, 20, 17, 0.34);
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.08);
`

export const HeroStatValue = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  font-weight: 700;
`

export const SectionCard = styled.View`
  width: 100%;
  background-color: ${({ theme }) => theme.card};
  border-radius: 24px;
  padding: 18px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const SectionHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 16px;
`

export const SectionIconWrap = styled.View`
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background-color: rgba(94, 234, 212, 0.12);
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`

export const SectionTitleWrap = styled.View`
  flex: 1;
`

export const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 800;
`

export const SectionSubtitle = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 18px;
  margin-top: 4px;
`

export const FieldLabel = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

export const ProfileInput = styled.TextInput`
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  border-radius: 16px;
  padding: 14px;
  font-size: 16px;
  margin-bottom: 14px;
`

export const ReadonlyField = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  background-color: ${({ theme }) => theme.background};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 16px;
`

export const ReadonlyText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  flex: 1;
`

export const PrimaryButton = styled.Pressable<{ $disabled?: boolean }>`
  min-height: 50px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.primary};
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 8px;
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
`

export const PrimaryButtonText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 15px;
  font-weight: 800;
`

export const SubsectionTitle = styled.Text<{ $spaced?: boolean }>`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 12px;
  margin-top: ${({ $spaced }) => ($spaced ? 18 : 0)}px;
`

export const OptionsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`

export const OptionCard = styled.Pressable<{ $selected?: boolean }>`
  width: 48%;
  min-width: 150px;
  background-color: ${({ theme }) => theme.background};
  border-radius: 18px;
  padding: 12px;
  border-width: 1px;
  border-color: ${({ $selected, theme }) => ($selected ? theme.primary : theme.cardBorder)};
  shadow-color: ${({ theme }) => theme.primary};
  shadow-opacity: ${({ $selected }) => ($selected ? 0.2 : 0)};
  shadow-radius: ${({ $selected }) => ($selected ? 10 : 0)}px;
  elevation: ${({ $selected }) => ($selected ? 3 : 0)};
`

export const ThemePreviewCard = styled(LinearGradient)<LinearGradientProps>`
  height: 72px;
  border-radius: 14px;
  justify-content: flex-end;
  padding: 10px;
  margin-bottom: 10px;
`

export const AvatarPreview = styled.View`
  height: 72px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: #1a2721;
  margin-bottom: 10px;
  position: relative;
`

export const AvatarOptionBadge = styled.View`
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.card};
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const OptionTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  font-weight: 800;
`

export const OptionDescription = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  line-height: 17px;
  margin-top: 6px;
  min-height: 34px;
`

export const SelectionPill = styled.View<{ $selected?: boolean }>`
  margin-top: 10px;
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  background-color: ${({ $selected }) =>
    $selected ? 'rgba(74, 222, 128, 0.12)' : 'rgba(255, 255, 255, 0.04)'};
`

export const SelectionPillText = styled.Text<{ $selected?: boolean }>`
  color: ${({ $selected, theme }) => ($selected ? theme.success : theme.textSecondary)};
  font-size: 12px;
  font-weight: 700;
`

export const CosmeticsHint = styled.View`
  margin-top: 16px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`

export const CosmeticsHintText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
`

export const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  align-items: stretch;
`

export const StatsLoading = styled.View`
  margin-top: 14px;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

export const StatsLoadingText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
`

export const StatCard = styled.View`
  flex-grow: 1;
  flex-basis: 47%;
  max-width: 48.5%;
  min-height: 124px;
  background-color: ${({ theme }) => theme.background};
  border-radius: 18px;
  padding: 14px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  justify-content: flex-start;
`

export const StatValue = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  font-weight: 900;
  margin-top: 10px;
`

export const StatLabel = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  margin-top: 6px;
`

export const StatHelper = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 12px;
  margin-top: 4px;
  font-weight: 700;
`

export const SecondaryButton = styled.Pressable`
  min-height: 50px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.background};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 8px;
  margin-bottom: 12px;
`

export const SecondaryButtonText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  font-weight: 800;
`

export const DangerButton = styled.Pressable`
  min-height: 50px;
  border-radius: 16px;
  background-color: rgba(239, 68, 68, 0.12);
  border-width: 1px;
  border-color: rgba(239, 68, 68, 0.28);
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 8px;
`

export const DangerButtonText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  font-weight: 800;
`
