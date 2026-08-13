import React from 'react'
import { Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import { useFeedback } from '@nexo/contexts/FeedbackProvider'
import { getFeedbackAccent, getFeedbackIcon } from '@nexo/components/Feedback/feedback-style'
import { useFeedbackEntranceAnimation } from '@nexo/components/Feedback/useFeedbackEntranceAnimation'
import {
  ModalActions,
  ModalButton,
  ModalButtonText,
  ModalHandle,
  ModalIconCircle,
  ModalMessage,
  ModalOverlay,
  ModalSheet,
  ModalTitle,
} from '@nexo/components/Feedback/Feedback.styled'

export function InAppNotificationModal() {
  const Theme = useAppTheme()
  const { modal, closeModal } = useFeedback()
  const entranceStyle = useFeedbackEntranceAnimation(Boolean(modal))

  if (!modal) return null

  const accent = getFeedbackAccent(modal.type, Theme)
  const icon = getFeedbackIcon(modal.type)
  const primaryAction = modal.primaryAction ?? { label: 'Зрозуміло' }

  const handlePrimary = () => {
    closeModal()
    primaryAction.onPress?.()
  }

  const handleSecondary = () => {
    closeModal()
    modal.secondaryAction?.onPress?.()
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={closeModal}>
      <ModalOverlay onPress={closeModal}>
        <ModalSheet
          $accent={accent}
          style={entranceStyle}
          onStartShouldSetResponder={() => true}
        >
          <ModalHandle />
          <ModalIconCircle $accent={accent}>
            <Ionicons name={icon} size={28} color={accent} />
          </ModalIconCircle>
          <ModalTitle>{modal.title}</ModalTitle>
          {modal.message ? <ModalMessage>{modal.message}</ModalMessage> : null}

          <ModalActions>
            <ModalButton $variant="primary" $accent={accent} onPress={handlePrimary}>
              <ModalButtonText $variant="primary">{primaryAction.label}</ModalButtonText>
            </ModalButton>

            {modal.secondaryAction ? (
              <ModalButton $variant="secondary" $accent={accent} onPress={handleSecondary}>
                <ModalButtonText $variant="secondary">{modal.secondaryAction.label}</ModalButtonText>
              </ModalButton>
            ) : null}
          </ModalActions>
        </ModalSheet>
      </ModalOverlay>
    </Modal>
  )
}
