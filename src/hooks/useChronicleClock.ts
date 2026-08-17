import { useEffect, useState } from 'react'
import type { ChallengeSlot } from '@nexo/types/chronicle.types'
import { toChronicleDate } from '@nexo/utils/chronicle-route'

const MAX_TIMEOUT_MS = 2_147_000_000

export function useChronicleClock(
  slots: ChallengeSlot[],
  extraBoundary?: ChallengeSlot['opensAt'] | null,
) {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const currentTime = Date.now()
    const nextBoundary = slots
      .flatMap((slot) => [slot.opensAt, slot.closesAt])
      .concat(extraBoundary)
      .map((value) => toChronicleDate(value)?.getTime())
      .filter((value): value is number => value !== undefined && value > currentTime)
      .sort((left, right) => left - right)[0]

    const extraBoundaryTime = toChronicleDate(extraBoundary)?.getTime()
    const nextMinute = extraBoundaryTime && extraBoundaryTime > currentTime
      ? currentTime + (60_000 - (currentTime % 60_000))
      : undefined
    const nextWakeAt = [nextBoundary, nextMinute]
      .filter((value): value is number => value !== undefined)
      .sort((left, right) => left - right)[0]

    if (!nextWakeAt) return

    const timeout = setTimeout(
      () => setNow(Date.now()),
      Math.min(nextWakeAt - currentTime + 50, MAX_TIMEOUT_MS),
    )
    return () => clearTimeout(timeout)
  }, [extraBoundary, now, slots])

  return now
}
