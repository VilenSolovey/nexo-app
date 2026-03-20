import React, { ReactNode } from 'react'
import { RefreshControl, StyleProp, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styled from 'styled-components/native'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'

type Props = {
  children: ReactNode
  onRefresh?: () => void | Promise<void>
  refreshing?: boolean
  contentContainerStyle?: StyleProp<ViewStyle>
}

const SafeArea = styled(SafeAreaView).attrs({
  edges: ['top', 'right', 'left', 'bottom'],
})`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`

const StyledScrollView = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`

const defaultContentContainerStyle: ViewStyle = {
  padding: 16,
  alignItems: 'center',
  flexGrow: 1,
}

export function RefreshableScreen({
  children,
  onRefresh,
  refreshing = false,
  contentContainerStyle,
}: Props) {
  const Theme = useAppTheme()
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={Theme.primary}
      colors={[Theme.primary]}
    />
  ) : undefined

  return (
    <SafeArea>
      <StyledScrollView
        refreshControl={refreshControl}
        contentContainerStyle={[defaultContentContainerStyle, contentContainerStyle]}
      >
        {children}
      </StyledScrollView>
    </SafeArea>
  )
}
