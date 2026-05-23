import type { ComponentProps } from 'react'
import { Ionicons } from '@expo/vector-icons'
import type { FeedbackType } from '@nexo/contexts/FeedbackProvider'
import type { AppTheme } from '@nexo/constants/theme'

export type FeedbackIconName = ComponentProps<typeof Ionicons>['name']

export function getFeedbackAccent(type: FeedbackType, theme: AppTheme) {
  switch (type) {
    case 'success':
      return theme.success
    case 'error':
      return theme.error
    case 'warning':
      return theme.warning
    case 'info':
    default:
      return theme.primary
  }
}

export function getFeedbackIcon(type: FeedbackType): FeedbackIconName {
  switch (type) {
    case 'success':
      return 'checkmark-circle'
    case 'error':
      return 'close-circle'
    case 'warning':
      return 'warning'
    case 'info':
    default:
      return 'information-circle'
  }
}
