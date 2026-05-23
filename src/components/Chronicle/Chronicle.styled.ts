import styled from 'styled-components/native'
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'

export const ScreenGradient = styled(LinearGradient)<LinearGradientProps>`
  flex: 1;
`

export const SafeArea = styled(SafeAreaView).attrs({
  edges: ['top', 'left', 'right'],
})`
  flex: 1;
`

export const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 20,
    paddingBottom: 120,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`

export const Header = styled.View`
  margin-bottom: 18px;
`

export const Eyebrow = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 6px;
`

export const Title = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 30px;
  font-weight: 800;
`

export const Subtitle = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 15px;
  line-height: 21px;
  margin-top: 8px;
`

export const Panel = styled.View`
  width: 100%;
  background-color: ${({ theme }) => theme.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
`

export const PanelHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  column-gap: 12px;
`

export const PanelTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 1;
`

export const Pill = styled.View<{ $variant?: 'primary' | 'muted' | 'success' }>`
  padding-horizontal: 10px;
  padding-vertical: 5px;
  border-radius: 999px;
  background-color: ${({ $variant, theme }) => {
    if ($variant === 'success') return `${theme.success}26`
    if ($variant === 'primary') return `${theme.primary}26`
    return `${theme.textSecondary}20`
  }};
`

export const PillText = styled.Text<{ $variant?: 'primary' | 'muted' | 'success' }>`
  color: ${({ $variant, theme }) => {
    if ($variant === 'success') return theme.success
    if ($variant === 'primary') return theme.primary
    return theme.textSecondary
  }};
  font-size: 12px;
  font-weight: 700;
`

export const ProgressGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`

export const ProgressItem = styled.View`
  flex-grow: 1;
  flex-basis: 46%;
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const ProgressValue = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 22px;
  font-weight: 800;
`

export const ProgressLabel = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  margin-top: 4px;
`

export const EraNav = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  column-gap: 12px;
  margin-bottom: 14px;
`

export const EraNavButton = styled.TouchableOpacity<{ $disabled?: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 21px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $disabled, theme }) =>
    $disabled ? `${theme.textSecondary}18` : `${theme.primary}24`};
  border-width: 1px;
  border-color: ${({ $disabled, theme }) =>
    $disabled ? `${theme.textSecondary}24` : `${theme.primary}55`};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`

export const EraNavCenter = styled.View`
  flex: 1;
  align-items: center;
`

export const EraNavText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 700;
`

export const ChallengeBody = styled.View`
  row-gap: 12px;
`

export const ChallengeDescription = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
`

export const ChallengeMetaRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`

export const PrimaryButton = styled.TouchableOpacity<{ $variant?: 'primary' | 'muted' }>`
  min-height: 48px;
  border-radius: 14px;
  background-color: ${({ $variant, theme }) =>
    $variant === 'muted' ? `${theme.textSecondary}33` : theme.primary};
  align-items: center;
  justify-content: center;
  flex-direction: row;
  column-gap: 8px;
  opacity: ${({ disabled }) => (disabled ? 0.86 : 1)};
`

export const PrimaryButtonText = styled.Text<{ $variant?: 'primary' | 'muted' }>`
  color: ${({ $variant, theme }) => ($variant === 'muted' ? theme.textSecondary : '#0f2f2a')};
  font-size: 15px;
  font-weight: 800;
`

export const Timeline = styled.View`
  margin-top: 2px;
`

export const TimelineItem = styled.TouchableOpacity`
  flex-direction: row;
`

export const TimelineRail = styled.View`
  width: 30px;
  align-items: center;
`

export const TimelineDot = styled.View<{ $status: 'locked' | 'current' | 'unlocked' | 'mastered' }>`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  border-width: 2px;
  border-color: ${({ $status, theme }) => {
    if ($status === 'mastered') return theme.success
    if ($status === 'current') return theme.primary
    if ($status === 'unlocked') return theme.warning
    return theme.cardBorder
  }};
  background-color: ${({ $status, theme }) => {
    if ($status === 'mastered') return theme.success
    if ($status === 'current') return theme.primary
    return theme.background
  }};
`

export const TimelineLine = styled.View`
  width: 2px;
  flex: 1;
  min-height: 76px;
  background-color: ${({ theme }) => theme.cardBorder};
`

export const FragmentCard = styled.View<{ $status: 'locked' | 'current' | 'unlocked' | 'mastered' }>`
  flex: 1;
  margin-bottom: 14px;
  border-radius: 14px;
  padding: 14px;
  border-width: 1px;
  border-color: ${({ $status, theme }) => {
    if ($status === 'mastered') return `${theme.success}80`
    if ($status === 'current') return theme.primary
    return theme.cardBorder
  }};
  background-color: ${({ $status, theme }) =>
    $status === 'locked' ? `${theme.card}99` : theme.card};
  opacity: ${({ $status }) => ($status === 'locked' ? 0.72 : 1)};
`

export const FragmentHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  column-gap: 12px;
`

export const FragmentYear = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 4px;
`

export const FragmentTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 17px;
  font-weight: 800;
  flex-shrink: 1;
`

export const FragmentSubtitle = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  margin-top: 2px;
`

export const FragmentText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  margin-top: 10px;
`

export const EmptyText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 15px;
  text-align: center;
  margin-top: 24px;
`

export const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.55);
  justify-content: flex-end;
`

export const ModalContent = styled.View`
  background-color: ${({ theme }) => theme.card};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding-top: 24px;
  padding-horizontal: 22px;
  padding-bottom: 22px;
  min-height: 30%;
  max-height: 50%;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const ModalHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  column-gap: 16px;
  margin-bottom: 12px;
`

export const CloseButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.background};
`
