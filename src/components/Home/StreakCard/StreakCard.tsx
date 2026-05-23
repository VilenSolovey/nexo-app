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

const STREAK_MILESTONES = [7, 14, 30, 60, 100, 180, 365]
const STREAK_TRACK_STEPS_COUNT = 7
const EXTENDED_MILESTONE_STEP = 100

const getDayWord = (days: number) => {
  const absDays = Math.abs(days)
  const lastDigit = absDays % 10
  const lastTwoDigits = absDays % 100

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return "день"
  }

  if (
    [2, 3, 4].includes(lastDigit)
    && ![12, 13, 14].includes(lastTwoDigits)
  ) {
    return "дні"
  }

  return "днів"
}

const getNextMilestone = (streakDays: number) =>
  STREAK_MILESTONES.find((milestone) => milestone > streakDays)
  ?? Math.ceil((streakDays + 1) / EXTENDED_MILESTONE_STEP) * EXTENDED_MILESTONE_STEP

const getSubtitle = (
  streakDays: number,
  remainingDays: number,
  nextMilestone: number,
) => {
  if (streakDays === 0) {
    return "Зайди сьогодні й відкрий перший день"
  }

  if (STREAK_MILESTONES.includes(streakDays)) {
    return [
      "Рубіж взято.",
      `Наступний: ${nextMilestone} ${getDayWord(nextMilestone)}.`,
    ].join(" ")
  }

  return [
    `Ще ${remainingDays} ${getDayWord(remainingDays)}`,
    `до рубежу ${nextMilestone} ${getDayWord(nextMilestone)}.`,
  ].join(" ")
}

export const StreakCard: React.FC<Props> = ({ streakDays = 0 }) => {
  const normalizedStreakDays = Math.max(streakDays, 0)
  const nextMilestone = getNextMilestone(normalizedStreakDays)
  const filledSteps = Math.min(
    Math.floor((normalizedStreakDays / nextMilestone) * STREAK_TRACK_STEPS_COUNT),
    STREAK_TRACK_STEPS_COUNT,
  )
  const remainingDays = Math.max(nextMilestone - normalizedStreakDays, 0)
  const progressSteps = Array.from(
    { length: STREAK_TRACK_STEPS_COUNT },
    (_, index) => index < filledSteps,
  )
  const title =
    normalizedStreakDays > 0
      ? `${normalizedStreakDays} ${getDayWord(normalizedStreakDays)} поспіль`
      : "Почни серію сьогодні"

  const subtitle = getSubtitle(
    normalizedStreakDays,
    remainingDays,
    nextMilestone,
  )
  const goalLabel = `${normalizedStreakDays}/${nextMilestone}`
  const activeStepIndex =
    normalizedStreakDays < nextMilestone ? filledSteps : -1

  return (
    <StreakBanner>
      <StreakCopy>
        <StreakEyebrow>DAILY STREAK</StreakEyebrow>

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
              $active={index === activeStepIndex}
            />
          ))}
        </StreakTrack>
      </StreakCopy>

      <StreakRightPanel>
        <StreakValue>{normalizedStreakDays}</StreakValue>
        <StreakValueLabel>
          {getDayWord(normalizedStreakDays)}
        </StreakValueLabel>
        <StreakGoalPill>
          <StreakGoalText>{goalLabel}</StreakGoalText>
        </StreakGoalPill>
      </StreakRightPanel>
    </StreakBanner>
  )
}
