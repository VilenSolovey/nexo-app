import { getThemeOption } from '@nexo/constants/themes'
export const DEFAULT_AVATAR_ID = 'default'

const avatarSeeds: Record<string, string> = {
  [DEFAULT_AVATAR_ID]: 'guest',
  avatar_scholar: 'nexo-scholar',
  avatar_champion: 'nexo-champion',
}

export function getThemePreview(themeId?: string | null) {
  return getThemeOption(themeId).preview
}

export function getAvatarSeed(avatarId?: string | null, fallbackSeed = 'guest') {
  if (!avatarId || avatarId === DEFAULT_AVATAR_ID) {
    return fallbackSeed
  }

  return avatarSeeds[avatarId] ?? `${avatarId}-${fallbackSeed}`
}
