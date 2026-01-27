import styled from 'styled-components/native'
import { Theme } from '@nexo/constants/theme'
import Ionicons from '@expo/vector-icons/Ionicons'

const Header = styled.View`
  align-items: center;
  margin-bottom: 48px;
`

const LogoContainer = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: ${Theme.card};
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  border-width: 2px;
  border-color: ${Theme.primary};
`

const Title = styled.Text`
  font-size: 48px;
  font-weight: bold;
  color: ${Theme.text};
  margin-bottom: 8px;
`

const Subtitle = styled.Text`
  font-size: 18px;
  color: ${Theme.textSecondary};
`

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
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