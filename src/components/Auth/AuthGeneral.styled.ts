import { Ionicons } from "@expo/vector-icons"
import { styled } from "styled-components/native"

export const AuthForm = styled.View`
  width: 100%;
`

export const AuthInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.card};
  border-radius: 16px;
  margin-bottom: 16px;
  padding-horizontal: 16px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const AuthInputIcon = styled(Ionicons)`
  margin-right: 12px;
`

export const AuthInput = styled.TextInput`
  flex: 1;
  height: 56px;
  color: ${({ theme }) => theme.text};
  font-size: 16px;
`

export const AuthButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${({ theme }) => theme.primary};
  border-radius: 16px;
  height: 56px;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`

export const AuthButtonText = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 18px;
  font-weight: bold;
`