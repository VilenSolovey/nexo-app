import { useCallback, useEffect, useRef } from 'react'
import type { LayoutChangeEvent, ScrollView } from 'react-native'

type ChronicleRouteFocusParams = {
  activeSlotId?: string
  requestedFocus: string | null
  loading: boolean
}

export function useChronicleRouteFocus({
  activeSlotId,
  requestedFocus,
  loading,
}: ChronicleRouteFocusParams) {
  const scrollRef = useRef<ScrollView | null>(null)
  const routePanelYRef = useRef<number | null>(null)
  const activeItemLayoutRef = useRef<{ key: string; y: number } | null>(null)
  const focusedKeyRef = useRef<string | null>(null)

  const shouldFocus = Boolean(
    activeSlotId &&
    (requestedFocus === 'active' || requestedFocus === activeSlotId),
  )
  const focusKey = shouldFocus && activeSlotId
    ? `${requestedFocus}:${activeSlotId}`
    : null

  const scrollIfReady = useCallback(() => {
    if (loading || !focusKey || focusedKeyRef.current === focusKey) return
    const routePanelY = routePanelYRef.current
    const activeItemLayout = activeItemLayoutRef.current
    if (routePanelY === null || activeItemLayout?.key !== focusKey) return

    focusedKeyRef.current = focusKey
    scrollRef.current?.scrollTo({
      y: Math.max(routePanelY + activeItemLayout.y - 120, 0),
      animated: true,
    })
  }, [focusKey, loading])

  const scheduleScroll = useCallback(() => {
    requestAnimationFrame(scrollIfReady)
  }, [scrollIfReady])

  const handleRoutePanelLayout = useCallback((event: LayoutChangeEvent) => {
    routePanelYRef.current = event.nativeEvent.layout.y
    scheduleScroll()
  }, [scheduleScroll])

  const handleActiveItemLayout = useCallback((event: LayoutChangeEvent) => {
    if (!focusKey) return
    activeItemLayoutRef.current = {
      key: focusKey,
      y: event.nativeEvent.layout.y,
    }
    scheduleScroll()
  }, [focusKey, scheduleScroll])

  useEffect(() => {
    scheduleScroll()
  }, [scheduleScroll])

  return {
    scrollRef,
    shouldFocus,
    handleRoutePanelLayout,
    handleActiveItemLayout,
  }
}
