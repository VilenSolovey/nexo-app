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
import { applyUserRewards } from "@nexo/services/user.service"
import {
  clearStoredMiniGameResult,
  getMiniGameDateKey,
  getMiniGameOfDay,
  getStoredMiniGameResult,
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
      playerScore: payload.playerScore,
      opponentScore: payload.opponentScore,
    }

    setStoredResult(result)

    try {
      await saveMiniGameResult(result)

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
    ? storedResult.won
      ? `Серія ${storedResult.playerScore}:${storedResult.opponentScore}`
      : `Реванш завтра • ${storedResult.playerScore}:${storedResult.opponentScore}`
    : "Нова денна серія до 3 перемог"

  const rewardText = storedResult
    ? `+${storedResult.rewardCoins} монет`
    : `До +5 монет`

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
