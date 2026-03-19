import React from 'react'
import {
  IconContainer,
  ResultEmoji,
  ResultTitle,
  ResultMessage,
} from '@nexo/components/Quiz/Result/QuizResult.styled'

type Props = {
  emoji: string
  title: string
  message: string
}

export function ResultHero({ emoji, title, message }: Props) {
  return (
    <>
      <IconContainer>
        <ResultEmoji>{emoji}</ResultEmoji>
      </IconContainer>

      <ResultTitle>{title}</ResultTitle>
      <ResultMessage>{message}</ResultMessage>
    </>
  )
}
