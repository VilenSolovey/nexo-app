import React from "react"
import {
  StreakBanner,
  StreakCopy,
  StreakEyebrow,
  StreakHeaderRow,
  StreakText,
  StreakSubText,
  StreakEmojiWrap,
  StreakEmoji,
  StreakTrack,
  StreakStep,
  StreakRightPanel,
  StreakValue,
  StreakValueLabel,
  StreakGoalPill,
  StreakGoalText,
} from "@nexo/components/Home/StreakCard/StreakCard.styled"

type Props = {
  streakDays?: number
}

export const StreakCard: React.FC<Props> = ({ streakDays = 0 }) => {
  const weeklyGoal = 7
  const filledSteps = Math.min(streakDays, weeklyGoal)
  const remainingDays = Math.max(weeklyGoal - streakDays, 0)
  const progressSteps = Array.from({ length: weeklyGoal }, (_, index) => index < filledSteps)

  const title =
    streakDays > 0 ? `${streakDays} дн. поспіль` : "Почни streak сьогодні"

  const subtitle =
    streakDays >= weeklyGoal
      ? "Тримай темп і не дай серії обірватися"
      : streakDays > 0
        ? `Ще ${remainingDays} дн. до тижневого streak`
        : "Зайди сьогодні й відкрий перший день"

  const goalLabel =
    streakDays >= weeklyGoal ? "7/7" : `${filledSteps}/7`

  return (
    <StreakBanner>
      <StreakCopy>
        <StreakEyebrow>ЩОДЕННА СЕРІЯ</StreakEyebrow>

        <StreakHeaderRow>
          <StreakEmojiWrap>
            <StreakEmoji>🔥</StreakEmoji>
          </StreakEmojiWrap>

          <StreakText>{title}</StreakText>
        </StreakHeaderRow>

        <StreakSubText>{subtitle}</StreakSubText>

        <StreakTrack>
          {progressSteps.map((isFilled, index) => (
            <StreakStep
              key={index}
              $filled={isFilled}
              $active={index === filledSteps && streakDays < weeklyGoal}
            />
          ))}
        </StreakTrack>
      </StreakCopy>

      <StreakRightPanel>
        <StreakValue>{streakDays}</StreakValue>
        <StreakValueLabel>дні</StreakValueLabel>
        <StreakGoalPill>
          <StreakGoalText>{goalLabel}</StreakGoalText>
        </StreakGoalPill>
      </StreakRightPanel>
    </StreakBanner>
  )
}
