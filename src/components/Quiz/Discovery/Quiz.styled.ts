import styled from 'styled-components/native'
import { FlatList } from 'react-native'
import { Entrance } from '@nexo/components/Motion/Entrance'
import type { Quiz } from '@nexo/types/quiz.types'

export const Header = styled.View`
  padding-horizontal: 20px;
  padding-vertical: 16px;
`

export const HeaderTitle = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`

export const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.card};
  border-radius: 12px;
  margin-horizontal: 20px;
  margin-bottom: 16px;
  padding-horizontal: 16px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  shadow-color: ${({ theme }) => theme.primary};
  shadow-opacity: 0.08;
  shadow-radius: 14px;
  shadow-offset: 0px 8px;
  elevation: 3;
`

export const SearchInput = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.text,
}))`
  height: 48px;
  color: ${({ theme }) => theme.text};
  font-size: 16px;
`

export const FilterContainer = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
})`

`

export const FilterTab = styled.TouchableOpacity<{ active?: boolean }>`
  padding-horizontal: 20px;
  padding-vertical: 8px;
  border-radius: 20px;
  background-color: ${({ active, theme }) => (active ? theme.primary : theme.card)};
  margin-right: 12px;
  border-width: 1px;
  border-color: ${({ active, theme }) => (active ? theme.primary : theme.cardBorder)};
`

export const FilterText = styled.Text<{ active?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ active, theme }) => (active ? theme.background : theme.textSecondary)};
`

export const LoadingText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  align-self: center;
`

export const QuizList = styled(FlatList<Quiz>).attrs({
  contentContainerStyle: {
    flexGrow: 1,
    padding: 20,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`

export const QuizEntrance = styled(Entrance)`
  width: 100%;
  align-items: stretch;
`

export const QuizCard = styled.TouchableOpacity`
  width: 100%;
  align-self: stretch;
  background-color: ${({ theme }) => theme.card};
  border-radius: 22px;
  padding: 17px;
  margin-bottom: 16px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  shadow-color: ${({ theme }) => theme.primary};
  shadow-opacity: 0.11;
  shadow-radius: 18px;
  shadow-offset: 0px 10px;
  elevation: 4;
`

export const QuizLead = styled.View`
  flex-direction: row;
  align-items: center;
  column-gap: 14px;
`

export const QuizIconFrame = styled.View<{ type: 'trial' | 'spark' }>`
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 23px;
  overflow: hidden;
  background-color: ${({ type, theme }) =>
    type === 'trial' ? `${theme.accentAlt}13` : `${theme.primary}13`};
  border-width: 1px;
  border-color: ${({ type, theme }) =>
    type === 'trial' ? `${theme.accentAlt}32` : `${theme.primary}32`};
`

export const QuizMain = styled.View`
  flex: 1;
  min-width: 0px;
`

export const QuizTypeLabel = styled.Text<{ type: 'trial' | 'spark' }>`
  color: ${({ type, theme }) => type === 'trial' ? theme.accentAlt : theme.primary};
  font-size: 10px;
  line-height: 13px;
  font-weight: 900;
  letter-spacing: 1.25px;
  margin-bottom: 5px;
`

export const QuizTitle = styled.Text`
  font-size: 19px;
  line-height: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
`

export const QuizCategory = styled.Text`
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 5px;
`

export const QuizStats = styled.View`
  flex-direction: row;
  margin-top: 16px;
  margin-bottom: 15px;
  column-gap: 9px;
`

export const StatItem = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 10px;
  padding-vertical: 7px;
  border-radius: 11px;
  background-color: ${({ theme }) => `${theme.background}80`};
`

export const StatText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
  margin-left: 4px;
`

export const QuizFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.cardBorder};
`

export const Rewards = styled.View`
  flex-direction: row;
`

export const RewardItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 14px;
`

export const RewardText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-left: 3px;
`

export const PlayButton = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 15px;
  background-color: ${({ theme }) => theme.primary};
  justify-content: center;
  align-items: center;
  shadow-color: ${({ theme }) => theme.primary};
  shadow-opacity: 0.28;
  shadow-radius: 14px;
  shadow-offset: 0px 8px;
  elevation: 5;
`
