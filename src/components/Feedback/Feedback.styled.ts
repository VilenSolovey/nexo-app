import { Animated } from 'react-native'
import styled from 'styled-components/native'

export const ToastContainer = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2000;
`

export const ToastCard = styled.View<{ $color: string; $borderColor: string }>`
  min-height: 48px;
  margin-horizontal: 16px;
  padding: 10px 10px 10px 14px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ $borderColor }) => $borderColor};
  background-color: ${({ $color }) => $color};
  flex-direction: row;
  align-items: center;
  column-gap: 10px;
  shadow-color: #000;
  shadow-opacity: 0.22;
  shadow-radius: 12px;
  shadow-offset: 0px 8px;
  elevation: 8;
`

export const ToastText = styled.Text`
  flex: 1;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
`

export const ToastCloseButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
`

export const ModalOverlay = styled.Pressable`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.58);
  justify-content: flex-end;
`

export const ModalSheet = styled(Animated.View)<{ $accent: string }>`
  background-color: ${({ theme }) => theme.card};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 20px;
  padding-bottom: 28px;
  border-width: 1px;
  border-color: ${({ $accent }) => `${$accent}66`};
`

export const ModalHandle = styled.View`
  align-self: center;
  width: 44px;
  height: 4px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.cardBorder};
  margin-bottom: 18px;
`

export const ModalIconCircle = styled.View<{ $accent: string }>`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background-color: ${({ $accent }) => `${$accent}24`};
  border-width: 1px;
  border-color: ${({ $accent }) => `${$accent}80`};
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
`

export const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 22px;
  font-weight: 800;
  line-height: 28px;
`

export const ModalMessage = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 15px;
  line-height: 22px;
  margin-top: 8px;
`

export const ModalActions = styled.View`
  margin-top: 22px;
  row-gap: 10px;
`

export const ModalButton = styled.TouchableOpacity<{ $variant: 'primary' | 'secondary'; $accent: string }>`
  min-height: 48px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $variant, $accent, theme }) =>
    $variant === 'primary' ? $accent : theme.cardBorder};
`

export const ModalButtonText = styled.Text<{ $variant: 'primary' | 'secondary' }>`
  color: ${({ $variant, theme }) => ($variant === 'primary' ? theme.background : theme.text)};
  font-size: 15px;
  font-weight: 800;
`
