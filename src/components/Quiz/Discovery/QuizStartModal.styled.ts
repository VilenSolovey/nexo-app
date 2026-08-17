import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient'
import { styled } from 'styled-components/native'

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

export const ModalGradient = styled(LinearGradient)<LinearGradientProps>`
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

export const CountdownOverlay = styled.View`
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  min-height: 72px;
`

export const CountdownText = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 54px;
  font-weight: 900;
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
  overflow: hidden;
  position: relative;
`

export const ModalButtonProgressFill = styled.View`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.accentAlt};
  opacity: 0.46;
`

export const ModalButtonContent = styled.View`
  position: relative;
  z-index: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
