import { styled } from "styled-components/native"

export const StreakBanner = styled.View`
  width: 95%;
  min-height: 98px;
  padding: 16px;
  border-radius: 16px;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.shopCard};
  border-width: 1px;
  border-color: rgba(235, 167, 110, 0.22);
  margin-top: 12px;
  shadow-color: ${({ theme }) => theme.warning};
  shadow-opacity: 0.13;
  shadow-radius: 18px;
  shadow-offset: 0px 10px;
  elevation: 5;
`

export const StreakCopy = styled.View`
  flex: 1;
  padding-right: 12px;
`

export const StreakEyebrow = styled.Text`
  color: ${({ theme }) => theme.warning};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
`

export const StreakHeaderRow = styled.View`
  margin-top: 8px;
  flex-direction: row;
  align-items: center;
`

export const StreakEmojiWrap = styled.View`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background-color: rgba(235, 167, 110, 0.16);
  border-width: 1px;
  border-color: rgba(235, 167, 110, 0.32);
`

export const StreakEmoji = styled.Text`
  font-size: 18px;
`

export const StreakText = styled.Text`
  margin-left: 10px;
  color: ${({ theme }) => theme.text};
  font-size: 17px;
  font-weight: 800;
`

export const StreakSubText = styled.Text`
  margin-top: 8px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  line-height: 16px;
`

export const StreakTrack = styled.View`
  margin-top: 12px;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`

export const StreakStep = styled.View<{ $filled?: boolean; $active?: boolean }>`
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background-color: ${({ $filled, $active, theme }) =>
    $filled ? theme.warning : $active ? "rgba(235, 167, 110, 0.45)" : "rgba(255, 255, 255, 0.08)"};
  border-width: ${({ $active }) => ($active ? 1 : 0)}px;
  border-color: rgba(235, 167, 110, 0.28);
`

export const StreakRightPanel = styled.View`
  width: 76px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  background-color: rgba(235, 167, 110, 0.12);
  border-width: 1px;
  border-color: rgba(235, 167, 110, 0.26);
  shadow-color: ${({ theme }) => theme.warning};
  shadow-opacity: 0.12;
  shadow-radius: 14px;
  shadow-offset: 0px 8px;
  elevation: 3;
`

export const StreakValue = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  font-weight: 900;
`

export const StreakValueLabel = styled.Text`
  margin-top: 2px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 11px;
  font-weight: 700;
`

export const StreakGoalPill = styled.View`
  margin-top: 10px;
  border-radius: 999px;
  padding: 6px 9px;
  background-color: rgba(30, 43, 37, 0.9);
  border-width: 1px;
  border-color: rgba(235, 167, 110, 0.18);
`

export const StreakGoalText = styled.Text`
  color: ${({ theme }) => theme.warning};
  font-size: 10px;
  font-weight: 800;
`
