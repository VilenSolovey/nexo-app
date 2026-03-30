import { useEffect, useRef } from 'react'
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { Theme } from '@nexo/constants/theme'

export default function Index() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (loading) return

    router.replace(user ? '/(tabs)' : '/(public)/login')
  }, [loading, router, user])

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    )

    pulseAnimation.start()

    return () => {
      pulseAnimation.stop()
    }
  }, [pulse])

  const middleDotOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  })

  const sideDotOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.35],
  })

  const logoScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  })

  return (
    <LinearGradient colors={['#182720', Theme.background]} style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
          <Image
            source={require('../assets/images/icon-nexo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.title}>Nexo</Text>
        <Text style={styles.subtitle}>Завантажуємо ваш простір</Text>

        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: sideDotOpacity }]} />
          <Animated.View style={[styles.dot, styles.dotActive, { opacity: middleDotOpacity }]} />
          <Animated.View style={[styles.dot, { opacity: sideDotOpacity }]} />
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  logo: {
    width: 68,
    height: 68,
  },
  title: {
    marginTop: 20,
    color: Theme.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 8,
    color: Theme.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: Theme.primary,
  },
})
