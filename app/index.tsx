import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { Theme } from '@nexo/constants/theme'

export default function Index() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    router.replace(user ? '/(tabs)' : '/(public)/login')
  }, [loading, user])

  return (
    <LinearGradient
      colors={[Theme.background, Theme.card]}
      style={styles.container}
    >
      <ActivityIndicator size="large" color={Theme.primary} />
    </LinearGradient>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});