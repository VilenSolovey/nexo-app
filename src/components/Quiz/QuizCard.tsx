import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'
import { Quiz } from '@nexo/types/quiz.types'
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
} from '@nexo/components/Quiz/Quiz.styled'

type Props = {
  quiz: Quiz
  onPress?: (quizId: string) => void
}

export function QuizCard({ quiz, onPress }: Props) {
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
      <QuizCategory>{quiz.category}</QuizCategory>

      <QuizStats>
        <StatItem>
          <Ionicons name="help-circle-outline" size={16} color={Theme.textSecondary} />
          <StatText>{quiz.questionsCount} питань</StatText>
        </StatItem>
        <StatItem>
          <Ionicons name="time-outline" size={16} color={Theme.textSecondary} />
          <StatText>{quiz.questionsCount * 30}с</StatText>
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
            <RewardText>+0</RewardText>
          </RewardItem>
        </Rewards>
        <PlayButton>
          <Ionicons name="play" size={20} color={Theme.background} />
        </PlayButton>
      </QuizFooter>
    </StyledQuizCard>
  )
}
