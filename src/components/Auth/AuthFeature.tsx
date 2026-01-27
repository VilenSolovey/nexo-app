import styled from 'styled-components/native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Theme } from '@nexo/constants/theme'

type Props = {
  icon: keyof typeof Ionicons.glyphMap
  text: string
}

export function AuthFeature({ icon, text }: Props) {
  return (
    <Row>
      <Ionicons name={icon} size={22} color={Theme.icon} />
      <Label>{text}</Label>
    </Row>
  )
}

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`

const Label = styled.Text`
  font-size: 15px;
  color: ${Theme.textSecondary};
`