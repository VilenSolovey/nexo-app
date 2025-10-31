import React, { useMemo } from "react"
import { View } from "react-native"
import {
  StreakBanner,
  StreakLeft,
  StreakEmblem,
  StreakEmoji,
  StreakText,
  StreakSubText,
  StreakProgress,
  StreakProgressFill,
  StreakHintPill,
  StreakHintText,
} from "@nexo/components/Home/StreakCard/StreakCard.styled"

type Props = {
  streakDays?: number
}

export const StreakCard: React.FC<Props> = ({ streakDays = 0 }) => {
  const weeklyGoal = 7
  const ratio = Math.min(streakDays / weeklyGoal, 1)
  const variant: 'neutral' | 'warm' | 'celebrate' = streakDays >= 7 ? 'celebrate' : streakDays >= 3 ? 'warm' : 'neutral'
  const showFreezeHint = streakDays > 0 && streakDays < 3

  return (
    <StreakBanner>
      <StreakLeft>
        <StreakEmblem>
          <StreakEmoji>🔥</StreakEmoji>
        </StreakEmblem>
        <View>
          <StreakText>{streakDays}-денний стрік</StreakText>
          <StreakSubText>Не перерви стрік пройди вікторину сьогодні</StreakSubText>
          <StreakProgress>
            <StreakProgressFill style={{ width: `${ratio * 100}%` }} $variant={variant} />
          </StreakProgress>
        </View>
      </StreakLeft>
      {showFreezeHint ? (
        <StreakHintPill>
          <StreakHintText>Використай заморозку, щоб зберегти стрік</StreakHintText>
        </StreakHintPill>
      ) : null}
    </StreakBanner>
  )
}
