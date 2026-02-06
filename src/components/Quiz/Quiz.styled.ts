import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'

export const Header = styled.View`
  padding-horizontal: 20px;
  padding-vertical: 16px;
`

export const HeaderTitle = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${Theme.text};
`

export const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${Theme.background};
  border-radius: 12px;
  margin-horizontal: 20px;
  margin-bottom: 16px;
  padding-horizontal: 16px;
  border-width: 1px;
  border-color: ${Theme.cardBorder};
`

export const SearchIcon = styled(Ionicons).attrs({
  name: 'search',
  size: 20,
  color: Theme.textSecondary,
})`
  margin-right: 8px;
`

export const SearchInput = styled.TextInput.attrs({
  placeholderTextColor: Theme.text,
})`
  flex: 1;
  height: 48px;
  color: ${Theme.text};
  font-size: 16px;
`

export const FilterContainer = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  padding-horizontal: 20px;
  margin-bottom: 16px;
`

export const FilterTab = styled.TouchableOpacity<{ active?: boolean }>`
  padding-horizontal: 20px;
  padding-vertical: 10px;
  border-radius: 20px;
  background-color: ${({ active }) => (active ? Theme.icon : Theme.background)};
  margin-right: 12px;
  border-width: 1px;
  border-color: ${({ active }) => (active ? Theme.icon : Theme.cardBorder)};
`

export const FilterText = styled.Text<{ active?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ active }) => (active ? Theme.primary : Theme.textSecondary)};
`

export const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  showsVerticalScrollIndicator: false,
})``

export const LoadingText = styled.Text`
  color: ${Theme.textSecondary};
  align-self: center;
`

export const QuizCard = styled.TouchableOpacity`
  background-color: ${Theme.background};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  border-width: 1px;
  border-color: ${Theme.cardBorder};
`

export const QuizHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12px;
`

export const QuizBadge = styled.View<{ type: 'trial' | 'spark' }>`
  padding-horizontal: 12px;
  padding-vertical: 4px;
  border-radius: 8px;
  background-color: ${({ type }) =>
    type === 'trial' ? 'rgba(111, 219, 202, 0.2)' : 'rgba(255, 107, 53, 0.2)'};
`

export const QuizBadgeText = styled.Text`
  color: ${Theme.icon};
  font-size: 12px;
  font-weight: bold;
`

export const DifficultyBadge = styled.View`
  padding-horizontal: 12px;
  padding-vertical: 4px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
`

export const DifficultyText = styled.Text`
  color: ${Theme.textSecondary};
  font-size: 12px;
  text-transform: capitalize;
`

export const QuizTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${Theme.text};
  margin-bottom: 4px;
`

export const QuizCategory = styled.Text`
  font-size: 14px;
  color: ${Theme.textSecondary};
  margin-bottom: 16px;
`

export const QuizStats = styled.View`
  flex-direction: row;
  margin-bottom: 16px;
`

export const StatItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
`

export const StatText = styled.Text`
  font-size: 14px;
  color: ${Theme.textSecondary};
  margin-left: 4px;
`

export const QuizFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

export const Rewards = styled.View`
  flex-direction: row;
`

export const RewardItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
`

export const RewardText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${Theme.text};
  margin-left: 4px;
`

export const PlayButton = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${Theme.icon};
  justify-content: center;
  align-items: center;
`
