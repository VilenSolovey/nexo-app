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

type WheelSymbol = "clover" | "star" | "fire"

const wheelSymbols: { id: WheelSymbol; emoji: string; label: string }[] = [
  { id: "clover", emoji: "🍀", label: "Фарт" },
  { id: "star", emoji: "⭐", label: "Зірка" },
  { id: "fire", emoji: "🔥", label: "Іскра" },
]

function getWheelMeta(symbol: WheelSymbol) {
  return wheelSymbols.find((item) => item.id === symbol) ?? wheelSymbols[0]
}

export function LuckyWheelGame({
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
  const [prediction, setPrediction] = useState<WheelSymbol | null>(null)
  const [reveal, setReveal] = useState<WheelSymbol | null>(null)

  useEffect(() => {
    setPrediction(null)
    setReveal(null)
  }, [resetKey])

  const handleSpin = async () => {
    if (!prediction || isCompleted) {
      return
    }

    const result = pickRandomItem<WheelSymbol>(["clover", "star", "fire"])
    const playerWon = result === prediction
    const picked = getWheelMeta(prediction)
    const landed = getWheelMeta(result)

    setReveal(result)

    await Haptics.notificationAsync(
      playerWon ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    )

    await onPoint({
      playerWon,
      roundSummary: playerWon ? `${landed.emoji} колесо на твоєму боці` : `${landed.emoji} цього разу не збіглося`,
      roundDetails: `Ти вибрав: ${picked.emoji} ${picked.label} • Випало: ${landed.emoji} ${landed.label}`,
    })
  }

  return (
    <GamePanel>
      <GameHint>Вибери символ удачі. Якщо колесо зупиниться на ньому, прогрес зросте.</GameHint>
      <MiniGameScore game={game} progress={progress} risk={risk} lockedResult={lockedResult} />

      <OptionRow>
        {wheelSymbols.map((symbol) => (
          <GameOption
            key={symbol.id}
            $accent={game.accent}
            $active={prediction === symbol.id}
            disabled={isCompleted}
            onPress={() => setPrediction(symbol.id)}
          >
            <GameOptionEmoji>{symbol.emoji}</GameOptionEmoji>
            <GameOptionText $active={prediction === symbol.id}>{symbol.label}</GameOptionText>
          </GameOption>
        ))}
      </OptionRow>

      {prediction ? (
        <SelectionPreview $accent={game.accent}>
          <SelectionPreviewText>
            Ціль: {getWheelMeta(prediction).emoji} {getWheelMeta(prediction).label}
          </SelectionPreviewText>
        </SelectionPreview>
      ) : null}

      {!isCompleted ? (
        <PrimaryAction $accent={game.accent} $disabled={!prediction} disabled={!prediction} onPress={handleSpin}>
          <PrimaryActionText>Крутити колесо</PrimaryActionText>
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
