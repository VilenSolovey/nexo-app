import { Appearance } from "react-native"
import styled from "styled-components/native"
import { Colors } from "@nexo/constants/theme"

const colorScheme = Appearance.getColorScheme()
const theme = Colors[colorScheme ?? "light"]

export const StreakBanner = styled.View`
  width: 90%;
  padding: 14px 16px;
  border-radius: 14px;
  margin-top: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(235, 167, 110, 0.22);
  border-width: 1px;
  border-color: rgba(235, 167, 110, 0.45);
  shadow-color: #000;
  shadow-opacity: 0.06;
  shadow-radius: 10px;
  shadow-offset: 0px 4px;
  elevation: 2;
`;

export const StreakLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const StreakEmblem = styled.View`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  align-items: center;
  justify-content: center;
  background-color: rgba(235, 167, 110, 0.25);
  border-width: 1px;
  border-color: rgba(235, 167, 110, 0.40);
`;

export const StreakEmoji = styled.Text`
  font-size: 18px;
`;

export const StreakText = styled.Text`
  margin-left: 10px;
  font-weight: 800;
  color: ${theme.text};
`;

export const StreakSubText = styled.Text`
  margin-left: 10px;
  color: ${theme.textSecondary};
  font-size: 12px;
`;

export const StreakProgress = styled.View`
  height: 6px;
  border-radius: 999px;
  background-color: ${theme.card};
  margin-top: 8px;
  overflow: hidden;
`;

export const StreakProgressFill = styled.View<{ $variant?: 'neutral' | 'warm' | 'celebrate' }>`
  height: 100%;
  background-color: ${({ $variant }) =>
    $variant === 'celebrate' ? theme.primary : $variant === 'warm' ? theme.warning : theme.textSecondary};
`;

export const StreakHintPill = styled.View`
  padding: 6px 10px;
  border-radius: 999px;
  background-color: ${theme.card};
  border-width: 1px;
  border-color: rgba(235, 167, 110, 0.35);
`;

export const StreakHintText = styled.Text`
  font-weight: 700;
  color: ${theme.text};
  font-size: 12px;
`;

export const StreakCTA = styled.TouchableOpacity`
  padding: 8px 14px;
  border-radius: 999px;
  background-color: #fff;
  border-width: 1px;
  border-color: rgba(245, 165, 36, 0.35);
`;

export const StreakCTAText = styled.Text`
  font-weight: 700;
  color: #8a5a00;
`;


