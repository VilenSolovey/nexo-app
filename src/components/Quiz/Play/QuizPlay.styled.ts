import styled from "styled-components/native"
import { Theme } from "@nexo/constants/theme"

export const Container = styled.View`
  flex: 1;
`

export const SafeArea = styled.SafeAreaView`
  flex: 1;
`

export const Content = styled.View`
  flex: 1;
`

export const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 20,
    paddingBottom: 120,
  },
  showsVerticalScrollIndicator: false,
})``

export const ErrorText = styled.Text`
  font-size: 18px;
  color: ${Theme.error};
  text-align: center;
  margin-top: 40px;
`