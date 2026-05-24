import React, { useEffect, useState } from "react"
import * as Haptics from "expo-haptics"
import {
  GameHint,
  GamePanel,
  PrimaryAction,
  PrimaryActionText,
  TimingNeedle,
  TimingTarget,
  TimingTick,
  TimingTickRow,
  TimingTrack,
} from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay.styled"
import { MiniGameRoundResult, MiniGameScore, type MiniGamePlayProps } from "./shared"

const TIMING_TARGET_WIDTH = 18
const TIMING_TARGET_SCORE = 3

function buildTimingTargetStart() {
  return 12 + Math.floor(Math.random() * (76 - TIMING_TARGET_WIDTH))
}

export function TimingLockGame({
  game,
  progress,
  risk,
  lockedResult,
  isCompleted,
  roundSummary,
  roundDetails,
  resetKey,
  onPoint,
}: MiniGamePlayProps) {
  const [position, setPosition] = useState(8)
  const [direction, setDirection] = useState(1)
  const [targetStart, setTargetStart] = useState(() => buildTimingTargetStart())

  useEffect(() => {
    setPosition(8)
    setDirection(1)
    setTargetStart(buildTimingTargetStart())
  }, [resetKey])

  useEffect(() => {
    if (isCompleted) {
      return
    }

    const intervalId = setInterval(() => {
      setPosition((current) => {
        let next = current + direction * 3.2

        if (next >= 100) {
          next = 100
          setDirection(-1)
        }

        if (next <= 0) {
          next = 0
          setDirection(1)
        }

        return next
      })
    }, 32)

    return () => clearInterval(intervalId)
  }, [direction, isCompleted])

  const handleStop = async () => {
    if (isCompleted) {
      return
    }

    const targetEnd = targetStart + TIMING_TARGET_WIDTH
    const hit = position >= targetStart && position <= targetEnd
    const distanceFromCenter = Math.abs(position - (targetStart + TIMING_TARGET_WIDTH / 2))
    const precision = Math.max(0, Math.round(100 - distanceFromCenter * 6))

    await Haptics.notificationAsync(
      hit
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    )

    await onPoint({
      playerWon: hit,
      roundSummary: hit ? "Імпульс зловлено" : "Індикатор проскочив повз зону",
      roundDetails: hit
        ? `Точність: ${precision}%`
        : `Ціль була між ${targetStart}% і ${targetEnd}%`,
    })

    setTargetStart(buildTimingTargetStart())
  }

  return (
    <GamePanel>
      <GameHint>Натисни, коли індикатор проходить зелену зону. Перший до {TIMING_TARGET_SCORE} влучань забирає серію.</GameHint>
      <MiniGameScore game={game} progress={progress} risk={risk} lockedResult={lockedResult} />

      <TimingTrack $accent={game.accent}>
        <TimingTarget
          $accent={game.accent}
          $left={targetStart}
          $width={TIMING_TARGET_WIDTH}
        />
        <TimingNeedle $accent={game.accent} $left={position} />
      </TimingTrack>

      <TimingTickRow>
        {Array.from({ length: TIMING_TARGET_SCORE }, (_, index) => (
          <TimingTick key={`player-${index}`} $accent={game.accent} $hit={(lockedResult?.progressScore ?? progress) > index} />
        ))}
      </TimingTickRow>

      {!isCompleted ? (
        <PrimaryAction $accent={game.accent} onPress={handleStop}>
          <PrimaryActionText>Зупинити</PrimaryActionText>
        </PrimaryAction>
      ) : null}

      <MiniGameRoundResult
        accent={game.accent}
        activeLabel="ОСТАННІЙ ІМПУЛЬС"
        isCompleted={isCompleted}
        lockedResult={lockedResult}
        roundSummary={roundSummary}
        roundDetails={roundDetails}
      />
    </GamePanel>
  )
}
