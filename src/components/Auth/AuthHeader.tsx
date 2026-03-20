import styled from 'styled-components/native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'

const Header = styled.View`
  align-items: center;
  margin-bottom: 48px;
`

const LogoContainer = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: ${({ theme }) => theme.card};
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.primary};
`

const Title = styled.Text`
  font-size: 48px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-bottom: 8px;
`

const Subtitle = styled.Text`
  font-size: 18px;
  color: ${({ theme }) => theme.textSecondary};
`

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const Theme = useAppTheme()
  return (
    <Header>
      <LogoContainer>
        <Ionicons name="bulb" size={80} color={Theme.iconActive} />
      </LogoContainer>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </Header>
  )
}