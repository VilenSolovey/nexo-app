import { Appearance } from "react-native"
import { SafeAreaView as SafeArea } from "react-native-safe-area-context"
import { Colors } from "@nexo/constants/theme"
import styled from "styled-components/native"

const colorScheme = Appearance.getColorScheme()
const theme = Colors[colorScheme ?? "light"]

export const HomeContainer = styled(SafeArea).attrs({
  edges: ["top", "right", "left", "bottom"],
})`
  flex: 1;
  background-color: ${theme.background};
  align-items: center;
  padding: 16px;
`

export const UserContainer = styled.View`
  gap: 10px;
  align-items: center;
  flex-direction: column;
  padding: 16px;
`

export const HeaderRow = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

export const HomeTitle = styled.Text`
  font-size: 18px;
  color: ${theme.text};
  font-weight: 600;

`

export const QuizCard = styled.View`
  background-color: ${theme.card};
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 10px;
`

export const Banner = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${theme.primary};
  padding: 16px;
  border-radius: 16px;
`;

export const BannerTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
`;

export const BannerSubtitle = styled.Text`
  font-size: 14px;
  margin-top: 6px;
  color: #fff;
`;

export const StatusPill = styled.View`
  padding: 6px 10px;
  border-radius: 999px;
`;

export const Paragraph = styled.Text`
  font-size: 13px;
  color: ${theme.textSecondary};
`
