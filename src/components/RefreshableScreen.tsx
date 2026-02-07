import React, { ReactNode } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styled from 'styled-components/native'
import { Theme } from '@nexo/constants/theme'

type Props = {
  children: ReactNode
  onRefresh?: () => void | Promise<void>
  refreshing?: boolean
}

const SafeArea = styled(SafeAreaView).attrs({
  edges: ['top', 'right', 'left', 'bottom'],
})`
  flex: 1;
  background-color: ${Theme.background};
`

const StyledScrollView = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 16,
    alignItems: 'center',
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`

export function RefreshableScreen({ children, onRefresh, refreshing = false }: Props) {
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
      <StyledScrollView refreshControl={refreshControl}>
        {children}
      </StyledScrollView>
    </SafeArea>
  )
}
