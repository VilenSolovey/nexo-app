import React from 'react'
import styled from 'styled-components/native'

type Props = {
  text: string
  action: string
  onPress: () => void
}

const Container = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: center;
  margin-top: 24px;
`

const TextSecondary = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.textSecondary};
`

const TextAction = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
`

export function AuthLink({ text, action, onPress }: Props) {
  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <TextSecondary>{text} </TextSecondary>
      <TextAction>{action}</TextAction>
    </Container>
  )
}

