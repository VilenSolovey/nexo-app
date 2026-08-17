import { LinearGradient, type LinearGradientProps } from "expo-linear-gradient"
import Animated from "react-native-reanimated"
import { styled } from "styled-components/native"

export const FocusCard = styled(LinearGradient)<LinearGradientProps>`
  width: 95%;
  min-height: 206px;
  margin-top: 8px;
  padding: 20px;
  border-radius: 24px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }) => theme.primary}33;
  shadow-color: ${({ theme }) => theme.primary};
  shadow-opacity: 0.16;
  shadow-radius: 24px;
  shadow-offset: 0px 14px;
  elevation: 7;
`

export const FocusGlow = styled.View`
  position: absolute;
  right: -38px;
  top: -32px;
  width: 150px;
  height: 150px;
  border-radius: 75px;
  background-color: ${({ theme }) => theme.primary}24;
`

export const FocusShimmer = styled(Animated.View)`
  position: absolute;
  top: -48px;
  bottom: -48px;
  width: 58px;
  background-color: rgba(255, 255, 255, 0.08);
`

export const FocusHeroIcon = styled(Animated.View)`
  position: absolute;
  right: 18px;
  top: 54px;
  opacity: 0.18;
`

export const FocusTopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

export const FocusEyebrow = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
`

export const FocusPill = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  padding: 7px 10px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.08);
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.12);
`

export const FocusPillText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 11px;
  font-weight: 800;
`

export const FocusTitle = styled.Text`
  margin-top: 18px;
  color: ${({ theme }) => theme.text};
  font-size: 27px;
  line-height: 33px;
  font-weight: 900;
  max-width: 82%;
`

export const FocusSubtitle = styled.Text`
  margin-top: 8px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  line-height: 18px;
`

export const FocusMetaRow = styled.View`
  margin-top: 16px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

export const FocusMetaPill = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  padding: 7px 10px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.07);
`

export const FocusMetaText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 11px;
  font-weight: 700;
`

export const FocusBottomRow = styled.View`
  margin-top: 18px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const FocusHint = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.textTertiary};
  font-size: 11px;
  line-height: 15px;
`

export const FocusButton = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 14px;
  background-color: ${({ theme }) => theme.primary};
`

export const FocusButtonText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 13px;
  font-weight: 900;
`
