import React from 'react'
import { SearchContainer, SearchIcon, SearchInput } from '@nexo/components/Quiz/Quiz.styled'

type Props = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function QuizSearchBar({ value, onChangeText, placeholder = 'Пошук вікторин...' }: Props) {
  return (
    <SearchContainer>
      <SearchIcon />
      <SearchInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </SearchContainer>
  )
}
