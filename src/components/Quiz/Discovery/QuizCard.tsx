import React from 'react'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Motion } from '@nexo/constants/motion'
import { NexonsIcon } from '@nexo/components/Currency/NexonsIcon'
import { QuizTypeIcon } from '@nexo/components/Quiz/QuizTypeIcon'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import type { Quiz } from '@nexo/types/quiz.types'
import { formatQuizDurationShort, getQuizDurationSeconds } from '@nexo/utils/quiz-time'
import {
  QuizCard as StyledQuizCard,
  QuizLead,
  QuizIconFrame,
  QuizMain,
  QuizTypeLabel,
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

const quizTypeLabels: Record<Quiz['type'], string> = {
  trial: 'TRIAL',
  spark: 'SPARK',
}

type Props = {
  quiz: Quiz
  onPress?: (quizId: string) => void
}

export const QuizCard = React.memo(function QuizCard({ quiz, onPress }: Props) {
  const theme = useAppTheme()
  const durationSeconds = getQuizDurationSeconds(quiz)
  const pressProgress = useSharedValue(1)

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    width: '100%',
    transform: [{ scale: pressProgress.value }],
  }))

  const handlePressIn = () => {
    pressProgress.value = withSpring(0.975, Motion.spring)
  }

  const handlePressOut = () => {
    pressProgress.value = withSpring(1, Motion.spring)
  }

  const handlePress = () => {
    void Haptics.selectionAsync()
    onPress?.(quiz.id)
  }

  return (
    <Animated.View style={cardAnimatedStyle}>
      <StyledQuizCard
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        <QuizLead>
          <QuizIconFrame type={quiz.type}>
            <QuizTypeIcon type={quiz.type} size={67} />
          </QuizIconFrame>
          <QuizMain>
            <QuizTypeLabel type={quiz.type}>{quizTypeLabels[quiz.type]}</QuizTypeLabel>
            <QuizTitle numberOfLines={2}>{quiz.title}</QuizTitle>
            <QuizCategory numberOfLines={2}>{quiz.description}</QuizCategory>
          </QuizMain>
        </QuizLead>

        <QuizStats>
          <StatItem>
            <Ionicons name="help-circle-outline" size={16} color={theme.textSecondary} />
            <StatText>{quiz.questionsCount} питань</StatText>
          </StatItem>
          <StatItem>
            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
            <StatText>{formatQuizDurationShort(durationSeconds)}</StatText>
          </StatItem>
        </QuizStats>

        <QuizFooter>
          <Rewards>
            <RewardItem>
              <NexonsIcon size={23} />
              <RewardText>+{quiz.reward}</RewardText>
            </RewardItem>
            <RewardItem>
              <Ionicons name="star-outline" size={16} color={theme.warning} />
              <RewardText>+{quiz.exp ?? 0}</RewardText>
            </RewardItem>
          </Rewards>
          <PlayButton>
            <Ionicons name="play" size={20} color={theme.background} />
          </PlayButton>
        </QuizFooter>
      </StyledQuizCard>
    </Animated.View>
  )
})
