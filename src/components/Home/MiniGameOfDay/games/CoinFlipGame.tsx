import React, { useEffect, useState } from "react"
import * as Haptics from "expo-haptics"
import {
  GameHint,
  GameOption,
  GameOptionEmoji,
  GameOptionText,
  GamePanel,
  OptionRow,
  PrimaryAction,
  PrimaryActionText,
  SelectionPreview,
  SelectionPreviewText,
} from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay.styled"
import { MiniGameRoundResult, MiniGameScore, pickRandomItem, type MiniGamePlayProps } from "./shared"

type CoinSide = "heads" | "tails"

const coinSides: { id: CoinSide; emoji: string; label: string }[] = [
  { id: "heads", emoji: "🦅", label: "Орел" },
  { id: "tails", emoji: "🪙", label: "Решка" },
]

function getCoinSideMeta(side: CoinSide) {
  return coinSides.find((item) => item.id === side) ?? coinSides[0]
}

export function CoinFlipGame({
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
  const [prediction, setPrediction] = useState<CoinSide | null>(null)
  const [reveal, setReveal] = useState<CoinSide | null>(null)

  useEffect(() => {
    setPrediction(null)
    setReveal(null)
  }, [resetKey])

  const handleFlip = async () => {
    if (!prediction || isCompleted) {
      return
    }

    const result = pickRandomItem<CoinSide>(["heads", "tails"])
    const playerWon = result === prediction
    const picked = getCoinSideMeta(prediction)
    const landed = getCoinSideMeta(result)

    setReveal(result)

    await Haptics.notificationAsync(
      playerWon ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    )

    await onPoint({
      playerWon,
      roundSummary: playerWon ? `Влучив у ${landed.emoji}` : `Монетка пішла в ${landed.emoji}`,
      roundDetails: `Твій вибір: ${picked.emoji} ${picked.label} • Випало: ${landed.emoji} ${landed.label}`,
    })
  }

  return (
    <GamePanel>
      <GameHint>Обери сторону монетки. Влучання рухає ціль, промах додає ризик.</GameHint>
      <MiniGameScore game={game} progress={progress} risk={risk} lockedResult={lockedResult} />

      <OptionRow>
        {coinSides.map((side) => (
          <GameOption
            key={side.id}
            $accent={game.accent}
            $active={prediction === side.id}
            disabled={isCompleted}
            onPress={() => setPrediction(side.id)}
          >
            <GameOptionEmoji>{side.emoji}</GameOptionEmoji>
            <GameOptionText $active={prediction === side.id}>{side.label}</GameOptionText>
          </GameOption>
        ))}
      </OptionRow>

      {prediction ? (
        <SelectionPreview $accent={game.accent}>
          <SelectionPreviewText>
            Ставка: {getCoinSideMeta(prediction).emoji} {getCoinSideMeta(prediction).label}
          </SelectionPreviewText>
        </SelectionPreview>
      ) : null}

      {!isCompleted ? (
        <PrimaryAction $accent={game.accent} $disabled={!prediction} disabled={!prediction} onPress={handleFlip}>
          <PrimaryActionText>Кинути монетку</PrimaryActionText>
        </PrimaryAction>
      ) : null}

      <MiniGameRoundResult
        accent={game.accent}
        activeLabel="ОСТАННЯ ДІЯ"
        isCompleted={isCompleted}
        lockedResult={lockedResult}
        roundSummary={reveal || roundSummary ? roundSummary : null}
        roundDetails={roundDetails}
      />
    </GamePanel>
  )
}
