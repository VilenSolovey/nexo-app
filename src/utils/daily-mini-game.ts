import AsyncStorage from "@react-native-async-storage/async-storage"

export type MiniGameId =
  | "coin_flip"
  | "rock_paper_scissors"
  | "lucky_wheel"
  | "memory_sequence"
  | "mine_pick"
  | "timing_lock"
  | "blackjack"

export type MiniGameDefinition = {
  id: MiniGameId
  title: string
  subtitle: string
  icon: string
  accent: string
  emoji: string
  scoreLabels: {
    progressLabel: string
    riskLabel: string
    dividerLabel: string
  }
}

export type DailyMiniGameResult = {
  dateKey: string
  gameId: MiniGameId
  summary: string
  playedAt: number
  won: boolean
  rewardCoins: number
  progressScore: number
  riskScore: number
}

const STORAGE_KEY = "@nexo/daily-mini-game/result"
export const MINI_GAME_TARGET_SCORE = 3
export const MINI_GAME_WIN_COINS = 8
export const MINI_GAME_LOSS_COINS = 3
export const DAILY_MINI_GAMES: MiniGameDefinition[] = [
  {
    id: "memory_sequence",
    title: "Памʼять послідовності",
    subtitle: "Запамʼятай ряд символів і повтори його без помилки.",
    icon: "git-compare-outline",
    accent: "#A7F3D0",
    emoji: "🧠",
    scoreLabels: {
      progressLabel: "Успіхи",
      riskLabel: "Помилки",
      dividerLabel: `ціль ${MINI_GAME_TARGET_SCORE}`,
    },
  },
  {
    id: "mine_pick",
    title: "Безпечні плитки",
    subtitle: "Відкривай поле, збирай безпечні знаки і не наступай на міни.",
    icon: "grid-outline",
    accent: "#F87171",
    emoji: "💎",
    scoreLabels: {
      progressLabel: "Безпечні",
      riskLabel: "Міни",
      dividerLabel: "5/2",
    },
  },
  {
    id: "timing_lock",
    title: "Точний імпульс",
    subtitle: "Зупини індикатор у зеленій зоні і набери серію влучань.",
    icon: "scan-outline",
    accent: "#93C5FD",
    emoji: "🎯",
    scoreLabels: {
      progressLabel: "Влучання",
      riskLabel: "Промахи",
      dividerLabel: `ціль ${MINI_GAME_TARGET_SCORE}`,
    },
  },
  {
    id: "blackjack",
    title: "21 очко",
    subtitle: "Добери карти ближче до 21 і переграй дилера без ставок.",
    icon: "layers-outline",
    accent: "#FDE68A",
    emoji: "🂡",
    scoreLabels: {
      progressLabel: "Виграні руки",
      riskLabel: "Програні",
      dividerLabel: `до ${MINI_GAME_TARGET_SCORE}`,
    },
  },
  {
    id: "rock_paper_scissors",
    title: "Камінь, ножиці, папір",
    subtitle: "Збери 3 переможні раунди, нічия не шкодить прогресу.",
    icon: "hand-left-outline",
    accent: "#5EEAD4",
    emoji: "✂️",
    scoreLabels: {
      progressLabel: "Перемоги",
      riskLabel: "Поразки",
      dividerLabel: `до ${MINI_GAME_TARGET_SCORE}`,
    },
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
    const parsed = JSON.parse(raw) as Partial<DailyMiniGameResult> & {
      playerScore?: unknown
      opponentScore?: unknown
    }

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
      progressScore: Number(parsed.progressScore ?? parsed.playerScore ?? 0),
      riskScore: Number(parsed.riskScore ?? parsed.opponentScore ?? 0),
    }
  } catch (error) {
    console.warn("Failed to parse mini game result:", error)
    return null
  }
}

export async function saveMiniGameResult(result: DailyMiniGameResult) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(result))
}

export async function clearStoredMiniGameResult() {
  await AsyncStorage.removeItem(STORAGE_KEY)
}
