import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { NestorDialog } from '@nexo/components/Chronicle/NestorDialog'
import { FullScreenState } from '@nexo/components/FullScreenState/FullScreenState'
import { Entrance } from '@nexo/components/Motion/Entrance'
import { ResultActions } from '@nexo/components/Quiz/Result/ResultActions'
import { ResultBanner } from '@nexo/components/Quiz/Result/ResultBanner'
import { ResultHero } from '@nexo/components/Quiz/Result/ResultHero'
import {
  Container,
  SafeArea,
  ScrollContent,
} from '@nexo/components/Quiz/Result/QuizResult.styled'
import { RewardsSummaryCard } from '@nexo/components/Quiz/Result/RewardsSummaryCard'
import { ScoreSummaryCard } from '@nexo/components/Quiz/Result/ScoreSummaryCard'
import { Theme } from '@nexo/constants/theme'
import { useAuth } from '@nexo/contexts/AuthProvider'
import {
  finalizeQuizAttempt,
  type FinalizedQuizAttempt,
} from '@nexo/services/quiz-attempt.service'
import { registerDailyActivity } from '@nexo/services/user.service'
import { getNestorDialogue } from '@nexo/utils/nestor-dialogue'
import { formatChronicleDiscoveryReadyAt } from '@nexo/utils/chronicle-route'
import { PERFECT_QUIZ_SCORE } from '@nexo/utils/quiz-progress'

type SubmissionStatus = 'saving' | 'saved' | 'error'

function firstString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0]?.trim() || null
  return value?.trim() || null
}

function parseAnswersParam(value: string | string[] | undefined): Record<string, unknown> | null {
  const raw = firstString(value)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null
  } catch {
    return null
  }
}

function parseNonNegativeNumber(value: string | string[] | undefined): number {
  const parsed = Number(firstString(value) ?? 0)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function getResultCopy(percentage: number) {
  if (percentage === 100) {
    return {
      emoji: '🏆',
      title: 'Ідеально!',
      message: 'Ви відповіли на всі питання правильно! Ви справжній експерт!',
    }
  }
  if (percentage >= 80) {
    return {
      emoji: '🌟',
      title: 'Чудово!',
      message: 'Відмінний результат! Продовжуйте в тому ж дусі!',
    }
  }
  if (percentage >= 60) {
    return {
      emoji: '👍',
      title: 'Добре!',
      message: 'Хороша робота! Можна і краще, але це вже успіх!',
    }
  }
  return {
    emoji: '💪',
    title: 'Спробуй ще раз!',
    message: 'Не засмучуйтесь! Практика робить майстра. Спробуйте ще раз!',
  }
}

export default function QuizResultScreen() {
  const params = useLocalSearchParams<{
    quizId?: string | string[]
    sessionId?: string | string[]
    answers?: string | string[]
    timeExpired?: string | string[]
    quitEarly?: string | string[]
    timeSpent?: string | string[]
    backgroundCount?: string | string[]
    backgroundDurationMs?: string | string[]
  }>()
  const router = useRouter()
  const { userId, refreshUserProfile } = useAuth()
  const quizId = firstString(params.quizId)
  const sessionId = firstString(params.sessionId)
  const isTimeExpired = firstString(params.timeExpired) === 'true'
  const isQuitEarly = firstString(params.quitEarly) === 'true'
  const answersParam = firstString(params.answers)
  const answers = useMemo(
    () => parseAnswersParam(answersParam ?? undefined),
    [answersParam],
  )
  const timeSpent = parseNonNegativeNumber(params.timeSpent)
  const backgroundCount = parseNonNegativeNumber(params.backgroundCount)
  const backgroundDurationMs = parseNonNegativeNumber(params.backgroundDurationMs)
  const hasSubmissionInput = Boolean(userId && quizId && sessionId && answers)
  const [status, setStatus] = useState<SubmissionStatus>(
    hasSubmissionInput ? 'saving' : 'error',
  )
  const [error, setError] = useState<string | null>(
    hasSubmissionInput
      ? null
      : 'Не вистачає даних завершеної сесії. Поверніться до списку вікторин.',
  )
  const [result, setResult] = useState<FinalizedQuizAttempt | null>(null)
  const [nestorVisible, setNestorVisible] = useState(false)
  const submissionInFlightRef = useRef(false)

  const submitResult = useCallback(async () => {
    if (submissionInFlightRef.current) return
    if (!userId || !quizId || !sessionId || !answers) {
      setError('Не вистачає даних завершеної сесії. Поверніться до списку вікторин.')
      setStatus('error')
      return
    }

    submissionInFlightRef.current = true
    setStatus('saving')
    setError(null)

    try {
      const finalized = await finalizeQuizAttempt({
        quizId,
        sessionId,
        answers,
        timeExpired: isTimeExpired,
        quitEarly: isQuitEarly,
        timeSpent,
        backgroundCount,
        backgroundDurationMs,
      })

      setResult(finalized)
      setStatus('saved')

      try {
        await registerDailyActivity(userId)
        await refreshUserProfile({ showLevelUp: finalized.passed })
      } catch (profileError) {
        console.error('Result saved, but profile refresh failed:', profileError)
      }

      if (finalized.source === 'chronicle') {
        setNestorVisible(true)
      }
    } catch (submissionError: any) {
      console.error('Failed to finalize quiz attempt:', submissionError)
      setError(submissionError?.message ?? 'Не вдалося зберегти результат.')
      setStatus('error')
    } finally {
      submissionInFlightRef.current = false
    }
  }, [
    answers,
    backgroundCount,
    backgroundDurationMs,
    isQuitEarly,
    isTimeExpired,
    quizId,
    refreshUserProfile,
    sessionId,
    timeSpent,
    userId,
  ])

  useEffect(() => {
    void submitResult()
  }, [submitResult])

  if (status === 'saving') {
    return (
      <FullScreenState
        variant="loading"
        title="Зберігаємо результат"
        description="Перевіряємо відповіді та оновлюємо прогрес."
      />
    )
  }

  if (status === 'error' || !result) {
    return (
      <FullScreenState
        variant="error"
        title="Не вдалося зберегти результат"
        description={error ?? 'Перевірте з’єднання та спробуйте ще раз.'}
        actionLabel={hasSubmissionInput ? 'Спробувати ще раз' : 'До вікторин'}
        onAction={hasSubmissionInput
          ? () => { void submitResult() }
          : () => router.replace('/quiz')}
      />
    )
  }

  const copy = getResultCopy(result.percentage)
  const hasPerfectScore = result.percentage >= PERFECT_QUIZ_SCORE
  const isReducedReward = result.attempt > 1
  const boostedCoinsBase = result.baseCoins * result.coinsBoostMultiplier
  const boostedExpBase = result.baseExp * result.expBoostMultiplier
  const chronicleOutcome = result.chronicleOutcome
  const chronicleNextAction = chronicleOutcome?.nextAction as string | undefined
  const isSparkRetryReady = chronicleNextAction === 'spark_retry'
  const nestorEvent = chronicleNextAction === 'spark_retry'
    ? 'challenge_retry_ready'
    : !result.passed
    ? 'challenge_failed'
    : chronicleNextAction === 'discovery_search'
      ? 'discovery_search_started'
      : chronicleNextAction === 'reconstruction'
        ? 'reconstruction_ready'
        : chronicleNextAction === 'trial'
          ? 'trial_ready'
        : chronicleNextAction === 'chapter_completed'
            ? 'chapter_completed'
            : 'challenge_passed'
  const nestorDialogue = getNestorDialogue(nestorEvent, {
    readyAtLabel: formatChronicleDiscoveryReadyAt(
      chronicleOutcome?.discovery?.readyAt,
    ) ?? undefined,
  })

  return (
    <Container colors={[Theme.background, Theme.card]}>
      <SafeArea>
        <ScrollContent>
          {isTimeExpired ? (
            <Entrance index={0}>
              <ResultBanner
                variant="time"
                icon="time-outline"
                text="Час вийшов! Ось скільки ви встигли"
              />
            </Entrance>
          ) : null}

          {isQuitEarly ? (
            <Entrance index={0}>
              <ResultBanner
                variant="attempt"
                icon="exit-outline"
                text="Ви завершили квіз достроково. Спроба зарахована, але нагорода не нараховується."
              />
            </Entrance>
          ) : null}

          {isReducedReward ? (
            <Entrance index={1}>
              <ResultBanner
                variant="attempt"
                icon="information-circle-outline"
                text={`Спроба ${result.attempt} — нагорода зменшена до ${Math.round(result.rewardMultiplier * 100)}%`}
              />
            </Entrance>
          ) : null}

          {result.attempt === 1 ? (
            <Entrance index={1}>
              <ResultBanner
                variant="attempt"
                icon="ribbon-outline"
                iconColor={Theme.primary}
                text="Нагорода нараховується лише за успішне проходження"
              />
            </Entrance>
          ) : null}

          {result.mastered ? (
            <Entrance index={2}>
              <ResultBanner
                variant="mastered"
                icon={isSparkRetryReady ? 'refresh-circle-outline' : 'trophy'}
                text={isSparkRetryReady
                  ? 'Спроби вичерпано. Spark можна створити повторно з Хроніки.'
                  : hasPerfectScore
                  ? 'Квіз завершено! Набрано 100%.'
                  : `Квіз завершено! Використано ${result.maxAttempts} спроби.`}
              />
            </Entrance>
          ) : null}

          <Entrance index={3}>
            <ResultHero
              emoji={copy.emoji}
              title={copy.title}
              message={copy.message}
            />
          </Entrance>

          <Entrance index={4}>
            <ScoreSummaryCard
              percentage={result.percentage}
              correctCount={result.correctCount}
              totalCount={result.totalCount}
            />
          </Entrance>

          {result.passed ? (
            <Entrance index={5}>
              <RewardsSummaryCard
                coins={result.earnedCoins}
                exp={result.earnedExp}
                originalCoins={boostedCoinsBase}
                originalExp={boostedExpBase}
                isReducedReward={isReducedReward}
              />
            </Entrance>
          ) : null}

          <Entrance index={6}>
            <ResultActions
              canRetake={result.canRetake}
              retryLabel={result.attempt === 1 ? 'Навчальна перездача' : 'Спробувати ще раз'}
              onRetry={() => router.replace(`/quiz-play/${result.quizId}` as never)}
              onHome={() => router.replace('/(tabs)')}
            />
          </Entrance>
        </ScrollContent>

        <NestorDialog
          visible={nestorVisible}
          title={nestorDialogue.title}
          message={nestorDialogue.message}
          primaryLabel="Зрозуміло"
          mode={nestorDialogue.mode}
          mood={nestorDialogue.mood}
          onPrimary={() => undefined}
          onDismiss={() => setNestorVisible(false)}
        />
      </SafeArea>
    </Container>
  )
}
