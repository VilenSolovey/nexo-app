// A hook to get the current color scheme (light or dark) using React Native's Appearance API

import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  const scheme = useRNColorScheme();
  return (scheme ?? 'light') as 'light' | 'dark';
}