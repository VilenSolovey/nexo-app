import React, { useEffect, useState } from "react"
import { Modal, Pressable } from "react-native"
import * as Haptics from "expo-haptics"
import { Ionicons } from "@expo/vector-icons"
import type { DailyMiniGameResult, MiniGameDefinition } from "@nexo/utils/daily-mini-game"
import {
  getMiniGameRewardCoins,
  MINI_GAME_TARGET_SCORE,
} from "@nexo/utils/daily-mini-game"
import {
  FooterActions,
  GameHint,
  GameOption,
  GameOptionEmoji,
  GameOptionText,
  GamePanel,
  Handle,
  ModalHeader,
  ModalHeaderCopy,
  ModalIconWrap,
  ModalOverlay,
  ModalSheet,
  ModalSubtitle,
  ModalTitle,
  OptionRow,
  PrimaryAction,
  PrimaryActionText,
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
  SecondaryAction,
  SecondaryActionText,
  SelectionPreview,
  SelectionPreviewText,
} from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay.styled"

type Props = {
  visible: boolean
  game: MiniGameDefinition
  existingResult: DailyMiniGameResult | null
  onClose: () => void
  onFinish: (result: MiniGameFinishPayload) => void | Promise<void>
}

export type MiniGameFinishPayload = {
  summary: string
  won: boolean
  rewardCoins: number
  playerScore: number
  opponentScore: number
}

type CoinSide = "heads" | "tails"
type RpsChoice = "rock" | "scissors" | "paper"
type WheelSymbol = "clover" | "star" | "fire"

const coinSides: Array<{ id: CoinSide; emoji: string; label: string }> = [
  { id: "heads", emoji: "🦅", label: "Орел" },
  { id: "tails", emoji: "🪙", label: "Решка" },
]

const rpsChoicesData: Array<{ id: RpsChoice; emoji: string; label: string }> = [
  { id: "rock", emoji: "🪨", label: "Камінь" },
  { id: "scissors", emoji: "✂️", label: "Ножиці" },
  { id: "paper", emoji: "📄", label: "Папір" },
]

const wheelSymbols: Array<{ id: WheelSymbol; emoji: string; label: string }> = [
  { id: "clover", emoji: "🍀", label: "Фарт" },
  { id: "star", emoji: "⭐", label: "Зірка" },
  { id: "fire", emoji: "🔥", label: "Іскра" },
]

function pickRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

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

function getCoinSideMeta(side: CoinSide) {
  return coinSides.find((item) => item.id === side) ?? coinSides[0]
}

function getRpsMeta(choice: RpsChoice) {
  return rpsChoicesData.find((item) => item.id === choice) ?? rpsChoicesData[0]
}

function getWheelMeta(symbol: WheelSymbol) {
  return wheelSymbols.find((item) => item.id === symbol) ?? wheelSymbols[0]
}

export function MiniGameModal({ visible, game, existingResult, onClose, onFinish }: Props) {
  const [coinPrediction, setCoinPrediction] = useState<CoinSide | null>(null)
  const [wheelPrediction, setWheelPrediction] = useState<WheelSymbol | null>(null)
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [roundSummary, setRoundSummary] = useState<string | null>(null)
  const [roundDetails, setRoundDetails] = useState<string | null>(null)
  const [rpsChoices, setRpsChoices] = useState<{ player: RpsChoice; opponent: RpsChoice } | null>(null)
  const [coinReveal, setCoinReveal] = useState<CoinSide | null>(null)
  const [wheelReveal, setWheelReveal] = useState<WheelSymbol | null>(null)
  const [completedResult, setCompletedResult] = useState<MiniGameFinishPayload | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!visible) {
      return
    }

    setCoinPrediction(null)
    setWheelPrediction(null)
    setPlayerScore(0)
    setOpponentScore(0)
    setRoundSummary(null)
    setRoundDetails(null)
    setRpsChoices(null)
    setCoinReveal(null)
    setWheelReveal(null)
    setCompletedResult(null)
    setIsSaving(false)
  }, [game.id, visible])

  const lockedResult = completedResult ?? (existingResult
    ? {
        summary: existingResult.summary,
        won: existingResult.won,
        rewardCoins: existingResult.rewardCoins,
        playerScore: existingResult.playerScore,
        opponentScore: existingResult.opponentScore,
      }
    : null)

  const isLocked = Boolean(existingResult)
  const isCompleted = Boolean(lockedResult)

  const finalizeSeries = async (
    nextPlayerScore: number,
    nextOpponentScore: number,
    summary: string,
  ) => {
    const won = nextPlayerScore > nextOpponentScore
    const rewardCoins = getMiniGameRewardCoins(won)
    const result: MiniGameFinishPayload = {
      summary,
      won,
      rewardCoins,
      playerScore: nextPlayerScore,
      opponentScore: nextOpponentScore,
    }

    setCompletedResult(result)
    setIsSaving(true)

    try {
      await onFinish(result)
    } finally {
      setIsSaving(false)
    }
  }

  const applySeriesPoint = async (params: {
    playerWon: boolean
    roundSummary: string
    roundDetails?: string | null
  }) => {
    const { playerWon, roundSummary: nextRoundSummary, roundDetails: nextRoundDetails } = params
    const nextPlayerScore = playerScore + (playerWon ? 1 : 0)
    const nextOpponentScore = opponentScore + (playerWon ? 0 : 1)

    setPlayerScore(nextPlayerScore)
    setOpponentScore(nextOpponentScore)
    setRoundSummary(nextRoundSummary)
    setRoundDetails(nextRoundDetails ?? null)

    if (
      nextPlayerScore >= MINI_GAME_TARGET_SCORE ||
      nextOpponentScore >= MINI_GAME_TARGET_SCORE
    ) {
      const finalSummary = playerWon
        ? `Серія закрита ${nextPlayerScore}:${nextOpponentScore} на твою користь`
        : `Серія закрита ${nextPlayerScore}:${nextOpponentScore}, але завтра буде реванш`

      await finalizeSeries(nextPlayerScore, nextOpponentScore, finalSummary)
    }
  }

  const handleFlipCoin = async () => {
    if (!coinPrediction || isCompleted) {
      return
    }

    const result = pickRandomItem<CoinSide>(["heads", "tails"])
    const playerWon = result === coinPrediction
    const picked = getCoinSideMeta(coinPrediction)
    const landed = getCoinSideMeta(result)

    setCoinReveal(result)

    await Haptics.notificationAsync(
      playerWon ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    )

    await applySeriesPoint({
      playerWon,
      roundSummary: playerWon ? `Влучив у ${landed.emoji}` : `Монетка пішла в ${landed.emoji}`,
      roundDetails: `Твій вибір: ${picked.emoji} ${picked.label} • Випало: ${landed.emoji} ${landed.label}`,
    })
  }

  const handleRpsPick = async (player: RpsChoice) => {
    if (isCompleted) {
      return
    }

    const opponent = pickRandomItem<RpsChoice>(["rock", "scissors", "paper"])
    const outcome = resolveRpsResult(player, opponent)
    const playerMeta = getRpsMeta(player)
    const opponentMeta = getRpsMeta(opponent)

    setRpsChoices({ player, opponent })

    if (outcome === "draw") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      setRoundSummary("Нічия, рахунок без змін")
      setRoundDetails(`${playerMeta.emoji} ${playerMeta.label} проти ${opponentMeta.emoji} ${opponentMeta.label}`)
      return
    }

    await Haptics.notificationAsync(
      outcome === "win"
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    )

    await applySeriesPoint({
      playerWon: outcome === "win",
      roundSummary:
        outcome === "win"
          ? `${playerMeta.emoji} перемагає раунд`
          : `${opponentMeta.emoji} забирає раунд`,
      roundDetails: `${playerMeta.emoji} ${playerMeta.label} проти ${opponentMeta.emoji} ${opponentMeta.label}`,
    })
  }

  const handleSpinWheel = async () => {
    if (!wheelPrediction || isCompleted) {
      return
    }

    const result = pickRandomItem<WheelSymbol>(["clover", "star", "fire"])
    const playerWon = result === wheelPrediction
    const picked = getWheelMeta(wheelPrediction)
    const landed = getWheelMeta(result)

    setWheelReveal(result)

    await Haptics.notificationAsync(
      playerWon ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    )

    await applySeriesPoint({
      playerWon,
      roundSummary: playerWon ? `${landed.emoji} колесо на твоєму боці` : `${landed.emoji} цього разу не збіглося`,
      roundDetails: `Ти вибрав: ${picked.emoji} ${picked.label} • Випало: ${landed.emoji} ${landed.label}`,
    })
  }

  const renderScore = () => (
    <ScoreRow>
      <ScoreCard>
        <ScoreCardLabel>Ти</ScoreCardLabel>
        <ScoreCardValue>{lockedResult?.playerScore ?? playerScore}</ScoreCardValue>
      </ScoreCard>

      <ScoreDivider>до {MINI_GAME_TARGET_SCORE}</ScoreDivider>

      <ScoreCard>
        <ScoreCardLabel>Суперник</ScoreCardLabel>
        <ScoreCardValue>{lockedResult?.opponentScore ?? opponentScore}</ScoreCardValue>
      </ScoreCard>
    </ScoreRow>
  )

  const renderCoinFlip = () => (
    <GamePanel>
      <GameHint>Обери сторону монетки. Кожне влучання дає очко, промах додає очко супернику.</GameHint>
      {renderScore()}

      <OptionRow>
        {coinSides.map((side) => (
          <GameOption
            key={side.id}
            $accent={game.accent}
            $active={coinPrediction === side.id}
            disabled={isCompleted}
            onPress={() => setCoinPrediction(side.id)}
          >
            <GameOptionEmoji>{side.emoji}</GameOptionEmoji>
            <GameOptionText $active={coinPrediction === side.id}>{side.label}</GameOptionText>
          </GameOption>
        ))}
      </OptionRow>

      {coinPrediction ? (
        <SelectionPreview $accent={game.accent}>
          <SelectionPreviewText>
            Ставка: {getCoinSideMeta(coinPrediction).emoji} {getCoinSideMeta(coinPrediction).label}
          </SelectionPreviewText>
        </SelectionPreview>
      ) : null}

      {!isCompleted ? (
        <PrimaryAction $accent={game.accent} $disabled={!coinPrediction} disabled={!coinPrediction} onPress={handleFlipCoin}>
          <PrimaryActionText>Кинути монетку</PrimaryActionText>
        </PrimaryAction>
      ) : null}

      {coinReveal || roundSummary || lockedResult ? (
        <ResultCard $accent={game.accent}>
          <ResultLabel>{isCompleted ? "ФІНАЛ СЕРІЇ" : "ОСТАННІЙ РАУНД"}</ResultLabel>
          <ResultText>{roundSummary ?? lockedResult?.summary}</ResultText>
          {roundDetails ? <ResultSubText>{roundDetails}</ResultSubText> : null}
          {lockedResult ? <RewardValue>+{lockedResult.rewardCoins} монет</RewardValue> : null}
        </ResultCard>
      ) : null}
    </GamePanel>
  )

  const renderRockPaperScissors = () => (
    <GamePanel>
      <GameHint>Нічия не змінює рахунок. Потрібно першим узяти 3 раунди.</GameHint>
      {renderScore()}

      <OptionRow>
        {rpsChoicesData.map((choice) => (
          <GameOption
            key={choice.id}
            $accent={game.accent}
            disabled={isCompleted}
            onPress={() => handleRpsPick(choice.id)}
          >
            <GameOptionEmoji>{choice.emoji}</GameOptionEmoji>
            <GameOptionText>{choice.label}</GameOptionText>
          </GameOption>
        ))}
      </OptionRow>

      {rpsChoices ? (
        <SelectionPreview $accent={game.accent}>
          <SelectionPreviewText>
            {getRpsMeta(rpsChoices.player).emoji} vs {getRpsMeta(rpsChoices.opponent).emoji}
          </SelectionPreviewText>
        </SelectionPreview>
      ) : null}

      {roundSummary || lockedResult ? (
        <ResultCard $accent={game.accent}>
          <ResultLabel>{isCompleted ? "ФІНАЛ СЕРІЇ" : "ОСТАННІЙ РАУНД"}</ResultLabel>
          <ResultText>{roundSummary ?? lockedResult?.summary}</ResultText>
          {roundDetails ? <ResultSubText>{roundDetails}</ResultSubText> : null}
          {lockedResult ? <RewardValue>+{lockedResult.rewardCoins} монет</RewardValue> : null}
        </ResultCard>
      ) : null}
    </GamePanel>
  )

  const renderLuckyWheel = () => (
    <GamePanel>
      <GameHint>Вибери символ удачі. Якщо колесо зупиниться на ньому, очко твоє.</GameHint>
      {renderScore()}

      <OptionRow>
        {wheelSymbols.map((symbol) => (
          <GameOption
            key={symbol.id}
            $accent={game.accent}
            $active={wheelPrediction === symbol.id}
            disabled={isCompleted}
            onPress={() => setWheelPrediction(symbol.id)}
          >
            <GameOptionEmoji>{symbol.emoji}</GameOptionEmoji>
            <GameOptionText $active={wheelPrediction === symbol.id}>{symbol.label}</GameOptionText>
          </GameOption>
        ))}
      </OptionRow>

      {wheelPrediction ? (
        <SelectionPreview $accent={game.accent}>
          <SelectionPreviewText>
            Ціль: {getWheelMeta(wheelPrediction).emoji} {getWheelMeta(wheelPrediction).label}
          </SelectionPreviewText>
        </SelectionPreview>
      ) : null}

      {!isCompleted ? (
        <PrimaryAction $accent={game.accent} $disabled={!wheelPrediction} disabled={!wheelPrediction} onPress={handleSpinWheel}>
          <PrimaryActionText>Крутити колесо</PrimaryActionText>
        </PrimaryAction>
      ) : null}

      {wheelReveal || roundSummary || lockedResult ? (
        <ResultCard $accent={game.accent}>
          <ResultLabel>{isCompleted ? "ФІНАЛ СЕРІЇ" : "ОСТАННІЙ РАУНД"}</ResultLabel>
          <ResultText>{roundSummary ?? lockedResult?.summary}</ResultText>
          {roundDetails ? <ResultSubText>{roundDetails}</ResultSubText> : null}
          {lockedResult ? <RewardValue>+{lockedResult.rewardCoins} монет</RewardValue> : null}
        </ResultCard>
      ) : null}
    </GamePanel>
  )

  const content =
    game.id === "coin_flip"
      ? renderCoinFlip()
      : game.id === "rock_paper_scissors"
        ? renderRockPaperScissors()
        : renderLuckyWheel()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ModalOverlay>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <ModalSheet>
          <Handle />

          <ModalHeader>
            <ModalIconWrap $accent={game.accent}>
              <Ionicons name={game.icon as never} size={24} color={game.accent} />
            </ModalIconWrap>

            <ModalHeaderCopy>
              <ModalTitle>{game.title}</ModalTitle>
              <ModalSubtitle>{game.subtitle}</ModalSubtitle>
            </ModalHeaderCopy>
          </ModalHeader>

          {content}

          <FooterActions>
            <SecondaryAction onPress={onClose}>
              <SecondaryActionText>{isCompleted ? "Круто" : "Закрити"}</SecondaryActionText>
            </SecondaryAction>

            {!isLocked && !isCompleted ? (
              <SecondaryAction
                onPress={() => {
                  setCoinPrediction(null)
                  setWheelPrediction(null)
                  setPlayerScore(0)
                  setOpponentScore(0)
                  setRoundSummary(null)
                  setRoundDetails(null)
                  setRpsChoices(null)
                  setCoinReveal(null)
                  setWheelReveal(null)
                }}
              >
                <SecondaryActionText>Почати заново</SecondaryActionText>
              </SecondaryAction>
            ) : (
              <SecondaryAction disabled={isSaving}>
                <SecondaryActionText>
                  {isLocked ? "Нагороду вже отримано" : isSaving ? "Зберігаю..." : "Денна серія завершена"}
                </SecondaryActionText>
              </SecondaryAction>
            )}
          </FooterActions>
        </ModalSheet>
      </ModalOverlay>
    </Modal>
  )
}
