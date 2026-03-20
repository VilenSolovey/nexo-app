import { defaultTheme } from '@nexo/constants/theme'

export const DEFAULT_THEME_ID = 'default'

export type ThemeOption = {
  id: string
  name: string
  description: string
  icon: string
  price?: number
  effect?: string
  preview: {
    label: string
    accent: string
    colors: [string, string]
  }
}

export const DEFAULT_THEME_OPTION: ThemeOption = {
  id: DEFAULT_THEME_ID,
  name: 'Стандартна',
  description: 'Фірмова зелена тема Nexo',
  icon: 'leaf-outline',
  preview: {
    label: 'Nexo Forest',
    accent: defaultTheme.primary,
    colors: [defaultTheme.background, defaultTheme.card],
  },
}

export const THEME_COSMETICS: ThemeOption[] = [
  {
    id: 'theme_dark',
    name: '🌙 Нічна тема',
    description: 'Темна тема для додатку',
    icon: 'moon',
    price: 250,
    effect: 'Змінює колірну схему додатку',
    preview: {
      label: 'Нічна тема',
      accent: '#93C5FD',
      colors: ['#0F172A', '#1E293B'],
    },
  },
  {
    id: 'theme_gold',
    name: '✨ Золота тема',
    description: 'Преміум золота тема',
    icon: 'sparkles',
    price: 500,
    effect: 'Розкішна золота колірна схема',
    preview: {
      label: 'Золота тема',
      accent: '#FBBF24',
      colors: ['#4A3510', '#A16207'],
    },
  },
]

export const ALL_THEME_OPTIONS: ThemeOption[] = [
  DEFAULT_THEME_OPTION,
  ...THEME_COSMETICS,
]

export function getThemeOption(themeId?: string | null): ThemeOption {
  if (!themeId || themeId === DEFAULT_THEME_ID) {
    return DEFAULT_THEME_OPTION
  }

  return THEME_COSMETICS.find((item) => item.id === themeId) ?? DEFAULT_THEME_OPTION
}
