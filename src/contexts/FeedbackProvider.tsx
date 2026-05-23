import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type FeedbackType = 'success' | 'error' | 'warning' | 'info'

export type FeedbackToast = {
  id: number
  type: FeedbackType
  message: string
  durationMs?: number
}

export type FeedbackModalAction = {
  label: string
  onPress?: () => void
}

export type FeedbackModal = {
  id: number
  type: FeedbackType
  title: string
  message?: string
  primaryAction?: FeedbackModalAction
  secondaryAction?: FeedbackModalAction
}

type ShowToastInput = Omit<FeedbackToast, 'id'>
type ShowModalInput = Omit<FeedbackModal, 'id'>

type FeedbackContextValue = {
  toast: FeedbackToast | null
  modal: FeedbackModal | null
  showToast: (toast: ShowToastInput) => void
  showModal: (modal: ShowModalInput) => void
  closeToast: () => void
  closeModal: () => void
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

let notificationId = 0

function nextNotificationId() {
  notificationId += 1
  return notificationId
}

export function FeedbackProvider({ children }: Props) {
  const [toast, setToast] = useState<FeedbackToast | null>(null)
  const [modal, setModal] = useState<FeedbackModal | null>(null)

  const showToast = useCallback((nextToast: ShowToastInput) => {
    setToast({
      ...nextToast,
      id: nextNotificationId(),
    })
  }, [])

  const showModal = useCallback((nextModal: ShowModalInput) => {
    setModal({
      ...nextModal,
      id: nextNotificationId(),
    })
  }, [])

  const closeToast = useCallback(() => {
    setToast(null)
  }, [])

  const closeModal = useCallback(() => {
    setModal(null)
  }, [])

  const value = useMemo(
    () => ({
      toast,
      modal,
      showToast,
      showModal,
      closeToast,
      closeModal,
    }),
    [closeModal, closeToast, modal, showModal, showToast, toast],
  )

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
}

export function useFeedback() {
  const context = useContext(FeedbackContext)

  if (!context) {
    throw new Error('useFeedback must be used inside FeedbackProvider')
  }

  return context
}
