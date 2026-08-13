import React from 'react'
import { ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import {
  StateAction,
  StateActionText,
  StateContainer,
  StateDescription,
  StateIcon,
  StateTitle,
} from '@nexo/components/FullScreenState/FullScreenState.styled'

type FullScreenStateProps =
  | {
      variant: 'loading'
      title?: string
      description?: string
    }
  | {
      variant: 'error'
      title: string
      description?: string
      actionLabel?: string
      onAction?: () => void
    }

export function FullScreenState(props: FullScreenStateProps) {
  const theme = useAppTheme()
  const isLoading = props.variant === 'loading'

  return (
    <StateContainer>
      <StateIcon $variant={props.variant}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <Ionicons name="cloud-offline-outline" size={30} color={theme.warning} />
        )}
      </StateIcon>

      {props.title ? <StateTitle>{props.title}</StateTitle> : null}

      {props.description ? (
        <StateDescription>{props.description}</StateDescription>
      ) : null}

      {props.variant === 'error' && props.onAction ? (
        <StateAction
          accessibilityRole="button"
          onPress={props.onAction}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <StateActionText>{props.actionLabel ?? 'Повторити'}</StateActionText>
        </StateAction>
      ) : null}
    </StateContainer>
  )
}
