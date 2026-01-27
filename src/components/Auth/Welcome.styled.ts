import { SafeAreaView as SafeArea } from "react-native-safe-area-context"
import { Theme } from "@nexo/constants/theme"
import styled from "styled-components/native"


export const WelcomeContainer = styled(SafeArea).attrs({
  edges: ["top", "right", "left", "bottom"],
})`
  flex: 1;
  background-color: ${Theme.background};
  align-items: center;
  padding: 16px;
  justify-content: center;
`
export const WelcomeTitle = styled.Text`
  font-size: 22px;
  font-weight: 700;
  color: ${Theme.text};
  font-weight: 600;
  margin-bottom: 12px;
`;
