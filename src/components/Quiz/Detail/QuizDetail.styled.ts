import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`

export const SafeArea = styled.SafeAreaView`
  flex: 1;
`

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 20px;
  padding-vertical: 16px;
`

export const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.card};
  justify-content: center;
  align-items: center;
`

export const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`

export const HeaderPlaceholder = styled.View`
  width: 40px;
`

export const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 20,
    paddingBottom: 120,
  },
  showsVerticalScrollIndicator: false,
})``

export const QuizCardContainer = styled.View`
  background-color: ${({ theme }) => theme.card};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.card};
`

export const QuizHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 16px;
`

export const QuizBadge = styled.View<{ type: 'trial' | 'spark' }>`
  padding-horizontal: 12px;
  padding-vertical: 6px;
  border-radius: 8px;
  background-color: ${({ type }) =>
    type === 'trial'
      ? 'rgba(111, 219, 202, 0.2)'
      : 'rgba(255, 107, 53, 0.2)'};
`

export const QuizBadgeText = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 12px;
  font-weight: bold;
`

export const DifficultyContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  padding-horizontal: 12px;
  padding-vertical: 6px;
  border-radius: 8px;
`
export const DifficultyText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 12px;
  font-weight: 600;
  margin-left: 4px;
  text-transform: capitalize;
`


export const QuizTitle = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-bottom: 8px;
`

export const QuizCategory = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 24px;
`

export const StatsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`

export const StatBox = styled.View`
  align-items: center;
  flex: 1;
`

export const StatValue = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-top: 8px;
`

export const StatLabel = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 4px;
`

export const Section = styled.View`
  margin-bottom: 24px;
`

export const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-bottom: 16px;
`

export const QuestionTypesContainer = styled.View`
  gap: 12px;
`

export const TypeChip = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.card};
  padding-horizontal: 16px;
  padding-vertical: 12px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const TypeText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  margin-left: 8px;
`

export const TipsContainer = styled.View`
  background-color: ${({ theme }) => theme.card};
  border-radius: 12px;
  padding: 16px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const TipItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`

export const TipText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
  margin-left: 12px;
  flex: 1;
`

export const BottomContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: ${({ theme }) => theme.background};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.cardBorder};
`

export const StartButton = styled.View`
  border-radius: 16px;
  overflow: hidden;
`

export const StartButtonGradient = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-vertical: 18px;
  gap: 8px;
`

export const StartButtonText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
`
export const ErrorText = styled.Text`
  font-size: 18px;
  color: ${({ theme }) => theme.error};
  text-align: center;
  margin-top: 40px;
`
export const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.8);
  justify-content: center;
  align-items: center;
  padding: 20px;
`

export const ModalContent = styled.View`
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  overflow: hidden;
`

export const ModalGradient = styled(LinearGradient  )`
  padding: 24px;
`
export const ModalIconContainer = styled.View`
  align-self: center;
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: rgba(111, 219, 202, 0.2);
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`

export const ModalTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 8px;
`

export const ModalSubtitle = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  margin-bottom: 24px;
`

export const RewardsPreview = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
`

export const RewardPreviewItem = styled.View`
  align-items: center;
  flex: 1;
`

export const RewardLabel = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 8px;
`

export const RewardValue = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`

export const RewardText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`

export const RewardTextSuccess = styled(RewardText)`
  color: ${({ theme }) => theme.success};
`

export const ModalInfo = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 20px;
  margin-bottom: 24px;
`

export const ModalInfoText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
`

export const ModalActions = styled.View`
  gap: 12px;
`

export const ModalButtonPrimary = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.primary};
  border-radius: 12px;
  padding-vertical: 16px;
  align-items: center;
`

export const ModalButtonPrimaryText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.card};
`

export const ModalButtonSecondary = styled.TouchableOpacity`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding-vertical: 16px;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const ModalButtonSecondaryText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`