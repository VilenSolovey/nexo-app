import AsyncStorage from "@react-native-async-storage/async-storage"

export type MiniGameId = "coin_flip" | "rock_paper_scissors" | "lucky_wheel"

export type MiniGameDefinition = {
  id: MiniGameId
  title: string
  subtitle: string
  icon: string
  accent: string
  emoji: string
}

export type DailyMiniGameResult = {
  dateKey: string
  gameId: MiniGameId
  summary: string
  playedAt: number
  won: boolean
  rewardCoins: number
  playerScore: number
  opponentScore: number
}

const STORAGE_KEY = "@nexo/daily-mini-game/result"
export const MINI_GAME_TARGET_SCORE = 3
export const MINI_GAME_WIN_COINS = 4
export const MINI_GAME_LOSS_COINS = 1
export const DAILY_MINI_GAMES: MiniGameDefinition[] = [
  {
    id: "coin_flip",
    title: "Підкинути монетку",
    subtitle: "Вгадай сторону монетки і дійди першим до 3 перемог.",
    icon: "albums-outline",
    accent: "#FBBF24",
    emoji: "🪙",
  },
  {
    id: "rock_paper_scissors",
    title: "Камінь, ножиці, папір",
    subtitle: "Матч серією раундів: перший до 3 перемог забирає день.",
    icon: "hand-left-outline",
    accent: "#5EEAD4",
    emoji: "✂️",
  },
  {
    id: "lucky_wheel",
    title: "Колесо удачі",
    subtitle: "Обери символ удачі і влуч у нього 3 рази швидше за суперника.",
    icon: "sparkles-outline",
    accent: "#EBA76E",
    emoji: "🎡",
  },
]

export function getMiniGameDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function getMiniGameOfDay(date = new Date()) {
  const dateKey = getMiniGameDateKey(date)
  const hash = dateKey.split("-").reduce((sum, part) => sum + Number(part), 0)

  return DAILY_MINI_GAMES[hash % DAILY_MINI_GAMES.length]
}

export function getMiniGameRewardCoins(won: boolean) {
  return won ? MINI_GAME_WIN_COINS : MINI_GAME_LOSS_COINS
}

export async function getStoredMiniGameResult() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DailyMiniGameResult>

    if (
      typeof parsed?.dateKey !== "string" ||
      typeof parsed?.gameId !== "string" ||
      typeof parsed?.summary !== "string"
    ) {
      return null
    }

    return {
      dateKey: parsed.dateKey,
      gameId: parsed.gameId as MiniGameId,
      summary: parsed.summary,
      playedAt: Number(parsed.playedAt ?? Date.now()),
      won: Boolean(parsed.won),
      rewardCoins: Number(parsed.rewardCoins ?? 0),
      playerScore: Number(parsed.playerScore ?? 0),
      opponentScore: Number(parsed.opponentScore ?? 0),
    }
  } catch (error) {
    console.warn("Failed to parse mini game result:", error)
    return null
  }
}

export async function saveMiniGameResult(result: DailyMiniGameResult) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(result))
}
