import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'
import {
  Eyebrow,
  Header,
  HeaderCopy,
  HeaderIcon,
  Subtitle,
  Title,
} from '@nexo/components/Achievements.styled'

export function AchievementsHeader() {
  return (
    <Header>
      <HeaderCopy>
        <Eyebrow>ВАШ ПРОГРЕС</Eyebrow>
        <Title>Achievements</Title>
        <Subtitle>
          Тепер кожна ачивка має кілька етапів, а нагороди можна забирати прямо з картки.
        </Subtitle>
      </HeaderCopy>

      <HeaderIcon>
        <Ionicons name="medal-outline" size={28} color={Theme.primary} />
      </HeaderIcon>
    </Header>
  )
}
