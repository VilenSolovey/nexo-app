import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Modal, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Timestamp } from 'firebase/firestore'
import { useFocusEffect } from '@react-navigation/native'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { useFeedback } from '@nexo/contexts/FeedbackProvider'
import {
  getChronicleChapters,
  getChapterChallengeSlots,
  getChapterFragments,
  getUserChapterProgress,
  getUserChapterProgressList,
  getUserChallengeProgressList,
  getUserFragmentProgressList,
} from '@nexo/services/chronicle.service'
import { createChronicleChallengeQuiz } from '@nexo/services/chronicle-quiz.service'
import type {
  ChallengeSlot,
  ChronicleChapter,
  ChronicleFragment,
  UserChapterProgress,
  UserChallengeProgress,
  UserFragmentProgress,
} from '@nexo/types/chronicle.types'
import {
  ChallengeBody,
  ChallengeDescription,
  ChallengeMetaRow,
  CloseButton,
  EmptyText,
  EraNav,
  EraNavButton,
  EraNavCenter,
  EraNavText,
  Eyebrow,
  FragmentCard,
  FragmentHeader,
  FragmentSubtitle,
  FragmentText,
  FragmentTitle,
  FragmentYear,
  Header,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Panel,
  PanelHeader,
  PanelTitle,
  Pill,
  PillText,
  PrimaryButton,
  PrimaryButtonText,
  ProgressGrid,
  ProgressItem,
  ProgressLabel,
  ProgressValue,
  SafeArea,
  ScreenGradient,
  ScrollContent,
  Subtitle,
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineLine,
  TimelineRail,
  Title,
} from '@nexo/components/Chronicle/Chronicle.styled'

type FragmentStatus = 'locked' | 'current' | 'unlocked' | 'mastered'

function toDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (value instanceof Timestamp) return value.toDate()
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate()
  }
  return null
}

function formatDate(value: unknown) {
  const date = toDate(value)
  if (!date) return null
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
}

function isChallengeProgressCompleted(progress: UserChallengeProgress | null | undefined) {
  return progress?.status === 'completed' || progress?.status === 'archived'
}

function isSlotOpen(slot: ChallengeSlot) {
  const now = Date.now()
  const opensAt = toDate(slot.opensAt)?.getTime() ?? 0
  const closesAt = toDate(slot.closesAt)?.getTime() ?? Number.POSITIVE_INFINITY
  return opensAt <= now && closesAt >= now
}

function getFragmentStatus(params: {
  fragment: ChronicleFragment
  progress?: UserFragmentProgress
  targetFragmentIds: Set<string>
  firstFragmentId?: string
}): FragmentStatus {
  if (params.progress?.mastered) return 'mastered'
  if (params.progress?.unlocked) return 'unlocked'
  if (params.targetFragmentIds.has(params.fragment.id)) return 'current'
  if (params.fragment.id === params.firstFragmentId) return 'current'
  return 'locked'
}

export default function ChronicleScreen() {
  const Theme = useAppTheme()
  const router = useRouter()
  const { userId } = useAuth()
  const { showModal, showToast } = useFeedback()

  const [chapters, setChapters] = useState<ChronicleChapter[]>([])
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0)
  const [chapter, setChapter] = useState<ChronicleChapter | null>(null)
  const [fragments, setFragments] = useState<ChronicleFragment[]>([])
  const [slots, setSlots] = useState<ChallengeSlot[]>([])
  const [progressList, setProgressList] = useState<UserFragmentProgress[]>([])
  const [challengeProgressList, setChallengeProgressList] = useState<UserChallengeProgress[]>([])
  const [chapterProgress, setChapterProgress] = useState<UserChapterProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [startingChallenge, setStartingChallenge] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFragment, setSelectedFragment] = useState<ChronicleFragment | null>(null)
  const didAutoFocusChapterRef = useRef(false)

  const progressMap = useMemo(
    () => new Map(progressList.map((progress) => [progress.fragmentId, progress])),
    [progressList],
  )

  const challengeProgressMap = useMemo(
    () => new Map(challengeProgressList.map((progress) => [progress.slotId, progress])),
    [challengeProgressList],
  )

  const masteredCount = progressList.filter((progress) => progress.mastered).length
  const unlockedCount = progressList.filter((progress) => progress.unlocked).length
  const answeredCount = progressList.reduce((sum, progress) => sum + Number(progress.answered ?? 0), 0)
  const correctCount = progressList.reduce((sum, progress) => sum + Number(progress.correct ?? 0), 0)
  const requiredUnlocked = chapter?.trialUnlockRule.requiredUnlockedFragments ?? 0
  const requiredMastered = chapter?.trialUnlockRule.requiredMasteredFragments ?? 0
  const requiredAnswered = chapter?.trialUnlockRule.minAnsweredQuestions ?? 0
  const requiredAccuracy = chapter?.trialUnlockRule.minAccuracyPercent ?? 0
  const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
  const unlockedRequirementMet = requiredUnlocked <= 0 || unlockedCount >= requiredUnlocked
  const masteredRequirementMet = requiredMastered <= 0 || masteredCount >= requiredMastered
  const trialReady =
    unlockedRequirementMet &&
    masteredRequirementMet &&
    answeredCount >= requiredAnswered &&
    accuracyPercent >= requiredAccuracy
  const chapterCompleted = Boolean(chapterProgress?.completed || chapterProgress?.status === 'completed')
  const completedTrialScore =
    chapterProgress?.trialBestScore ??
    chapterProgress?.trialScore ??
    null

  const activeSlot = useMemo(() => {
    const openSlots = slots.filter(isSlotOpen)
    const visibleOpenSlots = trialReady
      ? openSlots
      : openSlots.filter((slot) => slot.type !== 'trial_gate')
    const trialSlot = visibleOpenSlots.find((slot) => slot.type === 'trial_gate')
    const nextUnfinishedOpenSlot = visibleOpenSlots.find((slot) =>
      !isChallengeProgressCompleted(challengeProgressMap.get(slot.id)),
    )
    const nextPracticeSlot = visibleOpenSlots.find((slot) =>
      slot.type !== 'trial_gate' && !isChallengeProgressCompleted(challengeProgressMap.get(slot.id)),
    )

    if (trialReady && trialSlot) return trialSlot

    return nextPracticeSlot ?? nextUnfinishedOpenSlot ?? visibleOpenSlots[0] ?? slots[0] ?? null
  }, [challengeProgressMap, slots, trialReady])

  const activeSlotProgress = activeSlot ? challengeProgressMap.get(activeSlot.id) ?? null : null
  const activeSlotOpen = activeSlot ? isSlotOpen(activeSlot) : false
  const activeSlotCompleted = isChallengeProgressCompleted(activeSlotProgress)
  const activeSlotAlreadyCreated = Boolean(activeSlotProgress?.quizId)

  const targetFragmentIds = useMemo(
    () => new Set(activeSlot?.targetFragmentIds ?? []),
    [activeSlot?.targetFragmentIds],
  )

  const loadChronicle = useCallback(async () => {
    setError(null)

    try {
      const nextChapters = await getChronicleChapters()
      setChapters(nextChapters)
      const chapterProgressRows = userId
        ? await getUserChapterProgressList(userId).catch(() => [])
        : []
      const chapterProgressMap = new Map(
        chapterProgressRows.map((progress) => [progress.chapterId, progress]),
      )
      const firstUnfinishedActiveIndex = nextChapters.findIndex((item) => {
        const progress = chapterProgressMap.get(item.id)
        const completed = progress?.completed || progress?.status === 'completed'

        return item.isActive !== false && !completed
      })

      const fallbackChapterIndex = nextChapters.length > 0
        ? Math.max(0, nextChapters.length - 1)
        : 0
      const autoChapterIndex = firstUnfinishedActiveIndex >= 0
        ? firstUnfinishedActiveIndex
        : fallbackChapterIndex
      const requestedChapterIndex = !didAutoFocusChapterRef.current
        ? autoChapterIndex
        : selectedChapterIndex
      const safeChapterIndex = nextChapters.length > 0
        ? Math.min(requestedChapterIndex, nextChapters.length - 1)
        : 0

      if (!didAutoFocusChapterRef.current) {
        didAutoFocusChapterRef.current = true
        setSelectedChapterIndex(safeChapterIndex)
      }

      const nextChapter = nextChapters[safeChapterIndex] ?? null
      setChapter(nextChapter)

      if (!nextChapter) {
        setFragments([])
        setSlots([])
        setProgressList([])
        setChallengeProgressList([])
        setChapterProgress(null)
        return
      }

      const [
        nextFragments,
        nextSlots,
        nextProgress,
        nextChallengeProgress,
        nextChapterProgress,
      ] = await Promise.all([
        getChapterFragments(nextChapter.id),
        getChapterChallengeSlots(nextChapter.id),
        userId ? getUserFragmentProgressList(userId, nextChapter.id) : Promise.resolve([]),
        userId
          ? getUserChallengeProgressList(userId, nextChapter.id).catch(() => [])
          : Promise.resolve([]),
        userId
          ? getUserChapterProgress(userId, nextChapter.id).catch(() => null)
          : Promise.resolve(null),
      ])

      setFragments(nextFragments)
      setSlots(nextSlots)
      setProgressList(nextProgress)
      setChallengeProgressList(nextChallengeProgress)
      setChapterProgress(nextChapterProgress)
    } catch (loadError: any) {
      setError(loadError?.message ?? 'Не вдалося завантажити Хроніку')
    } finally {
      setLoading(false)
    }
  }, [selectedChapterIndex, userId])

  useEffect(() => {
    didAutoFocusChapterRef.current = false
    setSelectedChapterIndex(0)
  }, [userId])

  useEffect(() => {
    loadChronicle()
  }, [loadChronicle])

  useFocusEffect(
    useCallback(() => {
      loadChronicle()
    }, [loadChronicle]),
  )

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadChronicle()
    } finally {
      setRefreshing(false)
    }
  }

  const selectPreviousChapter = () => {
    didAutoFocusChapterRef.current = true
    setSelectedChapterIndex((current) => Math.max(0, current - 1))
  }

  const selectNextChapter = () => {
    didAutoFocusChapterRef.current = true
    setSelectedChapterIndex((current) => Math.min(chapters.length - 1, current + 1))
  }

  const handleStartChallenge = async () => {
    if (!chapter) return

    if (!userId) {
      showModal({
        type: 'warning',
        title: 'Потрібен вхід',
        message: 'Увійдіть в акаунт, щоб почати виклик хроніки.',
      })
      return
    }

    if (!activeSlot) {
      showToast({
        type: 'warning',
        message: 'Для цієї епохи поки не відкрито жодного виклику.',
      })
      return
    }

    if (!activeSlotOpen) {
      showToast({
        type: 'warning',
        message: 'Цей виклик стане доступним пізніше.',
      })
      return
    }

    if (activeSlotAlreadyCreated) {
      const completedTitle = activeSlotIsTrial ? 'Trial завершено' : 'Виклик завершено'
      const createdTitle = activeSlotIsTrial ? 'Trial уже створено' : 'Виклик уже створено'

      showModal({
        type: activeSlotCompleted ? 'success' : 'info',
        title: activeSlotCompleted ? completedTitle : createdTitle,
        message:
        activeSlotCompleted
          ? activeSlotIsTrial
            ? 'Цю епоху завершено. Підсумок Trial залишиться на сторінці Хроніки.'
            : 'Наступний виклик зʼявиться, коли відкриється новий слот хроніки.'
          : activeSlotIsTrial
            ? 'Trial уже чекає на сторінці Вікторини.'
            : 'Він уже чекає на сторінці Вікторини.',
        primaryAction: activeSlotCompleted
          ? { label: 'Зрозуміло' }
          : { label: 'До вікторин', onPress: () => router.push('/quiz') },
        secondaryAction: activeSlotCompleted ? undefined : { label: 'Залишитись' },
      })
      return
    }

    setStartingChallenge(true)

    try {
      const createdQuiz = await createChronicleChallengeQuiz({
        chapterId: chapter.id,
        slotId: activeSlot.id,
      })

      await loadChronicle()
      setChallengeProgressList((prev) => [
        ...prev.filter((progress) => progress.slotId !== activeSlot.id),
        {
          userId,
          chapterId: chapter.id,
          slotId: activeSlot.id,
          quizId: createdQuiz.quizId,
          status: 'created',
          attemptsUsed: 0,
          maxAttempts: activeSlot.maxAttempts ?? 3,
        },
      ])

      showModal({
        type: createdQuiz.alreadyCreated ? 'info' : 'success',
        title: createdQuiz.alreadyCreated ? 'Виклик уже створено' : 'Виклик створено',
        message: 'Він зʼявився на сторінці Вікторини. Пройдіть його тоді, коли будете готові.',
        primaryAction: { label: 'До вікторин', onPress: () => router.push('/quiz') },
        secondaryAction: { label: 'Залишитись' },
      })
    } catch (startError: any) {
      const code = startError?.code ? String(startError.code) : ''

      showModal({
        type: 'error',
        title: code.includes('permission-denied') ? 'Тестовий доступ не відкрито' : 'Не вдалося створити виклик',
        message: code.includes('permission-denied')
          ? 'Додайте Firebase Auth UID цього користувача в functionTesters, і виклик запрацює.'
          : startError?.message ?? 'Спробуйте ще раз трохи пізніше.',
      })
    } finally {
      setStartingChallenge(false)
    }
  }

  const openFragment = (fragment: ChronicleFragment, status: FragmentStatus) => {
    if (status === 'locked') {
      showToast({
        type: 'info',
        message: 'Фрагмент відкриється після проходження повʼязаного виклику.',
      })
      return
    }

    setSelectedFragment(fragment)
  }

  const firstFragmentId = fragments[0]?.id
  const closeDate = activeSlot?.closesAt ? formatDate(activeSlot.closesAt) : null
  const activeSlotIsTrial = activeSlot?.type === 'trial_gate'
  const activeTrialLocked = Boolean(activeSlotIsTrial && !trialReady)
  const startButtonDisabled = startingChallenge || !activeSlotOpen || activeSlotAlreadyCreated || activeTrialLocked
  const startButtonMuted = !activeSlotOpen || activeSlotAlreadyCreated || activeTrialLocked
  const trialScore = activeSlotCompleted
    ? activeSlotProgress?.bestScore ?? activeSlotProgress?.lastScore ?? null
    : null
  const startButtonText = startingChallenge
    ? 'Створюємо...'
    : activeSlotCompleted
      ? activeSlotIsTrial ? 'Trial завершено' : 'Очікування наступного виклику'
      : activeSlotAlreadyCreated
      ? activeSlotIsTrial ? 'Trial уже у вікторинах' : 'Виклик уже у вікторинах'
      : activeTrialLocked
      ? 'Trial ще не відкрито'
      : activeSlotOpen
        ? activeSlotIsTrial ? 'Створити Trial' : 'Створити виклик'
        : 'Виклик ще не відкрито'

  return (
    <ScreenGradient colors={[Theme.background, Theme.card]}>
      <SafeArea>
        <ScrollContent
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Theme.primary}
              colors={[Theme.primary]}
            />
          }
        >
          <Header>
            <Eyebrow>Хроніка Nexo</Eyebrow>
            <Title>{chapterCompleted ? 'Архів епохи' : 'Історична мапа'}</Title>
            <Subtitle>
              {chapterCompleted
                ? 'Переглядайте підсумок завершеної епохи та відкриті фрагменти.'
                : 'Відкривайте фрагменти епохи через короткі виклики та поступово наближайтесь до Trial.'}
            </Subtitle>
          </Header>

          {loading ? (
            <EmptyText>Завантажується хроніка...</EmptyText>
          ) : error ? (
            <EmptyText>Помилка: {error}</EmptyText>
          ) : !chapter ? (
            <EmptyText>Поки немає активної епохи. Спочатку залийте chronicle seed у Firestore.</EmptyText>
          ) : (
            <>
              {chapters.length > 1 && (
                <EraNav>
                  <EraNavButton
                    onPress={selectPreviousChapter}
                    disabled={selectedChapterIndex === 0}
                    $disabled={selectedChapterIndex === 0}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={22}
                      color={selectedChapterIndex === 0 ? Theme.textSecondary : Theme.primary}
                    />
                  </EraNavButton>
                  <EraNavCenter>
                    <EraNavText>
                      Епоха {selectedChapterIndex + 1} з {chapters.length}
                    </EraNavText>
                  </EraNavCenter>
                  <EraNavButton
                    onPress={selectNextChapter}
                    disabled={selectedChapterIndex >= chapters.length - 1}
                    $disabled={selectedChapterIndex >= chapters.length - 1}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={selectedChapterIndex >= chapters.length - 1 ? Theme.textSecondary : Theme.primary}
                    />
                  </EraNavButton>
                </EraNav>
              )}

              <Panel>
                <PanelHeader>
                  <PanelTitle>{chapter.title}</PanelTitle>
                  <Pill $variant={chapterCompleted || trialReady ? 'success' : 'primary'}>
                    <PillText $variant={chapterCompleted || trialReady ? 'success' : 'primary'}>
                      {chapterCompleted ? 'Епоху завершено' : trialReady ? 'Trial відкрито' : 'Епоха активна'}
                    </PillText>
                  </Pill>
                </PanelHeader>
                <Subtitle>{chapter.description}</Subtitle>
              </Panel>

              {chapterCompleted && (
                <Panel>
                  <PanelHeader>
                    <PanelTitle>Підсумок епохи</PanelTitle>
                    <Ionicons name="trophy-outline" size={22} color={Theme.success} />
                  </PanelHeader>
                  <ProgressGrid>
                    <ProgressItem>
                      <ProgressValue>{completedTrialScore ?? 0}%</ProgressValue>
                      <ProgressLabel>Trial</ProgressLabel>
                    </ProgressItem>
                    <ProgressItem>
                      <ProgressValue>{unlockedCount}/{fragments.length}</ProgressValue>
                      <ProgressLabel>відкрито</ProgressLabel>
                    </ProgressItem>
                    <ProgressItem>
                      <ProgressValue>{masteredCount}</ProgressValue>
                      <ProgressLabel>засвоєно</ProgressLabel>
                    </ProgressItem>
                    <ProgressItem>
                      <ProgressValue>{accuracyPercent}%</ProgressValue>
                      <ProgressLabel>точність</ProgressLabel>
                    </ProgressItem>
                  </ProgressGrid>
                </Panel>
              )}

              <Panel>
                <PanelHeader>
                  <PanelTitle>Прогрес до Trial</PanelTitle>
                  <Ionicons name="flag-outline" size={22} color={Theme.primary} />
                </PanelHeader>
                <ProgressGrid>
                  <ProgressItem>
                    <ProgressValue>{unlockedCount}/{requiredUnlocked || fragments.length}</ProgressValue>
                    <ProgressLabel>відкрито</ProgressLabel>
                  </ProgressItem>
                  <ProgressItem>
                    <ProgressValue>{masteredCount}/{requiredMastered || fragments.length}</ProgressValue>
                    <ProgressLabel>засвоєно</ProgressLabel>
                  </ProgressItem>
                  <ProgressItem>
                    <ProgressValue>{answeredCount}/{requiredAnswered}</ProgressValue>
                    <ProgressLabel>відповідей</ProgressLabel>
                  </ProgressItem>
                  <ProgressItem>
                    <ProgressValue>{accuracyPercent}%/{requiredAccuracy}%</ProgressValue>
                    <ProgressLabel>точність</ProgressLabel>
                  </ProgressItem>
                </ProgressGrid>
              </Panel>

              {activeSlot && (
                <Panel>
                  <PanelHeader>
                    <PanelTitle>{activeSlot.title}</PanelTitle>
                    <Pill $variant="primary">
                      <PillText $variant="primary">{activeSlot.questionCount} питань</PillText>
                    </Pill>
                  </PanelHeader>
                  <ChallengeBody>
                    {activeSlot.description && (
                      <ChallengeDescription>{activeSlot.description}</ChallengeDescription>
                    )}
                    <ChallengeMetaRow>
                      {closeDate && (
                        <Pill>
                          <PillText>до {closeDate}</PillText>
                        </Pill>
                      )}
                      <Pill>
                        <PillText>{activeSlot.targetFragmentIds.length} фрагменти у фокусі</PillText>
                      </Pill>
                    </ChallengeMetaRow>
                    {activeSlotIsTrial && activeSlotCompleted && (
                      <ChallengeDescription>
                        Trial завершено. Результат: {trialScore ?? 0}%. Спроб використано:{' '}
                        {activeSlotProgress?.attemptsUsed ?? 1}/{activeSlotProgress?.maxAttempts ?? 1}.
                      </ChallengeDescription>
                    )}
                    <PrimaryButton
                      onPress={handleStartChallenge}
                      disabled={startButtonDisabled}
                      $variant={startButtonMuted ? 'muted' : 'primary'}
                    >
                      <Ionicons
                        name={activeSlotCompleted ? 'hourglass-outline' : 'add-circle'}
                        size={18}
                        color={startButtonMuted ? Theme.textSecondary : '#0f2f2a'}
                      />
                      <PrimaryButtonText $variant={startButtonMuted ? 'muted' : 'primary'}>
                        {startButtonText}
                      </PrimaryButtonText>
                    </PrimaryButton>
                  </ChallengeBody>
                </Panel>
              )}

              <Panel>
                <PanelHeader>
                  <PanelTitle>Мапа епохи</PanelTitle>
                  <Ionicons name="map-outline" size={22} color={Theme.primary} />
                </PanelHeader>

                <Timeline>
                  {fragments.map((fragment, index) => {
                    const status = getFragmentStatus({
                      fragment,
                      progress: progressMap.get(fragment.id),
                      targetFragmentIds,
                      firstFragmentId,
                    })
                    const isLast = index === fragments.length - 1

                    return (
                      <TimelineItem
                        key={fragment.id}
                        activeOpacity={0.85}
                        onPress={() => openFragment(fragment, status)}
                      >
                        <TimelineRail>
                          <TimelineDot $status={status} />
                          {!isLast && <TimelineLine />}
                        </TimelineRail>

                        <FragmentCard $status={status}>
                          <FragmentHeader>
                            <FragmentTitle>
                              {status === 'locked' ? 'Закритий фрагмент' : fragment.title}
                            </FragmentTitle>
                            <Ionicons
                              name={
                                status === 'mastered'
                                  ? 'checkmark-circle'
                                  : status === 'locked'
                                    ? 'lock-closed-outline'
                                    : 'reader-outline'
                              }
                              size={20}
                              color={
                                status === 'mastered'
                                  ? Theme.success
                                  : status === 'locked'
                                    ? Theme.textSecondary
                                    : Theme.primary
                              }
                            />
                          </FragmentHeader>
                          {status !== 'locked' && fragment.year && (
                            <FragmentYear>{fragment.year}</FragmentYear>
                          )}
                          {status !== 'locked' && fragment.subtitle && (
                            <FragmentSubtitle>{fragment.subtitle}</FragmentSubtitle>
                          )}
                          <FragmentText>
                            {status === 'locked'
                              ? 'Фрагмент відкриється після проходження пов’язаного виклику.'
                              : fragment.shortText}
                          </FragmentText>
                        </FragmentCard>
                      </TimelineItem>
                    )
                  })}
                </Timeline>
              </Panel>
            </>
          )}
        </ScrollContent>

        <Modal
          visible={Boolean(selectedFragment)}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedFragment(null)}
        >
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <Header style={{ flex: 1, marginBottom: 0 }}>
                  {selectedFragment?.year && <FragmentYear>{selectedFragment.year}</FragmentYear>}
                  <Title style={{ fontSize: 24 }}>{selectedFragment?.title}</Title>
                  {selectedFragment?.subtitle && (
                    <Subtitle>{selectedFragment.subtitle}</Subtitle>
                  )}
                </Header>
                <CloseButton onPress={() => setSelectedFragment(null)}>
                  <Ionicons name="close" size={20} color={Theme.text} />
                </CloseButton>
              </ModalHeader>
              <FragmentText>
                {selectedFragment?.fullText ?? selectedFragment?.shortText}
              </FragmentText>
            </ModalContent>
          </ModalOverlay>
        </Modal>
      </SafeArea>
    </ScreenGradient>
  )
}
