import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'

export type TheoryPage = {
  id: string
  title: string
  body: string
  keyPoints?: string[]
}

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  intro?: string
  recap?: string
  pages: TheoryPage[]
  actionLabel: string
  onBack: () => void
  onComplete: () => void
  completing?: boolean
}

export function TheoryReader({
  eyebrow = 'Архівна справа',
  title,
  subtitle,
  intro,
  recap,
  pages,
  actionLabel,
  onBack,
  onComplete,
  completing = false,
}: Props) {
  const theme = useAppTheme()
  const [pageIndex, setPageIndex] = useState(0)
  const page = pages[pageIndex]
  const isLastPage = pageIndex === pages.length - 1
  const progress = useMemo(
    () => (pages.length ? ((pageIndex + 1) / pages.length) * 100 : 0),
    [pageIndex, pages.length],
  )

  const handlePrimaryAction = () => {
    if (!isLastPage) {
      setPageIndex((current) => current + 1)
      return
    }
    onComplete()
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад до хроніки"
          hitSlop={10}
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={styles.headerMeta}>
            <Ionicons name="book-outline" size={14} color={theme.primary} />
            <View style={[styles.stepTrack, { backgroundColor: `${theme.primary}20` }]}>
              <View style={[styles.stepFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
            </View>
          </View>
          <TheoryText color={theme.textSecondary} style={styles.stepText}>Теорія · {pageIndex + 1}/{pages.length}</TheoryText>
        </View>
        <View style={[styles.pageCounter, { backgroundColor: `${theme.primary}18` }]}>
          <TheoryText color={theme.primary} style={styles.counterText}>{pageIndex + 1}/{pages.length}</TheoryText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.chapterPill, { backgroundColor: `${theme.primary}18` }]}>
          <Ionicons name="file-tray-outline" size={15} color={theme.primary} />
          <TheoryText color={theme.primary} style={styles.pillText}>АРХІВ ЕПОХИ</TheoryText>
        </View>
        <TheoryText color={theme.primary}>{eyebrow}</TheoryText>
        <TheoryText color={theme.text} style={styles.fragmentTitle}>{title}</TheoryText>
        {subtitle ? <TheoryText color={theme.textSecondary} style={styles.subtitle}>{subtitle}</TheoryText> : null}

        <View style={[styles.pageCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <TheoryText color={theme.primary} style={styles.pageKicker}>СТОРІНКА {pageIndex + 1} З {pages.length}</TheoryText>
          <TheoryText color={theme.text} style={styles.pageTitle}>{page?.title}</TheoryText>
          {pageIndex === 0 && intro ? <TheoryText color={theme.textSecondary} style={styles.intro}>{intro}</TheoryText> : null}
          <TheoryText color={theme.textSecondary} style={styles.body}>{page?.body}</TheoryText>

          {page?.keyPoints?.length ? (
            <View style={[styles.keyPoints, { backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}36` }]}>
              <TheoryText color={theme.text} style={styles.keyPointsTitle}>Зафіксуй головне</TheoryText>
              {page.keyPoints.map((point) => (
                <View key={point} style={styles.keyPointRow}>
                  <Ionicons name="checkmark-circle" size={17} color={theme.primary} />
                  <TheoryText color={theme.textSecondary} style={styles.keyPointText}>{point}</TheoryText>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {isLastPage && recap ? (
          <View style={styles.finalNotes}>
            <View style={[styles.recapCard, { backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}32` }]}>
              <View style={styles.recapTitleRow}>
                <Ionicons name="sparkles-outline" size={17} color={theme.primary} />
                <TheoryText color={theme.primary} style={styles.recapKicker}>АРХІВ ВІДНОВЛЕНО</TheoryText>
              </View>
              <TheoryText color={theme.text} style={styles.recapText}>{recap}</TheoryText>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.cardBorder }]}>
        <Pressable
          accessibilityRole="button"
          disabled={completing}
          onPress={handlePrimaryAction}
          style={({ pressed }) => [
            styles.primaryAction,
            { backgroundColor: theme.primary, opacity: pressed || completing ? 0.78 : 1 },
          ]}
        >
          <TheoryText color={theme.background} style={styles.primaryActionText}>
            {completing ? 'Зберігаємо...' : isLastPage ? actionLabel : 'Наступна сторінка'}
          </TheoryText>
          <Ionicons name={isLastPage ? 'flash-outline' : 'arrow-forward'} size={18} color={theme.background} />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

function TheoryText({
  color,
  style,
  children,
}: {
  color: string
  style?: StyleProp<TextStyle>
  children: React.ReactNode
}) {
  return <Text style={[{ color }, style]}>{children}</Text>
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerTitle: { flex: 1 },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepTrack: { height: 5, flex: 1, borderRadius: 99, overflow: 'hidden' },
  stepFill: { height: '100%', borderRadius: 99 },
  stepText: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  pageCounter: { minWidth: 42, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  counterText: { fontSize: 12, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 124 },
  chapterPill: { alignSelf: 'flex-start', flexDirection: 'row', gap: 7, alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.7 },
  fragmentTitle: { fontSize: 29, lineHeight: 35, fontWeight: '900', marginTop: 7 },
  subtitle: { fontSize: 15, lineHeight: 21, marginTop: 8 },
  pageCard: { borderRadius: 22, borderWidth: 1, padding: 18, marginTop: 22 },
  pageKicker: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  pageTitle: { fontSize: 23, lineHeight: 29, fontWeight: '900', marginTop: 8 },
  intro: { fontSize: 15, lineHeight: 22, marginTop: 14, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 25, marginTop: 15 },
  keyPoints: { borderRadius: 16, borderWidth: 1, padding: 14, marginTop: 20, gap: 10 },
  keyPointsTitle: { fontSize: 14, fontWeight: '900' },
  keyPointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  keyPointText: { flex: 1, fontSize: 14, lineHeight: 20 },
  finalNotes: { gap: 12, marginTop: 14 },
  recapCard: { borderRadius: 18, borderWidth: 1, padding: 15 },
  recapTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  recapKicker: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  recapText: { fontSize: 14, lineHeight: 21, marginTop: 9, fontWeight: '700' },
  footer: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 13, paddingBottom: 20 },
  primaryAction: { height: 52, borderRadius: 16, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { fontSize: 15, fontWeight: '900' },
})
