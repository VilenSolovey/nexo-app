import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient'
import { styled } from 'styled-components/native'

type StatusVariant = 'completed' | 'unlocked' | 'locked'
type TierVariant = 'claimed' | 'unlocked' | 'locked'

function withAlpha(color: string, alpha: string) {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    return `${color}${alpha}`
  }

  return color
}

export const Screen = styled.View`
  width: 100%;
  gap: 18px;
  padding-bottom: 120px;
`

export const Header = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`

export const HeaderCopy = styled.View`
  flex: 1;
  gap: 6px;
`

export const Eyebrow = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
`

export const Title = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 30px;
  font-weight: 800;
`

export const Subtitle = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
`

export const HeaderIcon = styled.View`
  width: 52px;
  height: 52px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const HeroCard = styled(LinearGradient)<LinearGradientProps>`
  width: 100%;
  border-radius: 24px;
  padding: 18px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, '40')};
`

export const HeroTopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`

export const HeroTopCopy = styled.View``;

export const HeroLabel = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
`

export const HeroTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 28px;
  font-weight: 800;
  margin-top: 4px;
`

export const HeroBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding-horizontal: 12px;
  padding-vertical: 8px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.primary};
`

export const HeroBadgeText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 13px;
  font-weight: 800;
`

export const StatsRow = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 16px;
`

export const StatCard = styled.View`
  flex: 1;
  background-color: rgba(14, 22, 19, 0.22);
  border-radius: 18px;
  padding: 14px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.05);
`

export const StatValue = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 22px;
  font-weight: 800;
`

export const StatLabel = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  margin-top: 6px;
`

export const NextAchievementCard = styled.View`
  margin-top: 16px;
  background-color: rgba(8, 12, 10, 0.24);
  border-radius: 18px;
  padding: 14px;
  gap: 10px;
`

export const NextAchievementHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
`

export const NextAchievementCaption = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
`

export const NextAchievementProgress = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 12px;
  font-weight: 700;
`

export const NextAchievementTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 700;
`

export const NextAchievementText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 18px;
`

export const ProgressTrack = styled.View`
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
`

export const ProgressFill = styled.View<{ $width: string; $background?: string }>`
  height: 100%;
  width: ${({ $width }) => $width};
  border-radius: 999px;
  background-color: ${({ $background, theme }) => $background ?? theme.primary};
`

export const Section = styled.View`
  width: 100%;
  gap: 12px;
`

export const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`

export const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 700;
`

export const SectionMeta = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
`

export const AlmostCard = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  border-radius: 18px;
  padding: 14px;
  background-color: ${({ theme }) => theme.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const AlmostIconWrap = styled.View<{ $background: string }>`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $background }) => $background};
`

export const AlmostCopy = styled.View`
  flex: 1;
  gap: 4px;
`

export const AlmostTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  font-weight: 700;
`

export const AlmostText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
`

export const AlmostProgressWrap = styled.View`
  min-width: 54px;
  align-items: flex-end;
`

export const AlmostProgressText = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 14px;
  font-weight: 800;
`

export const FilterScroll = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    gap: 10,
    paddingRight: 8,
  },
})``;

export const FilterChip = styled.TouchableOpacity<{ $active?: boolean }>`
  padding-horizontal: 14px;
  padding-vertical: 10px;
  border-radius: 999px;
  background-color: ${({ $active, theme }) => ($active ? theme.primary : theme.card)};
  border-width: 1px;
  border-color: ${({ $active, theme }) => ($active ? theme.primary : theme.cardBorder)};
`

export const FilterChipText = styled.Text<{ $active?: boolean }>`
  color: ${({ $active, theme }) => ($active ? theme.background : theme.text)};
  font-size: 13px;
  font-weight: 700;
`

export const FeedbackCard = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  padding: 14px;
  background-color: ${({ theme }) => theme.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const FeedbackText = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 18px;
`

export const AchievementCard = styled.View<{ $unlocked?: boolean }>`
  width: 100%;
  flex-direction: row;
  gap: 14px;
  padding: 16px;
  border-radius: 20px;
  background-color: ${({ $unlocked, theme }) =>
    $unlocked ? withAlpha(theme.primary, '14') : theme.card};
  border-width: 1px;
  border-color: ${({ $unlocked, theme }) =>
    $unlocked ? withAlpha(theme.primary, '42') : theme.cardBorder};
`

export const IconContainer = styled.View<{ $background: string }>`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $background }) => $background};
`

export const CardCopy = styled.View`
  flex: 1;
  gap: 8px;
`

export const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`

export const CardTitle = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 700;
`

export const CardDescription = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 18px;
`

export const StatusBadge = styled.View<{ $variant: StatusVariant }>`
  padding-horizontal: 10px;
  padding-vertical: 6px;
  border-radius: 999px;
  background-color: ${({ $variant, theme }) =>
    $variant === 'completed'
      ? withAlpha(theme.success, '20')
      : $variant === 'unlocked'
        ? withAlpha(theme.primary, '20')
        : '#FFFFFF10'};
`

export const StatusBadgeText = styled.Text<{ $variant: StatusVariant }>`
  font-size: 11px;
  font-weight: 800;
  color: ${({ $variant, theme }) =>
    $variant === 'completed'
      ? theme.success
      : $variant === 'unlocked'
        ? theme.primary
        : theme.textSecondary};
`

export const TiersRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`

export const TierChip = styled.View<{ $variant: TierVariant }>`
  padding-horizontal: 10px;
  padding-vertical: 6px;
  border-radius: 999px;
  border-width: 1px;
  background-color: ${({ $variant, theme }) =>
    $variant === 'claimed'
      ? withAlpha(theme.success, '20')
      : $variant === 'unlocked'
        ? withAlpha(theme.primary, '20')
        : '#FFFFFF08'};
  border-color: ${({ $variant, theme }) =>
    $variant === 'claimed'
      ? withAlpha(theme.success, '60')
      : $variant === 'unlocked'
        ? withAlpha(theme.primary, '60')
        : '#FFFFFF12'};
`

export const TierChipText = styled.Text<{ $variant: TierVariant }>`
  font-size: 11px;
  font-weight: 800;
  color: ${({ $variant, theme }) =>
    $variant === 'claimed'
      ? theme.success
      : $variant === 'unlocked'
        ? theme.primary
        : theme.textSecondary};
`

export const CardMetaRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

export const CardMeta = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 600;
`

export const ProgressTrackSmall = styled.View`
  width: 100%;
  height: 7px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
`

export const ClaimButton = styled.TouchableOpacity<{ $disabledVisual?: boolean }>`
  margin-top: 2px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  padding-horizontal: 14px;
  padding-vertical: 12px;
  background-color: ${({ theme }) => theme.primary};
  opacity: ${({ $disabledVisual }) => ($disabledVisual ? 0.7 : 1)};
`

export const ClaimButtonText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 13px;
  font-weight: 800;
`

export const UnlockDate = styled.Text`
  color: ${({ theme }) => theme.textTertiary};
  font-size: 11px;
`
