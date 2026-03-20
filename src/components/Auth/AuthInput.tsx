import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import styled from 'styled-components/native'


const Container = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.card};
  border-radius: 16px;
  padding: 0 16px;
  margin-bottom: 16px;
`

const Input = styled.TextInput`
  flex: 1;
  height: 56px;
  color: ${({ theme }) => theme.text};
  font-size: 16px;
`

export function AuthInput({ ...props }) {
  const Theme = useAppTheme()
  return (
    <Container>
      <Input
        placeholderTextColor={Theme.textSecondary + '80'}
        {...props}
      />
    </Container>
  )
}