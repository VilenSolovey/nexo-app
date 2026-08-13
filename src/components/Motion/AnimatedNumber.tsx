import React, { useEffect, useRef, useState } from "react"

type Props = {
  value: number
  duration?: number
  format?: (value: number) => string
  children: (value: string) => React.ReactNode
}

export function AnimatedNumber({
  value,
  duration = 520,
  format = (nextValue) => String(Math.round(nextValue)),
  children,
}: Props) {
  const previousValueRef = useRef(value)
  const frameRef = useRef<number | null>(null)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const from = previousValueRef.current
    const to = value
    const startedAt = Date.now()

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
    }

    const tick = () => {
      const elapsed = Date.now() - startedAt
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setDisplayValue(from + (to - from) * eased)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
        return
      }

      previousValueRef.current = to
      frameRef.current = null
    }

    tick()

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [duration, value])

  return <>{children(format(displayValue))}</>
}
