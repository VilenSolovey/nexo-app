import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TheoryPage, TheoryReader } from '@nexo/components/Chronicle/TheoryReader'
import { NestorDialog } from '@nexo/components/Chronicle/NestorDialog'
import { getNestorDialogue, type NestorMode, type NestorMood } from '@nexo/utils/nestor-dialogue'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import { useFeedback } from '@nexo/contexts/FeedbackProvider'
import { getChapterChallengeSlots, getChapterFragments } from '@nexo/services/chronicle.service'
import {
  createChronicleChallengeQuiz,
  markChronicleFragmentRead,
} from '@nexo/services/chronicle-quiz.service'
import type { ChallengeSlot, ChronicleFragment } from '@nexo/types/chronicle.types'

type NestorPrompt = {
  title: string
  message: string
  primaryLabel: string
  mode: NestorMode
  mood: NestorMood
  onPrimary: () => void
}

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export default function ChronicleTheoryScreen() {
  const router = useRouter()
  const theme = useAppTheme()
  const { showToast } = useFeedback()
  const params = useLocalSearchParams<{
    fragmentId?: string | string[]
    chapterId?: string | string[]
    review?: string | string[]
  }>()
  const fragmentId = firstParam(params.fragmentId)
  const chapterId = firstParam(params.chapterId)
  const isReviewMode = firstParam(params.review) === 'true'
  const [fragment, setFragment] = useState<ChronicleFragment | null>(null)
  const [challengeSlot, setChallengeSlot] = useState<ChallengeSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [nestorPrompt, setNestorPrompt] = useState<NestorPrompt | null>(null)

  useEffect(() => {
    if (!chapterId || !fragmentId) return

    let active = true
    setLoading(true)
    setError(null)
    Promise.all([getChapterFragments(chapterId), getChapterChallengeSlots(chapterId)])
      .then(([items, slots]) => {
        if (!active) return
        const found = items.find((item) => item.id === fragmentId) ?? null
        setFragment(found)
        setChallengeSlot(
          slots.find((slot) =>
            slot.type !== 'trial_gate' && (slot.studyFragmentIds ?? []).includes(fragmentId),
          ) ?? null,
        )
        if (!found) setError('Фрагмент не знайдено.')
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Не вдалося завантажити теорію.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [chapterId, fragmentId])

  const completeTheory = async () => {
    if (isReviewMode) {
      router.back()
      return
    }

    if (!fragment || !chapterId || completing) return
    setCompleting(true)
    try {
      await markChronicleFragmentRead({ chapterId, fragmentId: fragment.id })

      if (!challengeSlot) {
        showToast({ type: 'success', message: 'Теорію позначено як прочитану.' })
        router.back()
        return
      }

      const createdQuiz = await createChronicleChallengeQuiz({
        chapterId,
        slotId: challengeSlot.id,
      })

      router.replace({
        pathname: '/(tabs)/quiz',
        params: { focusQuiz: createdQuiz.quizId },
      } as never)
    } catch (completeError: unknown) {
      showToast({
        type: 'error',
        message: completeError instanceof Error ? completeError.message : 'Не вдалося зберегти прогрес.',
      })
    } finally {
      setCompleting(false)
    }
  }

  const requestCompletion = () => {
    if (isReviewMode) {
      router.back()
      return
    }

    if (completing) return

    const canCreateSpark = Boolean(challengeSlot)
    const dialogue = getNestorDialogue(
      'theory_completed',
      { recordTitle: fragment?.title },
    )

    setNestorPrompt({
      ...dialogue,
      mode: canCreateSpark ? dialogue.mode : 'archive',
      mood: canCreateSpark ? dialogue.mood : 'neutral',
      primaryLabel: canCreateSpark ? 'Створити Spark' : 'Зберегти запис',
      onPrimary: () => { void completeTheory() },
    })
  }

  const renderNestorDialog = () => nestorPrompt ? (
    <NestorDialog
      visible
      title={nestorPrompt.title}
      message={nestorPrompt.message}
      primaryLabel={nestorPrompt.primaryLabel}
      mode={nestorPrompt.mode}
      mood={nestorPrompt.mood}
      onPrimary={nestorPrompt.onPrimary}
      onDismiss={() => setNestorPrompt(null)}
      secondaryLabel="Повернутися до запису"
    />
  ) : null

  if (loading) {
    return (
      <SafeAreaView style={[styles.state, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.state, { backgroundColor: theme.background }]}>
        <Text style={[styles.message, { color: theme.textSecondary }]}>{error ?? 'Чернетку фрагмента не знайдено.'}</Text>
      </SafeAreaView>
    )
  }

  if (!fragment) return null
  const theory = fragment.theory
  const pages: TheoryPage[] = theory?.screens?.length
    ? theory.screens
    : [{
        id: fragment.id,
        title: fragment.title,
        body: fragment.fullText ?? fragment.shortText,
      }]

  return (
    <>
      <TheoryReader
        eyebrow={fragment.year ? `Хроніка · ${fragment.year}` : 'Хроніка Nexo'}
        title={fragment.title}
        subtitle={fragment.subtitle}
        intro={theory?.intro}
        pages={pages}
        recap={theory?.recap}
        actionLabel={isReviewMode ? 'Повернутися до запису' : challengeSlot ? 'Створити Spark' : 'Позначити прочитаним'}
        onBack={() => router.back()}
        onComplete={requestCompletion}
        completing={completing}
      />
      {renderNestorDialog()}
    </>
  )
}

const styles = StyleSheet.create({
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
})
