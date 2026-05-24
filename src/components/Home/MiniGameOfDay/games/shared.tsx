import React from "react"
import type { MiniGameDefinition } from "@nexo/utils/daily-mini-game"
import {
  ResultCard,
  ResultLabel,
  ResultSubText,
  ResultText,
  RewardValue,
  ScoreCard,
  ScoreCardLabel,
  ScoreCardValue,
  ScoreDivider,
  ScoreRow,
} from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay.styled"

export type MiniGameFinishPayload = {
  summary: string
  won: boolean
  rewardCoins: number
  progressScore: number
  riskScore: number
}

export type ApplyPointParams = {
  playerWon: boolean
  roundSummary: string
  roundDetails?: string | null
}

export type MiniGamePlayProps = {
  game: MiniGameDefinition
  progress: number
  risk: number
  lockedResult: MiniGameFinishPayload | null
  isCompleted: boolean
  roundSummary: string | null
  roundDetails: string | null
  resetKey: number
  onPoint: (params: ApplyPointParams) => Promise<void>
  onComplete: (result: MiniGameFinishPayload) => Promise<void>
  setScore: (progress: number, risk: number) => void
  setRoundFeedback: (summary: string | null, details?: string | null) => void
  clearRoundFeedback: () => void
}

export function pickRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export function MiniGameScore({
  game,
  progress,
  risk,
  lockedResult,
}: {
  game: MiniGameDefinition
  progress: number
  risk: number
  lockedResult: MiniGameFinishPayload | null
}) {
  return (
    <ScoreRow>
      <ScoreCard>
        <ScoreCardLabel>{game.scoreLabels.progressLabel}</ScoreCardLabel>
        <ScoreCardValue>{lockedResult?.progressScore ?? progress}</ScoreCardValue>
      </ScoreCard>

      <ScoreDivider>{game.scoreLabels.dividerLabel}</ScoreDivider>

      <ScoreCard>
        <ScoreCardLabel>{game.scoreLabels.riskLabel}</ScoreCardLabel>
        <ScoreCardValue>{lockedResult?.riskScore ?? risk}</ScoreCardValue>
      </ScoreCard>
    </ScoreRow>
  )
}

export function MiniGameRoundResult({
  accent,
  completedLabel = "ФІНАЛ ЧЕЛЕНДЖУ",
  activeLabel,
  isCompleted,
  lockedResult,
  roundSummary,
  roundDetails,
}: {
  accent: string
  completedLabel?: string
  activeLabel: string
  isCompleted: boolean
  lockedResult: MiniGameFinishPayload | null
  roundSummary: string | null
  roundDetails: string | null
}) {
  if (!roundSummary && !lockedResult) {
    return null
  }

  return (
    <ResultCard $accent={accent}>
      <ResultLabel>{isCompleted ? completedLabel : activeLabel}</ResultLabel>
      <ResultText>{roundSummary ?? lockedResult?.summary}</ResultText>
      {roundDetails ? <ResultSubText>{roundDetails}</ResultSubText> : null}
      {lockedResult ? <RewardValue>+{lockedResult.rewardCoins} монет</RewardValue> : null}
    </ResultCard>
  )
}
