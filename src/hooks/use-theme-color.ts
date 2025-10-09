// A hook to get the theme color based on the current color scheme (light or dark) and optional overrides

import { Colors } from '@nexo/constants/theme';
import { useColorScheme } from '@nexo/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
