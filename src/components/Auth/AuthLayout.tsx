import React from 'react'
import { Platform, KeyboardAvoidingView, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient'
import styled from 'styled-components/native'
import { Theme } from '@nexo/constants/theme'

type Props = {
  children: React.ReactNode
}

const Gradient = styled(LinearGradient)<LinearGradientProps>`
  flex: 1;
`

const Safe = styled(SafeAreaView)`
  flex: 1;
`

const Scroll = styled.ScrollView.attrs({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
})``

const Content = styled.View`
  width: 100%;
`

export function AuthLayout({ children }: Props) {
  return (
    <Gradient colors={[Theme.background, Theme.card]}>
      <Safe>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Scroll contentContainerStyle={{ flexGrow: 1 }}>
            <Content>
              {children}
            </Content>
          </Scroll>
        </KeyboardAvoidingView>
      </Safe>
    </Gradient>
  )
}