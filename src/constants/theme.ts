export type AppTheme = {
  background: string
  card: string
  cardBorder: string
  text: string
  textSecondary: string
  primary: string
  accentAlt: string
  icon: string
  iconActive: string
  accent: string
  warning: string
  shopCard: string
  cardBackground: string
  error: string
  exp: string
  coin: string
  textTertiary: string
  success: string
}

export const defaultTheme: AppTheme = {
  background: '#1E2B25',
  card: '#24372E',
  cardBorder: '#2F4B3F',
  text: '#E8F5E9',
  textSecondary: '#A3B4AA',
  primary: '#5EEAD4',
  accentAlt: '#A5F3FC',
  icon: '#A3B4AA',
  iconActive: '#5EEAD4',
  accent: '#6fdbca',
  warning: '#EBA76E',
  shopCard: '#2F4B3F',
  cardBackground: '#1a3d33',
  error: '#ef4444',
  exp: '#8b5cf6',
  coin: '#fbbf24',
  textTertiary: '#7a9590',
  success: '#4ade80',
}

const themeOverrides: Record<string, Partial<AppTheme>> = {
  theme_dark: {
    background: '#0F172A',
    card: '#172033',
    cardBorder: '#263247',
    text: '#E5EEF9',
    textSecondary: '#94A3B8',
    primary: '#67E8F9',
    accentAlt: '#93C5FD',
    icon: '#94A3B8',
    iconActive: '#67E8F9',
    accent: '#38BDF8',
    warning: '#F59E0B',
    shopCard: '#1E293B',
    cardBackground: '#111827',
    error: '#F87171',
    exp: '#A78BFA',
    coin: '#FBBF24',
    textTertiary: '#64748B',
    success: '#4ADE80',
  },
  theme_gold: {
    background: '#2A2012',
    card: '#3A2A16',
    cardBorder: '#6D4B18',
    text: '#FFF7E6',
    textSecondary: '#D7C3A1',
    primary: '#FBBF24',
    accentAlt: '#FDE68A',
    icon: '#D7C3A1',
    iconActive: '#FBBF24',
    accent: '#F59E0B',
    warning: '#F97316',
    shopCard: '#4A3519',
    cardBackground: '#24190B',
    error: '#F87171',
    exp: '#C084FC',
    coin: '#FACC15',
    textTertiary: '#BFA77B',
    success: '#86EFAC',
  },
}

export function resolveAppTheme(themeId?: string | null): AppTheme {
  if (!themeId) {
    return defaultTheme
  }

  return {
    ...defaultTheme,
    ...(themeOverrides[themeId] ?? {}),
  }
}

export const Theme: AppTheme = { ...defaultTheme }

export function applyTheme(nextTheme: AppTheme) {
  Object.assign(Theme, nextTheme)
}
