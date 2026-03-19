import styled from 'styled-components/native'
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Theme } from '@nexo/constants/theme'

export const Container = styled(LinearGradient)<LinearGradientProps>`
  flex: 1;
`

export const SafeArea = styled(SafeAreaView).attrs({
  edges: ['top'],
})`
  flex: 1;
`

export const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 100,
    alignItems: 'center',
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`

export const TimeBanner = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${Theme.error};
  border-radius: 12px;
  padding-vertical: 10px;
  padding-horizontal: 16px;
  margin-bottom: 12px;
  column-gap: 8px;
  width: 100%;
`

export const TimeBannerText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 1;
`

export const AttemptBanner = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(255, 193, 7, 0.15);
  border-radius: 12px;
  padding-vertical: 10px;
  padding-horizontal: 16px;
  margin-bottom: 12px;
  column-gap: 8px;
  width: 100%;
  border-width: 1px;
  border-color: ${Theme.warning};
`

export const AttemptBannerText = styled.Text`
  color: ${Theme.text};
  font-size: 14px;
  flex-shrink: 1;
`

export const MasteredBanner = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${Theme.primary};
  border-radius: 12px;
  padding-vertical: 10px;
  padding-horizontal: 16px;
  margin-bottom: 12px;
  column-gap: 8px;
  width: 100%;
`

export const MasteredBannerText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 1;
`

export const IconContainer = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: ${Theme.card};
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  border-width: 2px;
  border-color: ${Theme.primary};
`

export const ResultEmoji = styled.Text`
  font-size: 64px;
`

export const ResultTitle = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${Theme.text};
  margin-bottom: 12px;
  text-align: center;
`

export const ResultMessage = styled.Text`
  font-size: 16px;
  color: ${Theme.textSecondary};
  text-align: center;
  margin-bottom: 32px;
  padding-horizontal: 20px;
`

export const ScoreCard = styled.View`
  width: 100%;
  background-color: ${Theme.card};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  border-width: 1px;
  border-color: ${Theme.card};
  align-items: center;
`

export const ScoreCircle = styled.View`
  width: 140px;
  height: 140px;
  border-radius: 70px;
  background-color: rgba(111, 219, 202, 0.2);
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  border-width: 4px;
  border-color: ${Theme.primary};
`

export const ScorePercentage = styled.Text`
  font-size: 48px;
  font-weight: bold;
  color: ${Theme.primary};
`

export const ScoreLabel = styled.Text`
  font-size: 14px;
  color: ${Theme.textSecondary};
  margin-top: 4px;
`

export const ScoreDetails = styled.View`
  width: 100%;
  row-gap: 12px;
`

export const ScoreDetailItem = styled.View`
  flex-direction: row;
  align-items: center;
  column-gap: 12px;
`

export const ScoreDetailText = styled.Text`
  font-size: 16px;
  color: ${Theme.text};
`

export const RewardsCard = styled.View`
  width: 100%;
  background-color: ${Theme.card};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  border-width: 1px;
  border-color: ${Theme.primary};
`

export const RewardsTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${Theme.text};
  margin-bottom: 16px;
  text-align: center;
`

export const RewardsReducedNote = styled.Text`
  font-size: 13px;
  color: ${Theme.warning};
  text-align: center;
  margin-bottom: 12px;
`

export const RewardsContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
`

export const RewardItem = styled.View`
  align-items: center;
`

export const RewardValue = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${Theme.text};
  margin-top: 8px;
`

export const RewardOriginal = styled.Text`
  font-size: 12px;
  color: ${Theme.textSecondary};
  text-decoration-line: line-through;
`

export const RewardLabel = styled.Text`
  font-size: 14px;
  color: ${Theme.textSecondary};
  margin-top: 4px;
`

export const ActionsContainer = styled.View`
  width: 100%;
  row-gap: 12px;
`

export const RetryButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${Theme.warning};
  border-radius: 12px;
  padding-vertical: 16px;
  column-gap: 8px;
`

export const RetryButtonText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${Theme.primary};
`

export const HomeButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${Theme.card};
  border-radius: 12px;
  padding-vertical: 16px;
  column-gap: 8px;
  border-width: 1px;
  border-color: ${Theme.card};
`

export const HomeButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${Theme.text};
`
