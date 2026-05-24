import React, { useEffect, useState } from "react"
import { Modal, Pressable, ScrollView, useWindowDimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { DailyMiniGameResult, MiniGameDefinition } from "@nexo/utils/daily-mini-game"
import {
  getMiniGameRewardCoins,
  MINI_GAME_TARGET_SCORE,
} from "@nexo/utils/daily-mini-game"
import {
  FooterActions,
  Handle,
  ModalHeader,
  ModalHeaderCopy,
  ModalIconWrap,
  ModalOverlay,
  ModalSheet,
  ModalSubtitle,
  ModalTitle,
  SecondaryAction,
  SecondaryActionText,
} from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay.styled"
import { CoinFlipGame } from "@nexo/components/Home/MiniGameOfDay/games/CoinFlipGame"
import { LuckyWheelGame } from "@nexo/components/Home/MiniGameOfDay/games/LuckyWheelGame"
import { MemorySequenceGame } from "@nexo/components/Home/MiniGameOfDay/games/MemorySequenceGame"
import { MinePickGame } from "@nexo/components/Home/MiniGameOfDay/games/MinePickGame"
import { RockPaperScissorsGame } from "@nexo/components/Home/MiniGameOfDay/games/RockPaperScissorsGame"
import { TimingLockGame } from "@nexo/components/Home/MiniGameOfDay/games/TimingLockGame"
import { TwentyOneGame } from "@nexo/components/Home/MiniGameOfDay/games/TwentyOneGame"
import type { ApplyPointParams, MiniGameFinishPayload, MiniGamePlayProps } from "./games/shared"

type Props = {
  visible: boolean
  game: MiniGameDefinition
  existingResult: DailyMiniGameResult | null
  onClose: () => void
  onFinish: (result: MiniGameFinishPayload) => void | Promise<void>
}

export type { MiniGameFinishPayload } from "./games/shared"

function getLockedResult(
  completedResult: MiniGameFinishPayload | null,
  existingResult: DailyMiniGameResult | null,
) {
  return completedResult ?? (existingResult
    ? {
        summary: existingResult.summary,
        won: existingResult.won,
        rewardCoins: existingResult.rewardCoins,
        progressScore: existingResult.progressScore,
        riskScore: existingResult.riskScore,
      }
    : null)
}

export function MiniGameModal({ visible, game, existingResult, onClose, onFinish }: Props) {
  const { height } = useWindowDimensions()
  const [progress, setProgress] = useState(0)
  const [risk, setRisk] = useState(0)
  const [roundSummary, setRoundSummary] = useState<string | null>(null)
  const [roundDetails, setRoundDetails] = useState<string | null>(null)
  const [completedResult, setCompletedResult] = useState<MiniGameFinishPayload | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const lockedResult = getLockedResult(completedResult, existingResult)
  const isLocked = Boolean(existingResult)
  const isCompleted = Boolean(lockedResult)
  const contentMaxHeight = Math.max(340, height * 0.58)

  const resetChallenge = () => {
    setProgress(0)
    setRisk(0)
    setRoundSummary(null)
    setRoundDetails(null)
    setCompletedResult(null)
    setIsSaving(false)
    setResetKey((value) => value + 1)
  }

  useEffect(() => {
    if (visible) {
      setProgress(0)
      setRisk(0)
      setRoundSummary(null)
      setRoundDetails(null)
      setCompletedResult(null)
      setIsSaving(false)
      setResetKey((value) => value + 1)
    }
  }, [game.id, visible])

  const setScore = (nextProgress: number, nextRisk: number) => {
    setProgress(nextProgress)
    setRisk(nextRisk)
  }

  const setRoundFeedback = (summary: string | null, details: string | null = null) => {
    setRoundSummary(summary)
    setRoundDetails(details)
  }

  const clearRoundFeedback = () => {
    setRoundFeedback(null, null)
  }

  const completeChallenge = async (result: MiniGameFinishPayload) => {
    setProgress(result.progressScore)
    setRisk(result.riskScore)
    setCompletedResult(result)
    setIsSaving(true)

    try {
      await onFinish(result)
    } finally {
      setIsSaving(false)
    }
  }

  const applyPoint = async (params: ApplyPointParams) => {
    const nextProgress = progress + (params.playerWon ? 1 : 0)
    const nextRisk = risk + (params.playerWon ? 0 : 1)

    setProgress(nextProgress)
    setRisk(nextRisk)
    setRoundFeedback(params.roundSummary, params.roundDetails ?? null)

    if (
      nextProgress >= MINI_GAME_TARGET_SCORE ||
      nextRisk >= MINI_GAME_TARGET_SCORE
    ) {
      await completeChallenge({
        summary: params.playerWon
          ? `Челендж завершено: ${nextProgress}/${MINI_GAME_TARGET_SCORE}`
          : `Спроба завершена: ${nextRisk}/${MINI_GAME_TARGET_SCORE} помилок`,
        won: nextProgress > nextRisk,
        rewardCoins: getMiniGameRewardCoins(nextProgress > nextRisk),
        progressScore: nextProgress,
        riskScore: nextRisk,
      })
    }
  }

  const gameProps: MiniGamePlayProps = {
    game,
    progress,
    risk,
    lockedResult,
    isCompleted,
    roundSummary,
    roundDetails,
    resetKey,
    onPoint: applyPoint,
    onComplete: completeChallenge,
    setScore,
    setRoundFeedback,
    clearRoundFeedback,
  }

  const renderGame = () => {
    switch (game.id) {
      case "blackjack":
        return <TwentyOneGame {...gameProps} />
      case "coin_flip":
        return <CoinFlipGame {...gameProps} />
      case "lucky_wheel":
        return <LuckyWheelGame {...gameProps} />
      case "memory_sequence":
        return <MemorySequenceGame {...gameProps} />
      case "mine_pick":
        return <MinePickGame {...gameProps} />
      case "rock_paper_scissors":
        return <RockPaperScissorsGame {...gameProps} />
      case "timing_lock":
        return <TimingLockGame {...gameProps} />
      default:
        return null
    }
  }

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

          <ScrollView
            style={{ maxHeight: contentMaxHeight }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {renderGame()}
          </ScrollView>

          <FooterActions>
            <SecondaryAction onPress={onClose}>
              <SecondaryActionText>{isCompleted ? "Круто" : "Закрити"}</SecondaryActionText>
            </SecondaryAction>

            {!isLocked && !isCompleted ? (
              <SecondaryAction onPress={resetChallenge}>
                <SecondaryActionText>Почати заново</SecondaryActionText>
              </SecondaryAction>
            ) : (
              <SecondaryAction disabled={isSaving}>
                <SecondaryActionText>
                  {isLocked ? "Нагороду вже отримано" : isSaving ? "Зберігаю..." : "Денний челендж завершено"}
                </SecondaryActionText>
              </SecondaryAction>
            )}
          </FooterActions>
        </ModalSheet>
      </ModalOverlay>
    </Modal>
  )
}
