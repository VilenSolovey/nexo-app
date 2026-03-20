export const LEVEL_BASE_EXP = 40
export const LEVEL_STEP_EXP = 20

export function getExpRequiredForLevel(level: number): number {
  if (level <= 1) return 0

  let total = 0

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    total += LEVEL_BASE_EXP + (currentLevel - 1) * LEVEL_STEP_EXP
  }

  return total
}

export function getLevelFromExp(totalExp: number): number {
  const safeExp = Math.max(0, totalExp)
  let level = 1

  while (safeExp >= getExpRequiredForLevel(level + 1)) {
    level += 1
  }

  return level
}

export function getLevelProgress(totalExp: number, explicitLevel?: number) {
  const safeExp = Math.max(0, totalExp)
  const level = Math.max(explicitLevel ?? getLevelFromExp(safeExp), 1)
  const levelStartExp = getExpRequiredForLevel(level)
  const nextLevelExp = getExpRequiredForLevel(level + 1)
  const span = Math.max(nextLevelExp - levelStartExp, 1)
  const expIntoLevel = Math.max(safeExp - levelStartExp, 0)
  const expRemaining = Math.max(nextLevelExp - safeExp, 0)
  const progress = Math.min(1, expIntoLevel / span)

  return {
    level,
    totalExp: safeExp,
    levelStartExp,
    nextLevelExp,
    expIntoLevel,
    expRemaining,
    progress,
  }
}
