import React from 'react'
import { QuizType } from '@nexo/types/quiz.types'
import { FilterContainer, FilterTab, FilterText } from './Quiz.styled'

type Props = {
  selectedType: QuizType | 'all'
  onSelectType: (type: QuizType | 'all') => void
}

const FILTER_OPTIONS = [
  { value: 'all' as const, label: 'Всі' },
  { value: 'trial' as const, label: 'Trial' },
  { value: 'spark' as const, label: 'Spark' },
]

export function QuizFilterTabs({ selectedType, onSelectType }: Props) {
  return (
    <FilterContainer>
      {FILTER_OPTIONS.map((option) => (
        <FilterTab
          key={option.value}
          active={selectedType === option.value}
          onPress={() => onSelectType(option.value)}
        >
          <FilterText active={selectedType === option.value}>
            {option.label}
          </FilterText>
        </FilterTab>
      ))}
    </FilterContainer>
  )
}
