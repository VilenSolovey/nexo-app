import React, { useEffect, useState } from "react"
import * as Haptics from "expo-haptics"
import { getMiniGameRewardCoins } from "@nexo/utils/daily-mini-game"
import {
  GameHint,
  GamePanel,
  MineGrid,
  MineTile,
  MineTileText,
} from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay.styled"
import {
  MiniGameRoundResult,
  MiniGameScore,
  type MiniGameFinishPayload,
  type MiniGamePlayProps,
} from "./shared"

const MINE_TILE_COUNT = 16
const MINE_COUNT = 4
const MINE_SAFE_TARGET = 5
const MINE_LOSS_TARGET = 2

function buildMineIndexes() {
  const indexes = new Set<number>()

  while (indexes.size < MINE_COUNT) {
    indexes.add(Math.floor(Math.random() * MINE_TILE_COUNT))
  }

  return indexes
}

export function MinePickGame({
  game,
  progress,
  risk,
  lockedResult,
  isCompleted,
  roundSummary,
  roundDetails,
  resetKey,
  onComplete,
  setScore,
  setRoundFeedback,
}: MiniGamePlayProps) {
  const [revealedTiles, setRevealedTiles] = useState<number[]>([])
  const [mineIndexes, setMineIndexes] = useState<Set<number>>(() => buildMineIndexes())

  useEffect(() => {
    setRevealedTiles([])
    setMineIndexes(buildMineIndexes())
  }, [resetKey])

  const handleTile = async (index: number) => {
    if (isCompleted || revealedTiles.includes(index)) {
      return
    }

    const nextRevealedTiles = [...revealedTiles, index]
    const isMine = mineIndexes.has(index)
    const nextSafeCount = progress + (isMine ? 0 : 1)
    const nextMineCount = risk + (isMine ? 1 : 0)

    setRevealedTiles(nextRevealedTiles)
    setScore(nextSafeCount, nextMineCount)

    await Haptics.notificationAsync(
      isMine
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Success,
    )

    if (nextSafeCount >= MINE_SAFE_TARGET || nextMineCount >= MINE_LOSS_TARGET) {
      const won = nextSafeCount >= MINE_SAFE_TARGET
      const result: MiniGameFinishPayload = {
        summary: won
          ? `Поле очищено: ${nextSafeCount} безпечних знаків`
          : `Забагато мін: ${nextMineCount}/${MINE_LOSS_TARGET}`,
        won,
        rewardCoins: getMiniGameRewardCoins(won),
        progressScore: nextSafeCount,
        riskScore: nextMineCount,
      }

      setRoundFeedback(result.summary, won ? "Ти встиг забрати денний бонус." : "Сьогодні поле було з характером.")
      await onComplete(result)
      return
    }

    setRoundFeedback(
      isMine ? "Міна. Ще одна помилка закриє спробу." : "Чисто, можна відкривати далі.",
      `Безпечні: ${nextSafeCount}/${MINE_SAFE_TARGET} • Міни: ${nextMineCount}/${MINE_LOSS_TARGET}`,
    )
  }

  return (
    <GamePanel>
      <GameHint>Знайди {MINE_SAFE_TARGET} безпечних плиток. Друга міна закриває спробу.</GameHint>
      <MiniGameScore game={game} progress={progress} risk={risk} lockedResult={lockedResult} />

      <MineGrid>
        {Array.from({ length: MINE_TILE_COUNT }, (_, index) => {
          const revealed = revealedTiles.includes(index)
          const isMine = mineIndexes.has(index)

          return (
            <MineTile
              key={index}
              $accent={game.accent}
              $revealed={revealed}
              $mine={isMine}
              disabled={isCompleted || revealed}
              onPress={() => handleTile(index)}
            >
              <MineTileText $revealed={revealed} $mine={isMine}>
                {revealed ? (isMine ? "✕" : "✓") : "?"}
              </MineTileText>
            </MineTile>
          )
        })}
      </MineGrid>

      <MiniGameRoundResult
        accent={game.accent}
        completedLabel="ФІНАЛ ПОЛЯ"
        activeLabel="ОСТАННЯ ПЛИТКА"
        isCompleted={isCompleted}
        lockedResult={lockedResult}
        roundSummary={roundSummary}
        roundDetails={roundDetails}
      />
    </GamePanel>
  )
}
