import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styled } from 'styled-components/native'

export const ScreenGradient = styled(LinearGradient)<LinearGradientProps>`
  flex: 1;
`

export const SafeAreaShell = styled(SafeAreaView)`
  flex: 1;
`

export const TopBar = styled.View`
  padding: 10px 20px 14px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`

export const BackButton = styled.Pressable`
  width: 44px;
  height: 44px;
  border-radius: 15px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  background-color: ${({ theme }) => theme.card};
  align-items: center;
  justify-content: center;
`

export const HeaderCopy = styled.View`
  flex: 1;
  min-width: 0;
`

export const HeaderEyebrow = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.2px;
`

export const HeaderTitle = styled.Text`
  margin-top: 2px;
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  font-weight: 900;
`

export const BalancePill = styled.View`
  min-width: 82px;
  height: 44px;
  padding: 0 12px;
  border-radius: 15px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  background-color: ${({ theme }) => theme.card};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 7px;
`

export const BalanceValue = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 900;
`

export const ContentScroll = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 20,
    paddingBottom: 130,
  },
})``

export const WorkshopHero = styled(LinearGradient)<LinearGradientProps>`
  min-height: 190px;
  overflow: hidden;
  border-radius: 28px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  padding: 22px;
  flex-direction: row;
  align-items: stretch;
`

export const HeroCopy = styled.View`
  flex: 1;
  z-index: 2;
  padding-right: 2px;
`

export const HeroBadge = styled.View`
  align-self: flex-start;
  padding: 7px 10px;
  border-radius: 999px;
  background-color: ${({ theme }) => `${theme.primary}1c`};
  border-width: 1px;
  border-color: ${({ theme }) => `${theme.primary}38`};
  flex-direction: row;
  align-items: center;
  gap: 6px;
`

export const HeroBadgeText = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.8px;
`

export const HeroTitle = styled.Text`
  margin-top: 15px;
  max-width: 210px;
  color: ${({ theme }) => theme.text};
  font-size: 23px;
  line-height: 28px;
  font-weight: 900;
`

export const HeroMessage = styled.Text`
  margin-top: 9px;
  max-width: 220px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 19px;
`

export const NestorImage = styled.Image`
  position: absolute;
  right: -12px;
  bottom: -8px;
  width: 146px;
  height: 180px;
`

export const Section = styled.View`
  margin-top: 30px;
`

export const SectionHeader = styled.View`
  margin-bottom: 14px;
`

export const SectionTitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 9px;
`

export const SectionIcon = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => `${theme.primary}16`};
`

export const SectionTitle = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.text};
  font-size: 19px;
  font-weight: 900;
`

export const SectionSubtitle = styled.Text`
  margin-top: 6px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 18px;
`

export const GearRow = styled.View`
  flex-direction: row;
  gap: 10px;
`

export const GearCard = styled.Pressable<{ $disabled?: boolean }>`
  flex: 1;
  min-width: 0;
  min-height: 180px;
  padding: 13px 11px;
  border-radius: 21px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  background-color: ${({ theme }) => theme.card};
  opacity: ${({ $disabled }) => ($disabled ? 0.56 : 1)};
`

export const GearIcon = styled.View`
  width: 46px;
  height: 46px;
  border-radius: 15px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => `${theme.primary}16`};
`

export const GearTitle = styled.Text`
  margin-top: 12px;
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  line-height: 17px;
  font-weight: 900;
`

export const GearEffect = styled.Text`
  margin-top: 5px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 10px;
  line-height: 14px;
`

export const GearFooter = styled.View`
  margin-top: auto;
  padding-top: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
`

export const PriceGroup = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`

export const PriceText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 12px;
  font-weight: 900;
`

export const CountPill = styled.View<{ $full?: boolean }>`
  min-width: 28px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  background-color: ${({ $full, theme }) =>
    $full ? `${theme.success}1d` : `${theme.primary}17`};
  align-items: center;
  justify-content: center;
`

export const CountText = styled.Text<{ $full?: boolean }>`
  color: ${({ $full, theme }) => ($full ? theme.success : theme.primary)};
  font-size: 10px;
  font-weight: 900;
`

export const CosmeticsList = styled.View`
  gap: 12px;
`

export const CosmeticCard = styled.Pressable<{ $owned?: boolean; $disabled?: boolean }>`
  min-height: 136px;
  overflow: hidden;
  padding: 15px;
  border-radius: 24px;
  border-width: 1px;
  border-color: ${({ $owned, theme }) => ($owned ? `${theme.success}72` : theme.cardBorder)};
  background-color: ${({ theme }) => theme.card};
  flex-direction: row;
  align-items: center;
  gap: 15px;
  opacity: ${({ $disabled }) => ($disabled ? 0.62 : 1)};
`

export const ThemePreview = styled(LinearGradient)<LinearGradientProps>`
  width: 112px;
  height: 104px;
  overflow: hidden;
  border-radius: 19px;
  padding: 13px;
  justify-content: space-between;
`

export const PreviewTopLine = styled.View`
  width: 38px;
  height: 6px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.72);
`

export const PreviewCard = styled.View`
  height: 43px;
  border-radius: 11px;
  padding: 8px;
  justify-content: flex-end;
  background-color: rgba(255, 255, 255, 0.12);
`

export const PreviewAccent = styled.View`
  width: 28px;
  height: 5px;
  border-radius: 999px;
`

export const AvatarPreview = styled.View`
  width: 112px;
  height: 104px;
  border-radius: 19px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.background};
`

export const CosmeticCopy = styled.View`
  flex: 1;
  min-width: 0;
`

export const SmallBadge = styled.View`
  align-self: flex-start;
  padding: 5px 8px;
  border-radius: 999px;
  background-color: ${({ theme }) => `${theme.primary}16`};
`

export const SmallBadgeText = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.6px;
`

export const CosmeticTitle = styled.Text`
  margin-top: 8px;
  color: ${({ theme }) => theme.text};
  font-size: 17px;
  line-height: 21px;
  font-weight: 900;
`

export const CosmeticDescription = styled.Text`
  margin-top: 6px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  line-height: 17px;
`

export const CosmeticFooter = styled.View`
  margin-top: 11px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const OwnedLabel = styled.Text`
  color: ${({ theme }) => theme.success};
  font-size: 11px;
  font-weight: 900;
`

export const ModalOverlay = styled.View`
  flex: 1;
  padding: 24px;
  background-color: rgba(3, 10, 8, 0.78);
  align-items: center;
  justify-content: center;
`

export const ModalCard = styled.View`
  width: 100%;
  max-width: 380px;
  padding: 22px;
  border-radius: 28px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  background-color: ${({ theme }) => theme.card};
`

export const ModalIcon = styled.View`
  width: 66px;
  height: 66px;
  border-radius: 21px;
  background-color: ${({ theme }) => `${theme.primary}18`};
  align-items: center;
  justify-content: center;
  align-self: center;
`

export const ModalEyebrow = styled.Text`
  margin-top: 15px;
  color: ${({ theme }) => theme.primary};
  text-align: center;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
`

export const ModalTitle = styled.Text`
  margin-top: 7px;
  color: ${({ theme }) => theme.text};
  text-align: center;
  font-size: 23px;
  font-weight: 900;
`

export const ModalDescription = styled.Text`
  margin-top: 9px;
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  font-size: 13px;
  line-height: 19px;
`

export const ModalSummary = styled.View`
  margin-top: 18px;
  padding: 14px;
  border-radius: 17px;
  background-color: ${({ theme }) => theme.background};
  gap: 10px;
`

export const SummaryRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

export const SummaryLabel = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
`

export const SummaryValue = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  font-weight: 900;
`

export const ModalActions = styled.View`
  margin-top: 18px;
  flex-direction: row;
  gap: 10px;
`

export const ModalButton = styled.Pressable<{ $primary?: boolean }>`
  flex: 1;
  min-height: 50px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  border-width: ${({ $primary }) => ($primary ? 0 : 1)}px;
  border-color: ${({ theme }) => theme.cardBorder};
  background-color: ${({ $primary, theme }) => ($primary ? theme.primary : theme.background)};
  opacity: ${({ disabled }) => (disabled ? 0.58 : 1)};
`

export const ModalButtonText = styled.Text<{ $primary?: boolean }>`
  color: ${({ $primary, theme }) => ($primary ? theme.background : theme.text)};
  font-size: 13px;
  font-weight: 900;
`
