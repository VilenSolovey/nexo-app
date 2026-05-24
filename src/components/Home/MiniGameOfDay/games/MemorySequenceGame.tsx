import React, { useEffect, useState } from "react"
import * as Haptics from "expo-haptics"
import {
  CompactOptionRow,
  GameHint,
  GamePanel,
  PrimaryAction,
  PrimaryActionText,
  SequenceSlot,
  SequenceSlotText,
  SequenceTrack,
  SymbolButton,
  SymbolText,
} from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay.styled"
import { MiniGameRoundResult, MiniGameScore, pickRandomItem, type MiniGamePlayProps } from "./shared"

type MemorySymbol = "moon" | "bolt" | "gem" | "leaf" | "shell"

const memorySymbols: { id: MemorySymbol; emoji: string; label: string }[] = [
  { id: "moon", emoji: "🌙", label: "Місяць" },
  { id: "bolt", emoji: "⚡", label: "Імпульс" },
  { id: "gem", emoji: "💎", label: "Кристал" },
  { id: "leaf", emoji: "🍃", label: "Лист" },
  { id: "shell", emoji: "🌀", label: "Вихор" },
]

function buildMemorySequence(length: number) {
  return Array.from({ length }, () => pickRandomItem(memorySymbols).id)
}

function getMemoryMeta(symbol: MemorySymbol) {
  return memorySymbols.find((item) => item.id === symbol) ?? memorySymbols[0]
}

export function MemorySequenceGame({
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
  const [sequence, setSequence] = useState<MemorySymbol[]>(() => buildMemorySequence(3))
  const [input, setInput] = useState<MemorySymbol[]>([])
  const [revealed, setRevealed] = useState(true)

  useEffect(() => {
    setSequence(buildMemorySequence(3))
    setInput([])
    setRevealed(true)
  }, [resetKey])

  const handleSymbol = async (symbol: MemorySymbol) => {
    if (isCompleted || revealed) {
      return
    }

    const nextInput = [...input, symbol]
    const currentIndex = nextInput.length - 1

    if (sequence[currentIndex] !== symbol) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setInput([])
      setRevealed(true)

      await onPoint({
        playerWon: false,
        roundSummary: "Послідовність зірвалась",
        roundDetails: "Подивись на новий ряд і спробуй забрати наступний раунд.",
      })

      setSequence(buildMemorySequence(3 + Math.min(progress, 2)))
      return
    }

    setInput(nextInput)

    if (nextInput.length !== sequence.length) {
      await Haptics.selectionAsync()
      return
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setInput([])
    setRevealed(true)

    await onPoint({
      playerWon: true,
      roundSummary: "Послідовність повторена чисто",
      roundDetails: `Довжина ряду: ${sequence.length}`,
    })

    setSequence(buildMemorySequence(3 + Math.min(progress + 1, 2)))
  }

  return (
    <GamePanel>
      <GameHint>Спочатку запамʼятай ряд, потім сховай його і натисни символи в тому самому порядку.</GameHint>
      <MiniGameScore game={game} progress={progress} risk={risk} lockedResult={lockedResult} />

      <SequenceTrack $accent={game.accent}>
        {sequence.map((symbol, index) => (
          <SequenceSlot key={`${symbol}-${index}`} $accent={game.accent} $filled={revealed || index < input.length}>
            <SequenceSlotText>
              {revealed
                ? getMemoryMeta(symbol).emoji
                : input[index]
                  ? getMemoryMeta(input[index]).emoji
                  : "?"}
            </SequenceSlotText>
          </SequenceSlot>
        ))}
      </SequenceTrack>

      {!isCompleted ? (
        <PrimaryAction
          $accent={game.accent}
          onPress={() => {
            setInput([])
            setRevealed((value) => !value)
          }}
        >
          <PrimaryActionText>{revealed ? "Я запамʼятав" : "Показати ряд"}</PrimaryActionText>
        </PrimaryAction>
      ) : null}

      <CompactOptionRow>
        {memorySymbols.map((symbol) => (
          <SymbolButton
            key={symbol.id}
            $accent={game.accent}
            disabled={isCompleted || revealed}
            onPress={() => handleSymbol(symbol.id)}
          >
            <SymbolText>{symbol.emoji}</SymbolText>
          </SymbolButton>
        ))}
      </CompactOptionRow>

      <MiniGameRoundResult
        accent={game.accent}
        activeLabel="ОСТАННЯ СПРОБА"
        isCompleted={isCompleted}
        lockedResult={lockedResult}
        roundSummary={roundSummary}
        roundDetails={roundDetails}
      />
    </GamePanel>
  )
}
