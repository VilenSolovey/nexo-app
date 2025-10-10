export const Palette = {
  greenDark: '#2E6F40',
  greenLight: '#CFFFFC',
  greenMid: '#68BA7F',
  greenDeep: '#253D2C',
};

export const Colors = {
  light: {
    background: Palette.greenLight,
    card: Palette.greenMid,
    text: Palette.greenDeep,
    primary: Palette.greenDark,
    tint: Palette.greenDark,
  },
  dark: {
    background: Palette.greenDeep,
    card: Palette.greenDark,
    text: Palette.greenLight,
    primary: Palette.greenMid,
    tint: Palette.greenMid,
  },
};

export type ThemeName = 'light' | 'dark';
