import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { applyTheme, defaultTheme, resolveAppTheme, type AppTheme } from '@nexo/constants/theme'

const AppThemeContext = createContext<AppTheme>(defaultTheme)

type Props = {
  children: React.ReactNode
}

export function AppThemeProvider({ children }: Props) {
  const { userProfile } = useAuth()
  const selectedThemeId = userProfile?.selectedThemeId ?? null
  const theme = useMemo(() => resolveAppTheme(selectedThemeId), [selectedThemeId])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <AppThemeContext.Provider value={theme}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </AppThemeContext.Provider>
  )
}

export function useAppTheme() {
  return useContext(AppThemeContext)
}
