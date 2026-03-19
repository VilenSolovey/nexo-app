import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'
import {
  ScoreCard,
  ScoreCircle,
  ScorePercentage,
  ScoreLabel,
  ScoreDetails,
  ScoreDetailItem,
  ScoreDetailText,
} from '@nexo/components/Quiz/Result/QuizResult.styled'

type Props = {
  percentage: number
  correctCount: number
  totalCount: number
}

export function ScoreSummaryCard({ percentage, correctCount, totalCount }: Props) {
  return (
    <ScoreCard>
      <ScoreCircle>
        <ScorePercentage>{percentage}%</ScorePercentage>
        <ScoreLabel>Правильних</ScoreLabel>
      </ScoreCircle>

      <ScoreDetails>
        <ScoreDetailItem>
          <Ionicons name="checkmark-circle" size={24} color={Theme.success} />
          <ScoreDetailText>{correctCount} правильних</ScoreDetailText>
        </ScoreDetailItem>
        <ScoreDetailItem>
          <Ionicons name="close-circle" size={24} color={Theme.error} />
          <ScoreDetailText>{totalCount - correctCount} помилок</ScoreDetailText>
        </ScoreDetailItem>
        <ScoreDetailItem>
          <Ionicons name="help-circle" size={24} color={Theme.textSecondary} />
          <ScoreDetailText>{totalCount} всього</ScoreDetailText>
        </ScoreDetailItem>
      </ScoreDetails>
    </ScoreCard>
  )
}
