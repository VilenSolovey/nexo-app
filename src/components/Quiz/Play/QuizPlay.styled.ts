import styled from "styled-components/native"
import Animated from "react-native-reanimated"

export const Container = styled.View`
  flex: 1;
`

export const SafeArea = styled.SafeAreaView`
  flex: 1;
`

export const Content = styled.View`
  flex: 1;
`

export const FinishOverlay = styled(Animated.View)`
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  z-index: 4;
  background-color: rgba(0, 0, 0, 0.5);
`

export const FinishContent = styled(Animated.View)`
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
  color: ${({ theme }) => theme.error};
  text-align: center;
  margin-top: 40px;
`
