import React, { useEffect, useState } from "react"
import * as Haptics from "expo-haptics"
import {
  GameHint,
  GameOption,
  GameOptionEmoji,
  GameOptionText,
  GamePanel,
  OptionRow,
  SelectionPreview,
  SelectionPreviewText,
} from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay.styled"
import { MiniGameRoundResult, MiniGameScore, pickRandomItem, type MiniGamePlayProps } from "./shared"

type RpsChoice = "rock" | "scissors" | "paper"

const rpsChoicesData: { id: RpsChoice; emoji: string; label: string }[] = [
  { id: "rock", emoji: "🪨", label: "Камінь" },
  { id: "scissors", emoji: "✂️", label: "Ножиці" },
  { id: "paper", emoji: "📄", label: "Папір" },
]

function resolveRpsResult(player: RpsChoice, opponent: RpsChoice) {
  if (player === opponent) {
    return "draw" as const
  }

  const winsAgainst: Record<RpsChoice, RpsChoice> = {
    rock: "scissors",
    scissors: "paper",
    paper: "rock",
  }

  return winsAgainst[player] === opponent ? "win" as const : "loss" as const
}

function getRpsMeta(choice: RpsChoice) {
  return rpsChoicesData.find((item) => item.id === choice) ?? rpsChoicesData[0]
}

export function RockPaperScissorsGame({
  game,
  progress,
  risk,
  lockedResult,
  isCompleted,
  roundSummary,
  roundDetails,
  resetKey,
  onPoint,
  setRoundFeedback,
}: MiniGamePlayProps) {
  const [choices, setChoices] = useState<{ player: RpsChoice; opponent: RpsChoice } | null>(null)

  useEffect(() => {
    setChoices(null)
  }, [resetKey])

  const handlePick = async (player: RpsChoice) => {
    if (isCompleted) {
      return
    }

    const opponent = pickRandomItem<RpsChoice>(["rock", "scissors", "paper"])
    const outcome = resolveRpsResult(player, opponent)
    const playerMeta = getRpsMeta(player)
    const opponentMeta = getRpsMeta(opponent)

    setChoices({ player, opponent })

    if (outcome === "draw") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      setRoundFeedback(
        "Нічия, рахунок без змін",
        `${playerMeta.emoji} ${playerMeta.label} проти ${opponentMeta.emoji} ${opponentMeta.label}`,
      )
      return
    }

    await Haptics.notificationAsync(
      outcome === "win"
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    )

    await onPoint({
      playerWon: outcome === "win",
      roundSummary:
        outcome === "win"
          ? `${playerMeta.emoji} перемагає раунд`
          : `${opponentMeta.emoji} забирає раунд`,
      roundDetails: `${playerMeta.emoji} ${playerMeta.label} проти ${opponentMeta.emoji} ${opponentMeta.label}`,
    })
  }

  return (
    <GamePanel>
      <GameHint>Нічия не змінює прогрес. Потрібно зібрати 3 переможні раунди.</GameHint>
      <MiniGameScore game={game} progress={progress} risk={risk} lockedResult={lockedResult} />

      <OptionRow>
        {rpsChoicesData.map((choice) => (
          <GameOption
            key={choice.id}
            $accent={game.accent}
            disabled={isCompleted}
            onPress={() => handlePick(choice.id)}
          >
            <GameOptionEmoji>{choice.emoji}</GameOptionEmoji>
            <GameOptionText>{choice.label}</GameOptionText>
          </GameOption>
        ))}
      </OptionRow>

      {choices ? (
        <SelectionPreview $accent={game.accent}>
          <SelectionPreviewText>
            {getRpsMeta(choices.player).emoji} vs {getRpsMeta(choices.opponent).emoji}
          </SelectionPreviewText>
        </SelectionPreview>
      ) : null}

      <MiniGameRoundResult
        accent={game.accent}
        activeLabel="ОСТАННІЙ РАУНД"
        isCompleted={isCompleted}
        lockedResult={lockedResult}
        roundSummary={roundSummary}
        roundDetails={roundDetails}
      />
    </GamePanel>
  )
}
