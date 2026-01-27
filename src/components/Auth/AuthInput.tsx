import styled from 'styled-components/native'
import { Theme } from '@nexo/constants/theme'


const Container = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${Theme.card};
  border-radius: 16px;
  padding: 0 16px;
  margin-bottom: 16px;
`

const Input = styled.TextInput`
  flex: 1;
  height: 56px;
  color: ${Theme.text};
  font-size: 16px;
`

export function AuthInput({ ...props }) {
  return (
    <Container>
      <Input
        placeholderTextColor={Theme.textSecondary + '80'}
        {...props}
      />
    </Container>
  )
}