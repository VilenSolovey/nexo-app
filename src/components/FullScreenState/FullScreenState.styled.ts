import styled from 'styled-components/native'

export const StateContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: ${({ theme }) => theme.background};
`

export const StateIcon = styled.View<{ $variant: 'loading' | 'error' }>`
  width: 72px;
  height: 72px;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  border-width: 1px;
  background-color: ${({ $variant, theme }) =>
    `${$variant === 'loading' ? theme.primary : theme.warning}18`};
  border-color: ${({ $variant, theme }) =>
    `${$variant === 'loading' ? theme.primary : theme.warning}40`};
`

export const StateTitle = styled.Text`
  max-width: 320px;
  margin-top: 18px;
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  font-weight: 800;
  text-align: center;
`

export const StateDescription = styled.Text`
  max-width: 320px;
  margin-top: 8px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  text-align: center;
`

export const StateAction = styled.Pressable`
  min-width: 180px;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  border-radius: 15px;
  background-color: ${({ theme }) => theme.primary};
`

export const StateActionText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 15px;
  font-weight: 900;
`
