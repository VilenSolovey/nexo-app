import styled from 'styled-components/native'

const Button = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${({ theme }) => theme.primary};
  border-radius: 16px;
  height: 56px;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`

const Label = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.background};
`
type Props = {
  children: string
  onPress: () => void
  disabled?: boolean
}

export function AuthButton({ children, onPress, disabled }: Props) {
  return (
    <Button onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      <Label>{children}</Label>
    </Button>
  )
}