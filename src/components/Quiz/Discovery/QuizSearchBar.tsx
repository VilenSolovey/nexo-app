import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { SearchContainer, SearchInput } from '@nexo/components/Quiz/Discovery/Quiz.styled'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'

type Props = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function QuizSearchBar({ value, onChangeText, placeholder = 'Пошук вікторин...' }: Props) {
  const theme = useAppTheme()

  return (
    <SearchContainer>
      <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
      <SearchInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </SearchContainer>
  )
}
