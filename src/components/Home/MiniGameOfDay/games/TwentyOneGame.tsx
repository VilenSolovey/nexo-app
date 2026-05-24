import React, { useEffect, useState } from "react"
import * as Haptics from "expo-haptics"
import {
  BlackjackCard,
  BlackjackCardRow,
  BlackjackCardText,
  BlackjackHandBlock,
  BlackjackHandHeader,
  BlackjackHandLabel,
  BlackjackHandValue,
  BlackjackTable,
  GameHint,
  GamePanel,
  OptionRow,
  PrimaryAction,
  PrimaryActionText,
} from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay.styled"
import { MiniGameRoundResult, MiniGameScore, pickRandomItem, type MiniGamePlayProps } from "./shared"

type BlackjackSuit = "♠" | "♥" | "♦" | "♣"
type BlackjackRank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"
type BlackjackCardValue = {
  rank: BlackjackRank
  suit: BlackjackSuit
}

const blackjackSuits: BlackjackSuit[] = ["♠", "♥", "♦", "♣"]
const blackjackRanks: BlackjackRank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

function drawBlackjackCard(): BlackjackCardValue {
  return {
    rank: pickRandomItem(blackjackRanks),
    suit: pickRandomItem(blackjackSuits),
  }
}

function buildBlackjackHand() {
  return {
    playerCards: [drawBlackjackCard(), drawBlackjackCard()],
    dealerCards: [drawBlackjackCard(), drawBlackjackCard()],
  }
}

function getBlackjackTotal(cards: BlackjackCardValue[]) {
  let total = 0
  let aces = 0

  cards.forEach((card) => {
    if (card.rank === "A") {
      total += 11
      aces += 1
      return
    }

    total += ["J", "Q", "K"].includes(card.rank) ? 10 : Number(card.rank)
  })

  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }

  return total
}

function dealerPlay(initialCards: BlackjackCardValue[]) {
  const nextCards = [...initialCards]

  while (getBlackjackTotal(nextCards) < 17) {
    nextCards.push(drawBlackjackCard())
  }

  return nextCards
}

export function TwentyOneGame({
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
  clearRoundFeedback,
}: MiniGamePlayProps) {
  const [playerCards, setPlayerCards] = useState<BlackjackCardValue[]>(() => buildBlackjackHand().playerCards)
  const [dealerCards, setDealerCards] = useState<BlackjackCardValue[]>(() => buildBlackjackHand().dealerCards)
  const [dealerRevealed, setDealerRevealed] = useState(false)
  const [handClosed, setHandClosed] = useState(false)

  useEffect(() => {
    const hand = buildBlackjackHand()

    setPlayerCards(hand.playerCards)
    setDealerCards(hand.dealerCards)
    setDealerRevealed(false)
    setHandClosed(false)
  }, [resetKey])

  const startHand = () => {
    const hand = buildBlackjackHand()

    setPlayerCards(hand.playerCards)
    setDealerCards(hand.dealerCards)
    setDealerRevealed(false)
    setHandClosed(false)
    clearRoundFeedback()
  }

  const resolveHand = async (nextPlayerCards: BlackjackCardValue[], nextDealerCards: BlackjackCardValue[]) => {
    const playerTotal = getBlackjackTotal(nextPlayerCards)
    const dealerTotal = getBlackjackTotal(nextDealerCards)

    setDealerCards(nextDealerCards)
    setDealerRevealed(true)
    setHandClosed(true)

    if (playerTotal > 21) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      await onPoint({
        playerWon: false,
        roundSummary: "Перебір, рука програна",
        roundDetails: `Твоя рука: ${playerTotal}`,
      })
      return
    }

    if (dealerTotal > 21 || playerTotal > dealerTotal) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      await onPoint({
        playerWon: true,
        roundSummary: dealerTotal > 21 ? "Дилер перебрав" : "Ти ближче до 21",
        roundDetails: `Ти ${playerTotal} • Дилер ${dealerTotal}`,
      })
      return
    }

    if (playerTotal < dealerTotal) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      await onPoint({
        playerWon: false,
        roundSummary: "Дилер забирає руку",
        roundDetails: `Ти ${playerTotal} • Дилер ${dealerTotal}`,
      })
      return
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    setRoundFeedback("Нічия, прогрес без змін", `Ти ${playerTotal} • Дилер ${dealerTotal}`)
  }

  const handleHit = async () => {
    if (isCompleted || handClosed) {
      return
    }

    const nextPlayerCards = [...playerCards, drawBlackjackCard()]
    const playerTotal = getBlackjackTotal(nextPlayerCards)

    setPlayerCards(nextPlayerCards)

    if (playerTotal > 21) {
      await resolveHand(nextPlayerCards, dealerCards)
      return
    }

    await Haptics.selectionAsync()
  }

  const handleStand = async () => {
    if (isCompleted || handClosed) {
      return
    }

    await resolveHand(playerCards, dealerPlay(dealerCards))
  }

  const renderCard = (card: BlackjackCardValue, hidden = false) => (
    <BlackjackCard $accent={game.accent} $hidden={hidden}>
      <BlackjackCardText $hidden={hidden} $red={card.suit === "♥" || card.suit === "♦"}>
        {hidden ? "?" : `${card.rank}\n${card.suit}`}
      </BlackjackCardText>
    </BlackjackCard>
  )

  const visibleDealerCards = dealerRevealed ? dealerCards : dealerCards.slice(0, 1)
  const playerTotal = getBlackjackTotal(playerCards)
  const dealerTotal = dealerRevealed
    ? getBlackjackTotal(dealerCards)
    : getBlackjackTotal(visibleDealerCards)

  return (
    <GamePanel>
      <GameHint>Добери карти ближче до 21. Перебір додає помилку, нічия не змінює прогрес.</GameHint>
      <MiniGameScore game={game} progress={progress} risk={risk} lockedResult={lockedResult} />

      <BlackjackTable $accent={game.accent}>
        <BlackjackHandBlock>
          <BlackjackHandHeader>
            <BlackjackHandLabel>Дилер</BlackjackHandLabel>
            <BlackjackHandValue>{dealerRevealed ? dealerTotal : `${dealerTotal}+?`}</BlackjackHandValue>
          </BlackjackHandHeader>

          <BlackjackCardRow>
            {visibleDealerCards.map((card, index) => (
              <React.Fragment key={`dealer-${index}-${card.rank}-${card.suit}`}>
                {renderCard(card)}
              </React.Fragment>
            ))}
            {!dealerRevealed ? renderCard(dealerCards[1], true) : null}
          </BlackjackCardRow>
        </BlackjackHandBlock>

        <BlackjackHandBlock>
          <BlackjackHandHeader>
            <BlackjackHandLabel>Твоя рука</BlackjackHandLabel>
            <BlackjackHandValue>{playerTotal}</BlackjackHandValue>
          </BlackjackHandHeader>

          <BlackjackCardRow>
            {playerCards.map((card, index) => (
              <React.Fragment key={`player-${index}-${card.rank}-${card.suit}`}>
                {renderCard(card)}
              </React.Fragment>
            ))}
          </BlackjackCardRow>
        </BlackjackHandBlock>
      </BlackjackTable>

      {!isCompleted && !handClosed ? (
        <OptionRow>
          <PrimaryAction style={{ flex: 1 }} $accent={game.accent} onPress={handleHit}>
            <PrimaryActionText>Взяти</PrimaryActionText>
          </PrimaryAction>
          <PrimaryAction style={{ flex: 1 }} $accent={game.accent} onPress={handleStand}>
            <PrimaryActionText>Стоп</PrimaryActionText>
          </PrimaryAction>
        </OptionRow>
      ) : !isCompleted ? (
        <PrimaryAction $accent={game.accent} onPress={startHand}>
          <PrimaryActionText>Нова рука</PrimaryActionText>
        </PrimaryAction>
      ) : null}

      <MiniGameRoundResult
        accent={game.accent}
        activeLabel="ОСТАННЯ РУКА"
        isCompleted={isCompleted}
        lockedResult={lockedResult}
        roundSummary={roundSummary}
        roundDetails={roundDetails}
      />
    </GamePanel>
  )
}
