import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styled } from 'styled-components/native'

export const ScreenGradient = styled(LinearGradient)<LinearGradientProps>`
  flex: 1;
`

export const SafeAreaShell = styled(SafeAreaView)`
  flex: 1;
`

export const Header = styled.View`
  padding: 12px 20px 18px;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`

export const HeaderCopy = styled.View`
  flex: 1;
`

export const HeaderTitle = styled.Text`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
`

export const HeaderSubtitle = styled.Text`
  margin-top: 6px;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.textSecondary};
`

export const BalanceCard = styled.View`
  min-width: 88px;
  padding: 12px 14px;
  border-radius: 18px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  background-color: ${({ theme }) => theme.cardBackground};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

export const BalanceValue = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 800;
`

export const CategoriesScroll = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center',
  },
})`
  flex-grow: 0;
  height: 58px;
  min-height: 58px;
  max-height: 58px;
  margin-bottom: 10px;
`

export const CategoryChip = styled.Pressable<{ $active?: boolean }>`
  width: 112px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ $active, theme }) => ($active ? theme.primary : theme.cardBorder)};
  background-color: ${({ $active, theme }) => ($active ? theme.primary : theme.card)};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

export const CategoryText = styled.Text<{ $active?: boolean }>`
  color: ${({ $active, theme }) => ($active ? theme.background : theme.textSecondary)};
  font-size: 13px;
  font-weight: 700;
`

export const ItemsScroll = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
})``

export const ItemsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
`

export const ItemCard = styled.Pressable<{ $owned?: boolean; $locked?: boolean }>`
  width: 48%;
  min-width: 156px;
  min-height: 220px;
  position: relative;
  padding: 14px;
  border-radius: 22px;
  border-width: 1px;
  border-color: ${({ $owned, theme }) => ($owned ? theme.success : theme.cardBorder)};
  background-color: ${({ theme }) => theme.card};
  opacity: ${({ $locked, $owned }) => ($locked && !$owned ? 0.65 : 1)};
`

export const CornerBadge = styled.View`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
`

export const IconWrap = styled.View`
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background-color: ${({ theme }) => theme.background};
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`

export const ItemTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  font-weight: 800;
  line-height: 20px;
`

export const ItemDescription = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  line-height: 18px;
  margin-top: 8px;
  min-height: 54px;
`

export const ItemEffect = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 11px;
  line-height: 16px;
  margin-top: 8px;
  min-height: 32px;
`

export const CardFooter = styled.View`
  margin-top: auto;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const PriceTag = styled.View`
  padding: 8px 10px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.background};
  flex-direction: row;
  align-items: center;
  gap: 6px;
`

export const PriceText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 12px;
  font-weight: 800;
`

export const CountTag = styled.View`
  padding: 8px 10px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.primary};
`

export const CountText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 12px;
  font-weight: 800;
`

export const OwnedTag = styled.View`
  padding: 8px 12px;
  border-radius: 999px;
  background-color: rgba(74, 222, 128, 0.14);
`

export const OwnedTagText = styled.Text`
  color: ${({ theme }) => theme.success};
  font-size: 12px;
  font-weight: 800;
`

export const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(10, 14, 13, 0.72);
  align-items: center;
  justify-content: center;
  padding: 24px;
`

export const ModalCard = styled.View`
  width: 100%;
  max-width: 360px;
  border-radius: 24px;
  padding: 22px;
  background-color: ${({ theme }) => theme.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const ModalIconWrap = styled.View`
  width: 68px;
  height: 68px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.background};
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  align-self: center;
`

export const ModalTitle = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const ModalItemName = styled.Text`
  margin-top: 8px;
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-size: 22px;
  font-weight: 800;
`

export const ModalDescription = styled.Text`
  margin-top: 10px;
  margin-bottom: 18px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
`

export const ModalInfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.cardBorder};
`

export const ModalInfoLabel = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
`

export const ModalInfoValue = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  font-weight: 800;
`

export const ModalActions = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 22px;
`

export const ModalButton = styled.Pressable<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  min-height: 48px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $variant, theme }) =>
    $variant === 'primary' ? theme.primary : theme.background};
  border-width: ${({ $variant }) => ($variant === 'secondary' ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.cardBorder};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
`

export const ModalButtonText = styled.Text<{ $variant: 'primary' | 'secondary' }>`
  color: ${({ $variant, theme }) => ($variant === 'primary' ? theme.background : theme.text)};
  font-size: 14px;
  font-weight: 800;
`
