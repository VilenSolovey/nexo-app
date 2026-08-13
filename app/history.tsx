import React, { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Paragraph } from '@nexo/components/Home/HomeLayout'
import { RecentSection } from '@nexo/components/Home/RecentSection/RecentSection'
import { Entrance } from '@nexo/components/Motion/Entrance'
import { RefreshableScreen } from '@nexo/components/RefreshableScreen'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { useAllQuizzes } from '@nexo/hooks/useAllQuizzes'
import { useUserQuizProgress } from '@nexo/hooks/useUserQuizProgress'
import { useUserQuizResults } from '@nexo/hooks/useUserQuizResults'
import { toCompletedQuizItems } from '@nexo/utils/quiz-history'

export default function HistoryScreen() {
  const router = useRouter()
  const theme = useAppTheme()
  const { userId } = useAuth()
  const { quizzes, loading: quizzesLoading, refetch: refetchQuizzes } = useAllQuizzes(userId)
  const { progressList, loading: progressLoading, error, refetch: refetchProgress } = useUserQuizProgress(userId)
  const {
    results,
    loading: resultsLoading,
    error: resultsError,
    refetch: refetchResults,
  } = useUserQuizResults(userId)
  const [refreshing, setRefreshing] = useState(false)
  const items = useMemo(
    () => toCompletedQuizItems(quizzes, progressList, results),
    [progressList, quizzes, results],
  )

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchQuizzes(), refetchProgress(), refetchResults()])
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <RefreshableScreen onRefresh={onRefresh} refreshing={refreshing} contentContainerStyle={{ paddingBottom: 56 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад"
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <View style={styles.heading}>
          <Paragraph style={[styles.eyebrow, { color: theme.primary }]}>ТВІЙ ШЛЯХ</Paragraph>
          <Paragraph style={[styles.title, { color: theme.text }]}>Історія викликів</Paragraph>
          <Paragraph>Усі завершені квізи та виклики в одному місці.</Paragraph>
        </View>
      </View>

      {quizzesLoading || progressLoading || resultsLoading ? (
        <ActivityIndicator color={theme.primary} size="large" style={styles.loader} />
      ) : error || resultsError ? (
        <Paragraph style={styles.message}>Не вдалося завантажити історію: {error ?? resultsError}</Paragraph>
      ) : (
        <Entrance index={0}>
          <RecentSection items={items} title="Усі пройдені виклики" />
        </Entrance>
      )}
    </RefreshableScreen>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    marginBottom: 4,
  },
  loader: {
    marginTop: 48,
  },
  message: {
    marginTop: 48,
    textAlign: 'center',
  },
})
