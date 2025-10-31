export const Palette = {
  // Base surfaces
  background: '#1E2B25', 
  card: '#24372E', 

  // Typography
  textPrimary: '#E8F5E9', 
  textSecondary: '#A3B4AA', 

  // Accents
  accent: '#5EEAD4', 
  accentAlt: '#A5F3FC', 

  // Semantic
  warning: '#EBA76E', 

  // Special surfaces
  shopCard: '#2F4B3F',
}

export const Colors = {
  light: {
    background: Palette.background,
    card: Palette.card,
    text: Palette.textPrimary,
    textSecondary: Palette.textSecondary,
    primary: Palette.accent, 
    accentAlt: Palette.accentAlt,
    warning: Palette.warning,
    shopCard: Palette.shopCard,
    tint: Palette.accent,
  },
  dark: {
    // For now, align dark with the same palette for consistency
    // TODO: Adjust colors for better dark mode experience
    background: Palette.background,
    card: Palette.card,
    text: Palette.textPrimary,
    textSecondary: Palette.textSecondary,
    primary: Palette.accent,
    accentAlt: Palette.accentAlt,
    warning: Palette.warning,
    shopCard: Palette.shopCard,
    tint: Palette.accent,
  },
}

export type ThemeName = 'light' | 'dark'
