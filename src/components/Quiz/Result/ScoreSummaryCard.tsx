import React, { useEffect, useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
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
  const theme = useAppTheme()
  const [displayedPercentage, setDisplayedPercentage] = useState(0)
  const normalized = useMemo(() => {
    const safeTotal = Math.max(0, totalCount)
    const safeCorrect = Math.min(Math.max(0, correctCount), safeTotal)
    const safePercentage = Math.min(Math.max(0, percentage), 100)

    return {
      percentage: safePercentage,
      correctCount: safeCorrect,
      mistakesCount: Math.max(0, safeTotal - safeCorrect),
      totalCount: safeTotal,
    }
  }, [correctCount, percentage, totalCount])

  useEffect(() => {
    setDisplayedPercentage(0)

    const duration = 950
    const startedAt = Date.now()
    let animationFrame = 0

    const tick = () => {
      const elapsed = Date.now() - startedAt
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setDisplayedPercentage(Math.round(normalized.percentage * easedProgress))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick)
      }
    }

    animationFrame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(animationFrame)
  }, [normalized.percentage])

  return (
    <ScoreCard>
      <ScoreCircle>
        <ScorePercentage>{displayedPercentage}%</ScorePercentage>
        <ScoreLabel>Правильних</ScoreLabel>
      </ScoreCircle>

      <ScoreDetails>
        <ScoreDetailItem>
          <Ionicons name="checkmark-circle" size={24} color={theme.success} />
          <ScoreDetailText>{normalized.correctCount} правильних</ScoreDetailText>
        </ScoreDetailItem>
        <ScoreDetailItem>
          <Ionicons name="close-circle" size={24} color={theme.error} />
          <ScoreDetailText>{normalized.mistakesCount} помилок</ScoreDetailText>
        </ScoreDetailItem>
        <ScoreDetailItem>
          <Ionicons name="help-circle" size={24} color={theme.textSecondary} />
          <ScoreDetailText>{normalized.totalCount} всього</ScoreDetailText>
        </ScoreDetailItem>
      </ScoreDetails>
    </ScoreCard>
  )
}
