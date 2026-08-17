import React from 'react'
import { InAppNotificationModal } from '@nexo/components/Feedback/InAppNotificationModal'
import { TopToast } from '@nexo/components/Feedback/TopToast'

export function FeedbackHost() {
  return (
    <>
      <TopToast />
      <InAppNotificationModal />
    </>
  )
}
