import styled from 'styled-components/native'
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'

export const ScreenGradient = styled(LinearGradient)<LinearGradientProps>`
  flex: 1;
`

export const SafeArea = styled(SafeAreaView).attrs({ edges: ['top', 'left', 'right'] })`
  flex: 1;
`

export const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: { padding: 20, paddingBottom: 120 },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`

export const Header = styled.View`
  margin-bottom: 18px;
`

export const Eyebrow = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
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
    $disabled ? `${theme.textSecondary}18` : `${theme.primary}20`};
  border-width: 1px;
  border-color: ${({ $disabled, theme }) =>
    $disabled ? `${theme.textSecondary}24` : `${theme.primary}60`};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`

export const EraNavCenter = styled.View`
  flex: 1;
  align-items: center;
`

export const EraNavText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 800;
`

export const EraHero = styled(LinearGradient)`
  border-radius: 24px;
  padding: 20px;
  border-width: 1px;
  border-color: ${({ theme }) => `${theme.primary}55`};
  margin-bottom: 16px;
  overflow: hidden;
`

export const HeroTopRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  column-gap: 14px;
`

export const HeroTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 23px;
  font-weight: 800;
  flex: 1;
`

export const Pill = styled.View<{ $variant?: 'primary' | 'muted' | 'success' | 'warning' }>`
  padding-horizontal: 10px;
  padding-vertical: 5px;
  border-radius: 999px;
  background-color: ${({ $variant, theme }) => {
    if ($variant === 'success') return `${theme.success}26`
    if ($variant === 'warning') return `${theme.warning}26`
    if ($variant === 'primary') return `${theme.primary}2a`
    return `${theme.textSecondary}20`
  }};
`

export const PillText = styled.Text<{ $variant?: 'primary' | 'muted' | 'success' | 'warning' }>`
  color: ${({ $variant, theme }) => {
    if ($variant === 'success') return theme.success
    if ($variant === 'warning') return theme.warning
    if ($variant === 'primary') return theme.primary
    return theme.textSecondary
  }};
  font-size: 12px;
  font-weight: 800;
`

export const HeroProgressRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  margin-bottom: 8px;
`

export const HeroProgressLabel = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  font-weight: 700;
`

export const HeroProgressValue = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  font-weight: 800;
`

export const ProgressTrack = styled.View`
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background-color: ${({ theme }) => `${theme.background}ba`};
`

export const ProgressFill = styled.View<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => `${Math.max(0, Math.min($progress, 100))}%`};
  border-radius: 999px;
  background-color: ${({ theme }) => theme.primary};
`

export const ArchiveButton = styled.TouchableOpacity`
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  column-gap: 7px;
  margin-top: 16px;
  padding-horizontal: 12px;
  padding-vertical: 9px;
  border-radius: 12px;
  background-color: ${({ theme }) => `${theme.background}9c`};
  border-width: 1px;
  border-color: ${({ theme }) => `${theme.primary}48`};
`

export const ArchiveButtonText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  font-weight: 800;
`

export const DiscoveryCard = styled(LinearGradient)`
  border-radius: 22px;
  padding: 18px;
  margin-bottom: 14px;
  border-width: 1px;
  border-color: ${({ theme }) => `${theme.primary}62`};
  overflow: hidden;
`

export const DiscoveryTop = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  column-gap: 12px;
`

export const DiscoveryKicker = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.9px;
  text-transform: uppercase;
`

export const DiscoveryTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  font-weight: 800;
  margin-top: 10px;
`

export const DiscoveryText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  margin-top: 7px;
`

export const DiscoveryAction = styled.TouchableOpacity`
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  column-gap: 7px;
  margin-top: 14px;
  padding-horizontal: 13px;
  padding-vertical: 10px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.primary};
`

export const DiscoveryActionText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 13px;
  font-weight: 800;
`

/** Компактна наступна дія: не конкурує з великим hero епохи. */
export const FocusActionCard = styled.View`
  flex-direction: row;
  align-items: center;
  column-gap: 11px;
  background-color: ${({ theme }) => theme.card};
  border-width: 1px;
  border-color: ${({ theme }) => `${theme.primary}55`};
  border-radius: 19px;
  padding: 13px;
  margin-bottom: 16px;
`

export const FocusActionIcon = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 15px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => `${theme.primary}18`};
`

export const FocusActionBody = styled.View`
  flex: 1;
  min-width: 0px;
`

export const FocusActionKicker = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 10px;
  line-height: 13px;
  font-weight: 900;
  letter-spacing: 0.8px;
  text-transform: uppercase;
`

export const FocusActionTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  line-height: 20px;
  font-weight: 900;
  margin-top: 2px;
`

export const FocusActionText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  line-height: 17px;
  margin-top: 2px;
`

export const FocusActionButton = styled.TouchableOpacity`
  min-height: 40px;
  padding-horizontal: 11px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  column-gap: 5px;
  background-color: ${({ theme }) => theme.primary};
`

export const FocusActionButtonText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 12px;
  font-weight: 900;
`

export const FogNotice = styled.View`
  flex-direction: row;
  align-items: center;
  column-gap: 8px;
  margin: 0px 4px 15px;
  padding: 10px 11px;
  border-radius: 12px;
  background-color: ${({ theme }) => `${theme.textSecondary}13`};
`

export const FogNoticeText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 700;
  flex: 1;
`

export const RoutePanel = styled.View`
  background-color: ${({ theme }) => theme.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  border-radius: 24px;
  padding: 18px 14px 8px;
  margin-bottom: 16px;
`

export const RouteHeader = styled.View`
  padding-horizontal: 4px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
`

export const RouteTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 19px;
  font-weight: 800;
`

export const RouteHint = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 19px;
  padding-horizontal: 4px;
  margin-bottom: 18px;
`

export const RouteItem = styled.TouchableOpacity<{ $side: 'left' | 'right' }>`
  flex-direction: row;
  align-items: stretch;
  min-height: 96px;
  flex-direction: ${({ $side }) => ($side === 'left' ? 'row' : 'row-reverse')};
`

export const RouteRail = styled.View`
  width: 46px;
  align-items: center;
`

export const RouteLine = styled.View<{ $filled?: boolean }>`
  position: absolute;
  top: 29px;
  bottom: -2px;
  width: 3px;
  border-radius: 2px;
  background-color: ${({ $filled, theme }) => ($filled ? theme.primary : theme.cardBorder)};
`

export const RouteNode = styled.View<{ $status: 'locked' | 'available' | 'created' | 'completed' | 'trial' }>`
  width: ${({ $status }) => ($status === 'trial' ? 42 : 32)}px;
  height: ${({ $status }) => ($status === 'trial' ? 42 : 32)}px;
  border-radius: ${({ $status }) => ($status === 'trial' ? 21 : 16)}px;
  align-items: center;
  justify-content: center;
  z-index: 1;
  background-color: ${({ $status, theme }) => {
    if ($status === 'completed') return theme.success
    if ($status === 'available') return theme.primary
    if ($status === 'created') return theme.warning
    if ($status === 'trial') return `${theme.primary}22`
    return theme.background
  }};
  border-width: 2px;
  border-color: ${({ $status, theme }) => {
    if ($status === 'completed') return theme.success
    if ($status === 'available') return theme.primary
    if ($status === 'created') return theme.warning
    if ($status === 'trial') return theme.primary
    return theme.cardBorder
  }};
  shadow-color: ${({ theme }) => theme.primary};
  shadow-opacity: ${({ $status }) => ($status === 'available' ? 0.35 : 0)};
  shadow-radius: 10px;
  elevation: ${({ $status }) => ($status === 'available' ? 4 : 0)};
`

export const RouteCard = styled.View<{ $status: 'locked' | 'available' | 'created' | 'completed' | 'trial'; $side: 'left' | 'right'; $highlight?: boolean }>`
  flex: 1;
  background-color: ${({ $status, theme }) => {
    if ($status === 'available') return `${theme.primary}16`
    if ($status === 'trial') return `${theme.primary}10`
    if ($status === 'locked') return `${theme.background}a8`
    return theme.background
  }};
  border-width: 1px;
  border-color: ${({ $status, theme }) => {
    if ($status === 'available' || $status === 'trial') return theme.primary
    if ($status === 'completed') return `${theme.success}88`
    if ($status === 'created') return `${theme.warning}88`
    return theme.cardBorder
  }};
  border-radius: 18px;
  padding: 13px;
  margin-bottom: 14px;
  opacity: ${({ $status }) => ($status === 'locked' ? 0.64 : 1)};
  shadow-color: ${({ theme }) => theme.primary};
  shadow-opacity: ${({ $highlight }) => ($highlight ? 0.2 : 0)};
  shadow-radius: 16px;
  elevation: ${({ $highlight }) => ($highlight ? 4 : 0)};
`

export const RouteCardTop = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  column-gap: 8px;
`

export const RouteKicker = styled.Text<{ $status?: 'locked' | 'available' | 'created' | 'completed' | 'trial' }>`
  color: ${({ $status, theme }) => {
    if ($status === 'completed') return theme.success
    if ($status === 'created') return theme.warning
    if ($status === 'available' || $status === 'trial') return theme.primary
    return theme.textSecondary
  }};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 4px;
`

export const RouteCardTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 800;
  flex: 1;
`

export const RouteCardText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 18px;
  margin-top: 7px;
`

export const RouteMeta = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
`

export const RouteCta = styled.View<{ $muted?: boolean }>`
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  column-gap: 6px;
  margin-top: 12px;
  padding-horizontal: 11px;
  padding-vertical: 8px;
  border-radius: 10px;
  background-color: ${({ $muted, theme }) => ($muted ? `${theme.textSecondary}22` : theme.primary)};
`

export const RouteCtaText = styled.Text<{ $muted?: boolean }>`
  color: ${({ $muted, theme }) => ($muted ? theme.textSecondary : theme.background)};
  font-size: 12px;
  font-weight: 800;
`

export const TrialSummary = styled.View`
  background-color: ${({ theme }) => `${theme.primary}12`};
  border-width: 1px;
  border-color: ${({ theme }) => `${theme.primary}55`};
  border-radius: 18px;
  padding: 15px;
  margin-bottom: 16px;
`

export const TrialSummaryTop = styled.View`
  flex-direction: row;
  align-items: center;
  column-gap: 10px;
`

export const TrialSummaryTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 800;
`

export const TrialSummaryText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 19px;
  margin-top: 8px;
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

export const ArchiveModalContent = styled.View`
  background-color: ${({ theme }) => theme.card};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding-top: 24px;
  padding-horizontal: 22px;
  padding-bottom: 34px;
  min-height: 54%;
  max-height: 82%;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const ArchiveList = styled.ScrollView.attrs({ showsVerticalScrollIndicator: false })`
  margin-top: 8px;
`

export const ArchiveWorkshopNotice = styled.View`
  margin: 10px 0 8px;
  padding: 14px;
  border-radius: 18px;
  border-width: 1px;
  border-color: ${({ theme }) => `${theme.primary}38`};
  background-color: ${({ theme }) => `${theme.primary}0d`};
  flex-direction: row;
  align-items: center;
  gap: 12px;
`

export const ArchiveWorkshopAvatar = styled.Image`
  width: 52px;
  height: 52px;
`

export const ArchiveWorkshopCopy = styled.View`
  flex: 1;
`

export const ArchiveWorkshopTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  font-weight: 900;
`

export const ArchiveWorkshopText = styled.Text`
  margin-top: 4px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 11px;
  line-height: 16px;
`

export const ArchiveEntry = styled.View<{ $locked?: boolean }>`
  flex-direction: row;
  align-items: center;
  column-gap: 12px;
  padding: 12px 0px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.cardBorder};
  opacity: ${({ $locked }) => ($locked ? 0.58 : 1)};
`

export const ArchiveEntryIcon = styled.View<{ $locked?: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $locked, theme }) =>
    $locked ? theme.background : `${theme.primary}20`};
`

export const ArchiveEntryBody = styled.View`
  flex: 1;
`

export const ArchiveEntryType = styled.Text<{ $locked?: boolean }>`
  color: ${({ $locked, theme }) => ($locked ? theme.textTertiary : theme.primary)};
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
`

export const ArchiveEntryTitle = styled.Text<{ $locked?: boolean }>`
  color: ${({ $locked, theme }) => ($locked ? theme.textSecondary : theme.text)};
  font-size: 15px;
  font-weight: 800;
  margin-top: 2px;
`
