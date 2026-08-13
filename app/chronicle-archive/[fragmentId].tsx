import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import {
  getChapterFragments,
  getChapterQuestions,
  getUserQuestionStatsList,
} from '@nexo/services/chronicle.service'
import type { ChronicleFragment, UserQuestionStats } from '@nexo/types/chronicle.types'
import { getArchiveMeta } from '@nexo/utils/chronicle-route'

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export default function ChronicleArchiveRecordScreen() {
  const router = useRouter()
  const theme = useAppTheme()
  const { userId } = useAuth()
  const params = useLocalSearchParams<{ fragmentId?: string | string[]; chapterId?: string | string[] }>()
  const fragmentId = firstParam(params.fragmentId)
  const chapterId = firstParam(params.chapterId)
  const [fragment, setFragment] = useState<ChronicleFragment | null>(null)
  const [relatedRecords, setRelatedRecords] = useState<ChronicleFragment[]>([])
  const [stats, setStats] = useState<UserQuestionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!fragmentId || !chapterId) {
      setError('Не вдалося визначити запис Архіву.')
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    Promise.all([
      getChapterFragments(chapterId),
      getChapterQuestions(chapterId),
      userId ? getUserQuestionStatsList(userId, chapterId) : Promise.resolve([] as UserQuestionStats[]),
    ])
      .then(([fragments, questions, questionStats]) => {
        if (!active) return
        const current = fragments.find((item) => item.id === fragmentId) ?? null
        if (!current) {
          setError('Запис Архіву не знайдено.')
          return
        }

        const relatedIds = new Set<string>()
        for (const question of questions) {
          if (question.primaryFragmentId === fragmentId) {
            question.linkedFragmentIds.forEach((id) => relatedIds.add(id))
          }
          if (question.linkedFragmentIds.includes(fragmentId)) {
            relatedIds.add(question.primaryFragmentId)
          }
        }
        relatedIds.delete(fragmentId)

        setFragment(current)
        setRelatedRecords(fragments.filter((item) => relatedIds.has(item.id)).slice(0, 4))
        setStats(questionStats.filter((item) => item.primaryFragmentId === fragmentId))
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Не вдалося відкрити запис Архіву.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [chapterId, fragmentId, userId])

  const recordStats = useMemo(() => {
    const answered = stats.reduce((sum, item) => sum + Number(item.attempts ?? 0), 0)
    const correct = stats.reduce((sum, item) => sum + Number(item.correct ?? 0), 0)
    return {
      answered,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : null,
    }
  }, [stats])

  if (loading) {
    return (
      <SafeAreaView style={[styles.state, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    )
  }

  if (error || !fragment) {
    return (
      <SafeAreaView style={[styles.state, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>{error ?? 'Запис Архіву не знайдено.'}</Text>
        <Pressable onPress={() => router.back()} style={[styles.backInline, { backgroundColor: theme.primary }]}>
          <Text style={[styles.backInlineText, { color: theme.background }]}>Назад до Хроніки</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const meta = getArchiveMeta(fragment)
  const keyPoints = fragment.theory?.screens.flatMap((screen) => screen.keyPoints ?? []) ?? []
  const summary = fragment.archiveDiscovery?.summary ?? fragment.theory?.recap ?? fragment.shortText

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}> 
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад до Хроніки"
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Запис Архіву</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.typePill, { backgroundColor: `${theme.primary}18`, borderColor: `${theme.primary}35` }]}> 
          <Ionicons name={meta.icon} size={15} color={theme.primary} />
          <Text style={[styles.typeText, { color: theme.primary }]}>{meta.label.toUpperCase()}</Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>{fragment.title}</Text>
        {fragment.subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{fragment.subtitle}</Text> : null}

        <View style={[styles.statusCard, { backgroundColor: `${theme.success}12`, borderColor: `${theme.success}45` }]}> 
          <Ionicons name="checkmark-circle" size={19} color={theme.success} />
          <View style={styles.statusBody}>
            <Text style={[styles.statusTitle, { color: theme.success }]}>Запис відновлено</Text>
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>Ти підтвердив цей фрагмент у Spark-виклику.</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({
            pathname: '/chronicle-theory/[fragmentId]',
            params: { fragmentId: fragment.id, chapterId: fragment.chapterId, review: 'true' },
          } as never)}
          style={({ pressed }) => [styles.reviewButton, { backgroundColor: theme.primary, opacity: pressed ? 0.82 : 1 }]}
        >
          <Ionicons name="book-outline" size={18} color={theme.background} />
          <Text style={[styles.reviewButtonText, { color: theme.background }]}>Перечитати теорію</Text>
        </Pressable>

        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
          <Text style={[styles.sectionKicker, { color: theme.primary }]}>ЩО САМЕ ВІДНОВЛЕНО</Text>
          {fragment.year ? <Text style={[styles.year, { color: theme.primary }]}>{fragment.year}</Text> : null}
          <Text style={[styles.summary, { color: theme.text }]}>{summary}</Text>
        </View>

        {keyPoints.length > 0 ? (
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Ключові опори</Text>
            {keyPoints.slice(0, 5).map((point) => (
              <View key={point} style={styles.pointRow}>
                <Ionicons name="checkmark-circle" size={17} color={theme.primary} />
                <Text style={[styles.pointText, { color: theme.textSecondary }]}>{point}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Твій слід у записі</Text>
          <View style={styles.statsRow}>
            <View style={[styles.stat, { backgroundColor: `${theme.primary}12` }]}> 
              <Text style={[styles.statValue, { color: theme.primary }]}>{recordStats.answered}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>відповідей</Text>
            </View>
            <View style={[styles.stat, { backgroundColor: `${theme.primary}12` }]}> 
              <Text style={[styles.statValue, { color: theme.primary }]}>{recordStats.accuracy === null ? '—' : `${recordStats.accuracy}%`}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>точність</Text>
            </View>
          </View>
        </View>

        {relatedRecords.length > 0 ? (
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Пов’язані записи</Text>
            <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Ці події й постаті допомагають зібрати повну картину епохи.</Text>
            {relatedRecords.map((record) => {
              const recordMeta = getArchiveMeta(record)
              return (
                <View key={record.id} style={[styles.relatedRow, { borderTopColor: theme.cardBorder }]}> 
                  <Ionicons name={recordMeta.icon} size={17} color={theme.primary} />
                  <View style={styles.relatedBody}>
                    <Text style={[styles.relatedTitle, { color: theme.text }]}>{record.title}</Text>
                    <Text style={[styles.relatedKind, { color: theme.textSecondary }]}>{recordMeta.label}{record.year ? ` · ${record.year}` : ''}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        ) : null}

        {fragment.theory?.sources?.length ? (
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}> 
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Джерела</Text>
            {fragment.theory.sources.map((source) => (
              <Pressable key={source.url} onPress={() => { void Linking.openURL(source.url) }} style={styles.sourceRow}>
                <Ionicons name="open-outline" size={16} color={theme.primary} />
                <Text style={[styles.sourceText, { color: theme.primary }]}>{source.title}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  errorText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  backInline: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
  backInlineText: { fontSize: 14, fontWeight: '900' },
  header: { minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '900', textAlign: 'center' },
  headerSpacer: { width: 40 },
  content: { padding: 20, paddingBottom: 44 },
  typePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  typeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  title: { fontSize: 31, lineHeight: 37, fontWeight: '900', marginTop: 12 },
  subtitle: { fontSize: 16, lineHeight: 23, marginTop: 8 },
  statusCard: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: 18, padding: 14, marginTop: 20 },
  statusBody: { flex: 1 },
  statusTitle: { fontSize: 14, fontWeight: '900' },
  statusText: { fontSize: 13, lineHeight: 19, marginTop: 3 },
  reviewButton: { minHeight: 52, borderRadius: 17, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  reviewButtonText: { fontSize: 15, fontWeight: '900' },
  summaryCard: { borderRadius: 22, borderWidth: 1, padding: 18, marginTop: 16 },
  sectionKicker: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  year: { fontSize: 15, fontWeight: '900', marginTop: 8 },
  summary: { fontSize: 16, lineHeight: 24, fontWeight: '700', marginTop: 10 },
  sectionCard: { borderRadius: 22, borderWidth: 1, padding: 18, marginTop: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '900' },
  sectionHint: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 12 },
  pointText: { flex: 1, fontSize: 14, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: { flex: 1, borderRadius: 16, paddingVertical: 13, alignItems: 'center' },
  statValue: { fontSize: 21, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  relatedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, marginTop: 12, borderTopWidth: 1 },
  relatedBody: { flex: 1 },
  relatedTitle: { fontSize: 14, fontWeight: '800' },
  relatedKind: { fontSize: 12, marginTop: 3 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12 },
  sourceText: { flex: 1, fontSize: 14, fontWeight: '800', lineHeight: 20 },
})
