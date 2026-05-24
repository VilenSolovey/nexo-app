import React, { useEffect, useState } from "react"
import { Pressable } from "react-native"
import * as Haptics from "expo-haptics"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { MiniGameModal, type MiniGameFinishPayload } from "@nexo/components/Home/MiniGameOfDay/MiniGameModal"
import {
  DebugResetButton,
  DebugResetButtonText,
  FloatingButton,
  FloatingButtonAccent,
  FloatingButtonCopy,
  FloatingButtonEmoji,
  FloatingButtonHeader,
  FloatingButtonReward,
  FloatingButtonStatus,
  FloatingButtonSubtitle,
  FloatingButtonTitle,
  FloatingWrap,
} from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay.styled"
import { useAuth } from "@nexo/contexts/AuthProvider"
import { recordMiniGameStats } from "@nexo/services/mini-game-stats.service"
import { applyUserRewards } from "@nexo/services/user.service"
import {
  clearStoredMiniGameResult,
  getMiniGameDateKey,
  getMiniGameOfDay,
  getStoredMiniGameResult,
  MINI_GAME_WIN_COINS,
  saveMiniGameResult,
  type DailyMiniGameResult,
} from "@nexo/utils/daily-mini-game"

export function MiniGameOfDay() {
  const insets = useSafeAreaInsets()
  const { userId, refreshUserProfile } = useAuth()
  const todayGame = getMiniGameOfDay()
  const todayKey = getMiniGameDateKey()
  const [visible, setVisible] = useState(false)
  const [storedResult, setStoredResult] = useState<DailyMiniGameResult | null>(null)

  useEffect(() => {
    let active = true

    const loadStoredResult = async () => {
      try {
        const nextResult = await getStoredMiniGameResult()
        if (!active) {
          return
        }

        if (nextResult?.dateKey === todayKey && nextResult.gameId === todayGame.id) {
          setStoredResult(nextResult)
          return
        }

        setStoredResult(null)
      } catch (error) {
        console.error("Failed to load mini game result:", error)
      }
    }

    loadStoredResult()

    return () => {
      active = false
    }
  }, [todayGame.id, todayKey])

  const handleOpen = () => {
    Haptics.selectionAsync()
    setVisible(true)
  }

  const handleDebugReset = async () => {
    try {
      await clearStoredMiniGameResult()
      setStoredResult(null)
    } catch (error) {
      console.error("Failed to clear mini game result:", error)
    }
  }

  const handleFinish = async (payload: MiniGameFinishPayload) => {
    const result: DailyMiniGameResult = {
      dateKey: todayKey,
      gameId: todayGame.id,
      summary: payload.summary,
      playedAt: Date.now(),
      won: payload.won,
      rewardCoins: payload.rewardCoins,
      progressScore: payload.progressScore,
      riskScore: payload.riskScore,
    }

    setStoredResult(result)

    try {
      await saveMiniGameResult(result)

      if (userId) {
        try {
          const nextStats = await recordMiniGameStats(userId, result)
          if (__DEV__) {
            console.log("Mini game stats:", nextStats)
          }
        } catch (error) {
          console.error("Failed to save mini game stats:", error)
        }
      }

      if (userId && result.rewardCoins > 0) {
        await applyUserRewards(userId, {
          coinsDelta: result.rewardCoins,
        })
        await refreshUserProfile()
      }
    } catch (error) {
      console.error("Failed to save mini game result:", error)
    }
  }

  const statusText = storedResult
    ? todayGame.id === "mine_pick"
      ? storedResult.won
        ? `Поле очищено • ${storedResult.progressScore}/5`
        : `Спроба завершена • міни ${storedResult.riskScore}/2`
      : todayGame.id === "memory_sequence"
        ? storedResult.won
          ? `Успіхи ${storedResult.progressScore}/3`
          : `Помилки ${storedResult.riskScore}/3`
        : todayGame.id === "timing_lock"
          ? storedResult.won
            ? `Влучання ${storedResult.progressScore}/3`
            : `Промахи ${storedResult.riskScore}/3`
          : todayGame.id === "blackjack"
            ? storedResult.won
              ? `Виграні руки ${storedResult.progressScore}/3`
              : `Програні ${storedResult.riskScore}/3`
            : todayGame.id === "rock_paper_scissors"
            ? storedResult.won
              ? `Перемоги ${storedResult.progressScore}/3`
              : `Поразки ${storedResult.riskScore}/3`
            : storedResult.won
              ? `Влучання ${storedResult.progressScore}/3`
              : `Промахи ${storedResult.riskScore}/3`
    : todayGame.id === "mine_pick"
      ? "Знайди 5 безпечних плиток"
      : todayGame.id === "memory_sequence"
        ? "Повтори 3 послідовності"
        : todayGame.id === "timing_lock"
          ? "Зупини індикатор у зеленій зоні"
          : todayGame.id === "blackjack"
            ? "Виграй 3 руки до 21"
            : todayGame.id === "rock_paper_scissors"
            ? "Збери 3 переможні раунди"
            : "Збери 3 влучання"

  const rewardText = storedResult
    ? `+${storedResult.rewardCoins} монет`
    : `До +${MINI_GAME_WIN_COINS} монет`

  return (
    <>
      <FloatingWrap pointerEvents="box-none" $bottomOffset={insets.bottom + 92}>
        <Pressable
          onPress={handleOpen}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <FloatingButton>
            <FloatingButtonAccent $accent={todayGame.accent} />

            <FloatingButtonHeader>
              <FloatingButtonEmoji>{todayGame.emoji}</FloatingButtonEmoji>

              <FloatingButtonCopy>
                <FloatingButtonTitle>{todayGame.title}</FloatingButtonTitle>
                <FloatingButtonSubtitle>{todayGame.subtitle}</FloatingButtonSubtitle>
              </FloatingButtonCopy>

              <Ionicons name={todayGame.icon as never} size={18} color={todayGame.accent} />
            </FloatingButtonHeader>

            <FloatingButtonStatus>
              <FloatingButtonReward>{rewardText}</FloatingButtonReward>
              <FloatingButtonSubtitle>{statusText}</FloatingButtonSubtitle>
            </FloatingButtonStatus>
          </FloatingButton>
        </Pressable>

        {__DEV__ && (
          <DebugResetButton onPress={handleDebugReset}>
            <DebugResetButtonText>Скинути мінігру</DebugResetButtonText>
          </DebugResetButton>
        )}
      </FloatingWrap>

      <MiniGameModal
        visible={visible}
        game={todayGame}
        existingResult={storedResult}
        onClose={() => setVisible(false)}
        onFinish={handleFinish}
      />
    </>
  )
}
