import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'
import {
  ActionsContainer,
  RetryButton,
  RetryButtonText,
  HomeButton,
  HomeButtonText,
} from '@nexo/components/Quiz/Result/QuizResult.styled'

type Props = {
  canRetake: boolean
  retryLabel: string
  onRetry: () => void
  onHome: () => void
}

export function ResultActions({ canRetake, retryLabel, onRetry, onHome }: Props) {
  return (
    <ActionsContainer>
      {canRetake && (
        <RetryButton onPress={onRetry}>
          <Ionicons name="refresh" size={20} color={Theme.primary} />
          <RetryButtonText>{retryLabel}</RetryButtonText>
        </RetryButton>
      )}

      <HomeButton onPress={onHome}>
        <Ionicons name="home" size={20} color={Theme.text} />
        <HomeButtonText>На головну</HomeButtonText>
      </HomeButton>
    </ActionsContainer>
  )
}
