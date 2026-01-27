import { Ionicons } from "@expo/vector-icons"
import { Theme } from "@nexo/constants/theme"
import { styled } from "styled-components/native"

export const AuthForm = styled.View`
  width: 100%;
`

export const AuthInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${Theme.card};
  border-radius: 16px;
  margin-bottom: 16px;
  padding-horizontal: 16px;
  border-width: 1px;
  border-color: ${Theme.cardBorder};
`

export const AuthInputIcon = styled(Ionicons)`
  margin-right: 12px;
`

export const AuthInput = styled.TextInput`
  flex: 1;
  height: 56px;
  color: ${Theme.text};
  font-size: 16px;
`

export const AuthButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${Theme.primary};
  border-radius: 16px;
  height: 56px;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`

export const AuthButtonText = styled.Text`
  color: ${Theme.primary};
  font-size: 18px;
  font-weight: bold;
`