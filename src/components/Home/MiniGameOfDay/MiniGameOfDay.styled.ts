import styled from "styled-components/native"

export const FloatingWrap = styled.View<{ $bottomOffset: number }>`
  position: absolute;
  right: 16px;
  bottom: ${({ $bottomOffset }) => `${$bottomOffset}px`};
  left: 16px;
  z-index: 50;
`

export const FloatingButton = styled.View`
  overflow: hidden;
  border-radius: 24px;
  padding: 16px;
  background-color: rgba(12, 20, 18, 0.94);
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  shadow-color: #000;
  shadow-opacity: 0.24;
  shadow-radius: 14px;
  shadow-offset: 0px 10px;
  elevation: 9;
`

export const FloatingButtonAccent = styled.View<{ $accent: string }>`
  position: absolute;
  top: -18px;
  right: -12px;
  width: 86px;
  height: 86px;
  border-radius: 43px;
  background-color: ${({ $accent }) => `${$accent}33`};
`

export const FloatingButtonHeader = styled.View`
  flex-direction: row;
  align-items: center;
`

export const FloatingButtonEmoji = styled.Text`
  font-size: 30px;
`

export const FloatingButtonCopy = styled.View`
  flex: 1;
  margin-left: 12px;
  margin-right: 10px;
`

export const FloatingButtonTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 800;
`

export const FloatingButtonSubtitle = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  line-height: 17px;
`

export const FloatingButtonStatus = styled.View`
  margin-top: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const FloatingButtonReward = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 13px;
  font-weight: 800;
`

export const DebugResetButton = styled.Pressable`
  margin-top: 10px;
  align-self: flex-end;
  padding: 8px 12px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.08);
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.12);
`

export const DebugResetButtonText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 700;
`

export const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(6, 10, 10, 0.72);
  justify-content: flex-end;
`

export const ModalSheet = styled.View`
  padding: 20px 18px 28px;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  background-color: ${({ theme }) => theme.card};
  border-top-width: 1px;
  border-left-width: 1px;
  border-right-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const Handle = styled.View`
  width: 48px;
  height: 5px;
  border-radius: 999px;
  align-self: center;
  background-color: rgba(255, 255, 255, 0.18);
`

export const ModalHeader = styled.View`
  margin-top: 18px;
  flex-direction: row;
  align-items: center;
`

export const ModalIconWrap = styled.View<{ $accent: string }>`
  width: 54px;
  height: 54px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $accent }) => `${$accent}22`};
  border-width: 1px;
  border-color: ${({ $accent }) => `${$accent}55`};
`

export const ModalHeaderCopy = styled.View`
  flex: 1;
  margin-left: 14px;
`

export const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 21px;
  font-weight: 800;
`

export const ModalSubtitle = styled.Text`
  margin-top: 4px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 18px;
`

export const GamePanel = styled.View`
  margin-top: 18px;
  padding: 18px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.cardBackground};
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.06);
`

export const GameHint = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 18px;
  text-align: center;
`

export const ScoreRow = styled.View`
  margin-top: 16px;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

export const ScoreCard = styled.View`
  flex: 1;
  min-height: 72px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const ScoreCardLabel = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-weight: 700;
`

export const ScoreCardValue = styled.Text`
  margin-top: 4px;
  color: ${({ theme }) => theme.text};
  font-size: 28px;
  font-weight: 800;
`

export const ScoreDivider = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  font-weight: 700;
`

export const OptionRow = styled.View`
  margin-top: 16px;
  flex-direction: row;
  gap: 10px;
`

export const GameOption = styled.Pressable<{ $active?: boolean; $accent: string }>`
  flex: 1;
  min-height: 88px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $active, $accent, theme }) =>
    $active ? `${$accent}22` : theme.card};
  border-width: 1px;
  border-color: ${({ $active, $accent, theme }) =>
    $active ? `${$accent}88` : theme.cardBorder};
`

export const GameOptionEmoji = styled.Text`
  font-size: 30px;
`

export const GameOptionText = styled.Text<{ $active?: boolean }>`
  margin-top: 8px;
  color: ${({ $active, theme }) => ($active ? theme.text : theme.textSecondary)};
  font-size: 13px;
  font-weight: 700;
`

export const SelectionPreview = styled.View<{ $accent: string }>`
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background-color: ${({ $accent }) => `${$accent}16`};
  border-width: 1px;
  border-color: ${({ $accent }) => `${$accent}35`};
`

export const SelectionPreviewText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  font-weight: 700;
  text-align: center;
`

export const PrimaryAction = styled.Pressable<{ $accent: string; $disabled?: boolean }>`
  margin-top: 16px;
  min-height: 54px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $accent, $disabled }) => ($disabled ? `${$accent}55` : $accent)};
`

export const PrimaryActionText = styled.Text`
  color: #13211d;
  font-size: 15px;
  font-weight: 800;
`

export const ResultCard = styled.View<{ $accent: string }>`
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  background-color: ${({ $accent }) => `${$accent}18`};
  border-width: 1px;
  border-color: ${({ $accent }) => `${$accent}45`};
`

export const ResultLabel = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
`

export const ResultText = styled.Text`
  margin-top: 8px;
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  text-align: center;
`

export const ResultSubText = styled.Text`
  margin-top: 8px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 18px;
  text-align: center;
`

export const RewardValue = styled.Text`
  margin-top: 10px;
  color: ${({ theme }) => theme.primary};
  font-size: 18px;
  font-weight: 800;
  text-align: center;
`

export const FooterActions = styled.View`
  margin-top: 18px;
  flex-direction: row;
  gap: 12px;
`

export const SecondaryAction = styled.Pressable`
  flex: 1;
  min-height: 52px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  background-color: ${({ theme }) => theme.background};
`

export const SecondaryActionText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  font-weight: 700;
  text-align: center;
`
