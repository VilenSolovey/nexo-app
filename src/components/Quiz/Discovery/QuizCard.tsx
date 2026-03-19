import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'
import { Quiz } from '@nexo/types/quiz.types'
import { formatQuizDurationShort, getQuizDurationSeconds } from '@nexo/utils/quiz-time'
import {
  QuizCard as StyledQuizCard,
  QuizHeader,
  QuizBadge,
  QuizBadgeText,
  DifficultyBadge,
  DifficultyText,
  QuizTitle,
  QuizCategory,
  QuizStats,
  StatItem,
  StatText,
  QuizFooter,
  Rewards,
  RewardItem,
  RewardText,
  PlayButton,
} from '@nexo/components/Quiz/Discovery/Quiz.styled'

type Props = {
  quiz: Quiz
  onPress?: (quizId: string) => void
}

export function QuizCard({ quiz, onPress }: Props) {
  const durationSeconds = getQuizDurationSeconds(quiz)

  return (
    <StyledQuizCard onPress={() => onPress?.(quiz.id)}>
      <QuizHeader>
        <QuizBadge type={quiz.type}>
          <QuizBadgeText>{quiz.type.toUpperCase()}</QuizBadgeText>
        </QuizBadge>
        <DifficultyBadge>
          <DifficultyText>{quiz.category}</DifficultyText>
        </DifficultyBadge>
      </QuizHeader>

      <QuizTitle>{quiz.title}</QuizTitle>
      <QuizCategory>{quiz.description}</QuizCategory>

      <QuizStats>
        <StatItem>
          <Ionicons name="help-circle-outline" size={16} color={Theme.textSecondary} />
          <StatText>{quiz.questionsCount} питань</StatText>
        </StatItem>
        <StatItem>
          <Ionicons name="time-outline" size={16} color={Theme.textSecondary} />
          <StatText>{formatQuizDurationShort(durationSeconds)}</StatText>
        </StatItem>
      </QuizStats>

      <QuizFooter>
        <Rewards>
          <RewardItem>
            <Ionicons name="cash-outline" size={16} color={Theme.primary} />
            <RewardText>+{quiz.reward}</RewardText>
          </RewardItem>
          <RewardItem>
            <Ionicons name="star-outline" size={16} color={Theme.warning} />
            <RewardText>+{quiz.exp}</RewardText>
          </RewardItem>
        </Rewards>
        <PlayButton>
          <Ionicons name="play" size={20} color={Theme.background} />
        </PlayButton>
      </QuizFooter>
    </StyledQuizCard>
  )
}
