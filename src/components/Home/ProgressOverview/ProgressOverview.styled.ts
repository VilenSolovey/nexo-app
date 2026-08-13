import Animated from "react-native-reanimated"
import { styled } from "styled-components/native"

export const OverviewCard = styled.View`
  width: 95%;
  margin-top: 14px;
  padding: 16px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  shadow-color: #000;
  shadow-opacity: 0.12;
  shadow-radius: 20px;
  shadow-offset: 0px 12px;
  elevation: 5;
`

export const OverviewHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`

export const OverviewTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  font-weight: 900;
`

export const OverviewHint = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 11px;
  font-weight: 700;
`

export const StatsRow = styled.View`
  flex-direction: row;
  gap: 10px;
`

export const StatPanel = styled.View<{ $accent?: "exp" | "warning" }>`
  flex: 1;
  min-height: 114px;
  padding: 13px;
  border-radius: 18px;
  background-color: ${({ $accent, theme }) =>
    $accent === "warning" ? `${theme.warning}18` : `${theme.exp}18`};
  border-width: 1px;
  border-color: ${({ $accent, theme }) =>
    $accent === "warning" ? `${theme.warning}36` : `${theme.exp}36`};
`

export const StatTopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

export const StatLabel = styled.Text<{ $accent?: "exp" | "warning" }>`
  color: ${({ $accent, theme }) => ($accent === "warning" ? theme.warning : theme.exp)};
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.8px;
`

export const StatValue = styled.Text`
  margin-top: 11px;
  color: ${({ theme }) => theme.text};
  font-size: 26px;
  font-weight: 900;
`

export const StatSubText = styled.Text`
  margin-top: 4px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 11px;
  line-height: 15px;
`

export const MiniTrack = styled.View`
  width: 100%;
  height: 7px;
  margin-top: 12px;
  border-radius: 999px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.08);
`

export const MiniFill = styled(Animated.View)<{ $accent?: "exp" | "warning" }>`
  height: 100%;
  border-radius: 999px;
  background-color: ${({ $accent, theme }) => ($accent === "warning" ? theme.warning : theme.exp)};
`
