import { useCallback, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'

export function useRefreshOnReturn(refresh: () => void | Promise<unknown>) {
  const hasFocusedRef = useRef(false)

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedRef.current) {
        hasFocusedRef.current = true
        return
      }

      void refresh()
    }, [refresh]),
  )
}
