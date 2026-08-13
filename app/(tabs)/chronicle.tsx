import React, { useMemo, useState } from 'react'
import { ActivityIndicator, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { useFeedback } from '@nexo/contexts/FeedbackProvider'
import { NestorDialog } from '@nexo/components/Chronicle/NestorDialog'
import { ChronicleArchiveModal } from '@nexo/components/Chronicle/ChronicleArchiveModal'
import { ChronicleRoute } from '@nexo/components/Chronicle/ChronicleRoute'
import {
  claimChronicleDiscovery,
  createChronicleChallengeQuiz,
} from '@nexo/services/chronicle-quiz.service'
import { useChronicleClock } from '@nexo/hooks/useChronicleClock'
import { useChronicleData } from '@nexo/hooks/useChronicleData'
import { useChronicleRouteFocus } from '@nexo/hooks/useChronicleRouteFocus'
import type { ChronicleFragmentStage } from '@nexo/utils/chronicle-progress'
import {
  formatChronicleDate,
  formatChronicleCountdown,
  formatChronicleDiscoveryReadyAt,
  getArchiveMeta,
  getSlotStudyFragmentIds,
  type ChronicleRouteItem,
  type ChronicleRouteStatus,
} from '@nexo/utils/chronicle-route'
import { createChronicleViewModel } from '@nexo/utils/chronicle-view-model'
import { getNestorDialogue, type NestorMood } from '@nexo/utils/nestor-dialogue'
import type {
  ChronicleFragment,
  ChronicleReconstruction,
} from '@nexo/types/chronicle.types'
import {
  ArchiveButton,
  ArchiveButtonText,
  DiscoveryAction,
  DiscoveryActionText,
  DiscoveryCard,
  DiscoveryKicker,
  DiscoveryText,
  DiscoveryTitle,
  DiscoveryTop,
  EmptyText,
  EraNav,
  EraNavButton,
  EraNavCenter,
  EraNavText,
  Eyebrow,
  Header,
  HeroProgressLabel,
  HeroProgressRow,
  HeroProgressValue,
  HeroTitle,
  HeroTopRow,
  EraHero,
  FocusActionBody,
  FocusActionButton,
  FocusActionButtonText,
  FocusActionCard,
  FocusActionIcon,
  FocusActionKicker,
  FocusActionText,
  FocusActionTitle,
  Pill,
  PillText,
  ProgressFill,
  ProgressTrack,
  SafeArea,
  ScreenGradient,
  ScrollContent,
  Subtitle,
  Title,
  TrialSummary,
  TrialSummaryText,
  TrialSummaryTitle,
  TrialSummaryTop,
} from '@nexo/components/Chronicle/Chronicle.styled'

type FragmentStatus = ChronicleFragmentStage
type RouteStatus = ChronicleRouteStatus

type NestorPrompt = {
  title: string
  message: string
  primaryLabel: string
  mode: 'discovery' | 'spark' | 'archive'
  mood: NestorMood
  onPrimary: () => void
}

export default function ChronicleScreen() {
  const Theme = useAppTheme()
  const router = useRouter()
  const { focusChallenge } = useLocalSearchParams<{
    focusChallenge?: string | string[]
  }>()
  const { userId } = useAuth()
  const { showModal, showToast } = useFeedback()
  const {
    chapters,
    selectedChapterIndex,
    chapter,
    fragments,
    slots,
    reconstructions,
    progressList,
    questionStatsList,
    challengeProgressList,
    reconstructionProgressList,
    chapterProgress,
    loading,
    refreshing,
    error,
    refresh,
    reload,
    selectPreviousChapter,
    selectNextChapter,
  } = useChronicleData(userId)
  const [startingChallenge, setStartingChallenge] = useState(false)
  const [claimingDiscovery, setClaimingDiscovery] = useState(false)
  const [archiveVisible, setArchiveVisible] = useState(false)
  const [nestorPrompt, setNestorPrompt] = useState<NestorPrompt | null>(null)
  const now = useChronicleClock(slots, chapterProgress?.pendingDiscovery?.readyAt)
  const viewModel = useMemo(() => createChronicleViewModel({
    chapter,
    fragments,
    slots,
    reconstructions,
    progressList,
    questionStatsList,
    challengeProgressList,
    reconstructionProgressList,
    chapterProgress,
    now,
  }), [
    challengeProgressList,
    chapter,
    chapterProgress,
    fragments,
    now,
    progressList,
    questionStatsList,
    reconstructionProgressList,
    reconstructions,
    slots,
  ])
  const {
    progressMap,
    masteredCount,
    unlockedCount,
    answeredCount,
    accuracyPercent,
    completedReconstructionCount,
    requiredUnlocked,
    requiredMastered,
    requiredReconstructions,
    requiredAnswered,
    requiredAccuracy,
    chapterCompleted,
    trialReady,
    completedRequirements: completedTrialRequirements,
    requirementCount: trialRequirementCount,
    completedTrialScore,
    activeSlot,
    activeSlotOpen,
    activeSlotCompleted,
    activeSlotAlreadyCreated,
    activeSlotRetryReady,
    activeStudyReady,
    pendingDiscovery,
    discoveryReady,
    activeReconstruction,
    routeItems,
    currentDiscovery,
    archivedFragments,
    foggedFragmentCount,
    routeProgress,
  } = viewModel
  const archivedFragmentIds = useMemo(
    () => new Set(archivedFragments.map((fragment) => fragment.id)),
    [archivedFragments],
  )

  const handleClaimDiscovery = async () => {
    if (!chapter || !pendingDiscovery || claimingDiscovery) return
    setClaimingDiscovery(true)
    try {
      const claimed = await claimChronicleDiscovery({
        chapterId: chapter.id,
        fragmentId: pendingDiscovery.fragmentId,
      })
      await reload({ blocking: false })
      const dialogue = getNestorDialogue('discovery_ready', {
        recordTitle: claimed.title,
      })
      setNestorPrompt({
        ...dialogue,
        primaryLabel: 'Відкрити запис',
        onPrimary: () => router.push({
          pathname: '/chronicle-theory/[fragmentId]',
          params: {
            fragmentId: claimed.fragmentId,
            chapterId: chapter.id,
          },
        } as never),
      })
    } catch (claimError: unknown) {
      showToast({
        type: 'error',
        message: claimError instanceof Error
          ? claimError.message
          : 'Не вдалося прийняти знахідку Нестора.',
      })
    } finally {
      setClaimingDiscovery(false)
    }
  }

  const requestedFocusChallenge = Array.isArray(focusChallenge)
    ? focusChallenge[0] ?? null
    : typeof focusChallenge === 'string' ? focusChallenge : null

  const {
    scrollRef,
    shouldFocus: shouldFocusActiveChallenge,
    handleRoutePanelLayout,
    handleActiveItemLayout,
  } = useChronicleRouteFocus({
    activeSlotId: activeSlot?.id,
    requestedFocus: requestedFocusChallenge,
    loading,
  })

  const handleStartChallenge = async (confirmed = false) => {
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

    const requiredStudy = getSlotStudyFragmentIds(activeSlot)
    const studyIsRead = requiredStudy.every((fragmentId) => progressMap.get(fragmentId)?.read)
    if (!studyIsRead) {
      showToast({
        type: 'info',
        message: 'Спочатку відкрий і познач як прочитану теорію цього блоку.',
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

    if (!confirmed) {
      const dialogue = getNestorDialogue(activeSlotRetryReady ? 'challenge_retry_ready' : activeSlotIsTrial ? 'trial_ready' : 'spark_ready')
      setNestorPrompt({
        ...dialogue,
        primaryLabel: activeSlotRetryReady ? 'Спробувати ще раз' : activeSlotIsTrial ? 'Створити Trial' : 'Створити Spark',
        onPrimary: () => { void handleStartChallenge(true) },
      })
      return
    }

    setStartingChallenge(true)

    try {
      const createdQuiz = await createChronicleChallengeQuiz({
        chapterId: chapter.id,
        slotId: activeSlot.id,
      })

      await reload({ blocking: false })

      showToast({
        type: createdQuiz.alreadyCreated ? 'info' : 'success',
        message: createdQuiz.alreadyCreated
          ? 'Виклик уже чекає на сторінці Вікторини.'
          : createdQuiz.retried
            ? 'Повторний Spark створено. Він зʼявився на сторінці Вікторини.'
            : 'Виклик створено. Він зʼявився на сторінці Вікторини.',
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

    if (!chapter) return
    if (status === 'restored') {
      router.push({
        pathname: '/chronicle-archive/[fragmentId]',
        params: { fragmentId: fragment.id, chapterId: chapter.id },
      } as never)
      return
    }

    const dialogue = getNestorDialogue('fragment_discovered', { recordTitle: fragment.archiveDiscovery?.title ?? fragment.title })
    setNestorPrompt({
      ...dialogue,
      primaryLabel: 'Відкрити запис',
      onPrimary: () => {
        router.push({
          pathname: '/chronicle-theory/[fragmentId]',
          params: { fragmentId: fragment.id, chapterId: chapter.id },
        } as never)
      },
    })
  }

  const openReconstruction = (reconstruction: ChronicleReconstruction, status: RouteStatus) => {
    if (status === 'locked') {
      showToast({
        type: 'info',
        message: 'Спочатку віднови обидва записи цього акту.',
      })
      return
    }

    router.push({
      pathname: '/chronicle-reconstruction/[reconstructionId]',
      params: {
        reconstructionId: reconstruction.id,
        chapterId: reconstruction.chapterId,
      },
    } as never)
  }

  const handleRouteItemPress = (item: ChronicleRouteItem) => {
    if (item.kind === 'fragment') {
      openFragment(item.fragment, item.status)
      return
    }
    if (item.kind === 'reconstruction') {
      openReconstruction(item.reconstruction, item.status)
      return
    }
    if (item.slot.id === activeSlot?.id) {
      void handleStartChallenge()
      return
    }
    if (item.status === 'created') {
      showToast({
        type: 'info',
        message: 'Цей виклик уже чекає на сторінці Вікторини.',
      })
      return
    }
    showToast({
      type: 'info',
      message: 'Пройди маршрут до цієї точки, щоб відкрити виклик.',
    })
  }

  const closeDate = activeSlot?.closesAt ? formatChronicleDate(activeSlot.closesAt) : null
  const activeSlotIsTrial = activeSlot?.type === 'trial_gate'
  const activeTrialLocked = Boolean(activeSlotIsTrial && !trialReady)
  const startButtonMuted = !activeSlotOpen || activeSlotAlreadyCreated || activeTrialLocked || !activeStudyReady
  const startButtonText = startingChallenge
    ? 'Створюємо…'
    : activeSlotCompleted
      ? activeSlotIsTrial ? 'Trial завершено' : 'Очікування наступного виклику'
      : activeSlotRetryReady
      ? 'Спробувати ще раз'
      : activeSlotAlreadyCreated
      ? activeSlotIsTrial ? 'Trial уже у вікторинах' : 'Виклик уже у вікторинах'
      : !activeStudyReady
      ? 'Спочатку прочитай теорію'
      : activeTrialLocked
      ? 'Trial ще не відкрито'
      : activeSlotOpen
        ? activeSlotIsTrial ? 'Створити Trial' : 'Створити виклик'
        : 'Виклик ще не відкрито'
  return (
    <ScreenGradient colors={[Theme.background, Theme.card]}>
      <SafeArea>
        <ScrollContent
          ref={scrollRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Theme.primary}
              colors={[Theme.primary]}
            />
          }
        >
          <Header>
            <Eyebrow>Експедиція Nexo</Eyebrow>
            <Title>
              {loading
                ? 'Відновлюємо зв’язок'
                : chapterCompleted
                  ? 'Епоху відновлено'
                  : 'Віднови Архів епохи'}
            </Title>
            <Subtitle>
              {loading
                ? 'Нестор звіряє карту, записи та доступні виклики.'
                : chapterCompleted
                  ? 'Усі зібрані події та знахідки залишаються у твоєму Архіві.'
                  : 'Туман приховує втрачені сторінки історії. Досліджуй, відновлюй і відкривай їх крок за кроком.'}
            </Subtitle>
          </Header>

          {loading ? (
            <FocusActionCard>
              <FocusActionIcon>
                <ActivityIndicator size="small" color={Theme.primary} />
              </FocusActionIcon>
              <FocusActionBody>
                <FocusActionKicker>Синхронізація Хроніки</FocusActionKicker>
                <FocusActionTitle>Збираємо маршрут</FocusActionTitle>
                <FocusActionText>
                  Усі фрагменти й Spark з’являться одночасно після перевірки прогресу.
                </FocusActionText>
              </FocusActionBody>
            </FocusActionCard>
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

              <EraHero
                colors={[`${Theme.primary}28`, Theme.card]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <HeroTopRow>
                  <HeroTitle>{chapter.title}</HeroTitle>
                  <Pill $variant={chapterCompleted ? 'success' : trialReady ? 'warning' : 'primary'}>
                    <PillText $variant={chapterCompleted ? 'success' : trialReady ? 'warning' : 'primary'}>
                      {chapterCompleted ? 'ЗАВЕРШЕНО' : trialReady ? 'TRIAL ВІДКРИТО' : 'У ПОДОРОЖІ'}
                    </PillText>
                  </Pill>
                </HeroTopRow>
                <Subtitle>{chapter.description}</Subtitle>
                <HeroProgressRow>
                  <HeroProgressLabel>Відновлено записів</HeroProgressLabel>
                  <HeroProgressValue>{masteredCount} з {fragments.length}</HeroProgressValue>
                </HeroProgressRow>
                <ProgressTrack><ProgressFill $progress={routeProgress} /></ProgressTrack>
                <ArchiveButton onPress={() => setArchiveVisible(true)}>
                  <Ionicons name="file-tray-full-outline" size={17} color={Theme.primary} />
                  <ArchiveButtonText>Архів епохи · {archivedFragments.length}/{fragments.length}</ArchiveButtonText>
                  <Ionicons name="chevron-forward" size={16} color={Theme.textSecondary} />
                </ArchiveButton>
              </EraHero>

              {pendingDiscovery && (
                <FocusActionCard>
                  <FocusActionIcon>
                    <Ionicons
                      name={discoveryReady ? 'mail-unread-outline' : 'compass-outline'}
                      size={22}
                      color={Theme.primary}
                    />
                  </FocusActionIcon>
                  <FocusActionBody>
                    <FocusActionKicker>
                      {discoveryReady ? 'Нестор повернувся' : 'Експедиція триває'}
                    </FocusActionKicker>
                    <FocusActionTitle>
                      {discoveryReady ? 'Нову знахідку доставлено' : 'Нестор досліджує слід'}
                    </FocusActionTitle>
                    <FocusActionText>
                      {discoveryReady
                        ? 'Прийми знайдений матеріал, щоб відсунути туман і відкрити наступний запис.'
                        : `Повернення ${formatChronicleDiscoveryReadyAt(pendingDiscovery.readyAt, now) ?? 'о 08:00'} · залишилось ${formatChronicleCountdown(pendingDiscovery.readyAt, now) ?? 'трохи часу'}.`}
                    </FocusActionText>
                  </FocusActionBody>
                  {discoveryReady ? (
                    <FocusActionButton
                      disabled={claimingDiscovery}
                      onPress={() => { void handleClaimDiscovery() }}
                    >
                      <Ionicons
                        name={claimingDiscovery ? 'hourglass-outline' : 'archive-outline'}
                        size={17}
                        color={Theme.background}
                      />
                      <FocusActionButtonText>
                        {claimingDiscovery ? 'Приймаємо…' : 'Прийняти'}
                      </FocusActionButtonText>
                    </FocusActionButton>
                  ) : null}
                </FocusActionCard>
              )}

              {!pendingDiscovery && activeReconstruction && (
                <FocusActionCard>
                  <FocusActionIcon>
                    <Ionicons name="git-merge-outline" size={22} color={Theme.primary} />
                  </FocusActionIcon>
                  <FocusActionBody>
                    <FocusActionKicker>Наступна дія · Реконструкція</FocusActionKicker>
                    <FocusActionTitle>Записи треба з’єднати</FocusActionTitle>
                    <FocusActionText>
                      Окремі фрагменти відновлено. Тепер склади з них цілісну історичну справу.
                    </FocusActionText>
                  </FocusActionBody>
                  <FocusActionButton onPress={() => openReconstruction(activeReconstruction, 'available')}>
                    <Ionicons name="scan-outline" size={17} color={Theme.background} />
                    <FocusActionButtonText>Почати</FocusActionButtonText>
                  </FocusActionButton>
                </FocusActionCard>
              )}

              {currentDiscovery && !pendingDiscovery && !activeReconstruction && (
                <DiscoveryCard
                  colors={[`${Theme.primary}1d`, Theme.card]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <DiscoveryTop>
                    <DiscoveryKicker>
                      Поточна знахідка · {getArchiveMeta(currentDiscovery.fragment).label}
                    </DiscoveryKicker>
                    <Ionicons name={getArchiveMeta(currentDiscovery.fragment).icon} size={24} color={Theme.primary} />
                  </DiscoveryTop>
                  <DiscoveryTitle>{currentDiscovery.fragment.title}</DiscoveryTitle>
                  <DiscoveryText>{currentDiscovery.fragment.subtitle ?? currentDiscovery.fragment.shortText}</DiscoveryText>
                  <DiscoveryAction onPress={() => openFragment(currentDiscovery.fragment, currentDiscovery.status)}>
                    <Ionicons name="search-outline" size={17} color={Theme.background} />
                    <DiscoveryActionText>Відкрити справу</DiscoveryActionText>
                  </DiscoveryAction>
                </DiscoveryCard>
              )}

              {!currentDiscovery && !pendingDiscovery && !activeReconstruction && activeSlot && !activeSlotCompleted && (activeSlotAlreadyCreated || (activeStudyReady && activeSlotOpen)) && (
                <FocusActionCard>
                  <FocusActionIcon>
                    <Ionicons name={activeSlotAlreadyCreated ? 'albums-outline' : 'flash-outline'} size={21} color={Theme.primary} />
                  </FocusActionIcon>
                  <FocusActionBody>
                    <FocusActionKicker>Наступна дія · {activeSlotIsTrial ? 'Trial' : 'Spark'}</FocusActionKicker>
                    <FocusActionTitle>
                      {activeSlotAlreadyCreated
                        ? activeSlotIsTrial ? 'Trial уже готовий' : 'Spark уже готовий'
                        : activeSlotRetryReady
                          ? 'Spark можна повторити'
                        : activeSlotIsTrial ? 'Перевір епоху' : 'Закріпи запис'}
                    </FocusActionTitle>
                    <FocusActionText>
                      {activeSlotAlreadyCreated
                        ? 'Виклик чекає у Вікторинах.'
                        : activeSlotRetryReady
                          ? 'Нестор стабілізував фрагмент. Перечитай теорію й створи нову спробу.'
                        : activeSlotIsTrial
                          ? 'Збери епоху в одну картину.'
                          : 'Теорію прочитано — час перевірити себе.'}
                    </FocusActionText>
                  </FocusActionBody>
                  <FocusActionButton onPress={() => {
                    if (activeSlotAlreadyCreated) {
                      router.push('/quiz')
                      return
                    }
                    void handleStartChallenge()
                  }}>
                    <Ionicons name={activeSlotAlreadyCreated ? 'arrow-forward' : 'flash-outline'} size={17} color={Theme.background} />
                    <FocusActionButtonText>{activeSlotAlreadyCreated ? 'До квізів' : activeSlotRetryReady ? 'Ще раз' : activeSlotIsTrial ? 'Trial' : 'Spark'}</FocusActionButtonText>
                  </FocusActionButton>
                </FocusActionCard>
              )}

              <ChronicleRoute
                items={routeItems}
                activeSlotId={activeSlot?.id}
                focusActiveChallenge={shouldFocusActiveChallenge}
                foggedFragmentCount={foggedFragmentCount}
                completedTrialScore={completedTrialScore}
                closeDate={closeDate}
                startButtonMuted={startButtonMuted}
                startingChallenge={startingChallenge}
                startButtonText={startButtonText}
                onItemPress={handleRouteItemPress}
                onPanelLayout={handleRoutePanelLayout}
                onActiveItemLayout={handleActiveItemLayout}
              />

              <TrialSummary>
                <TrialSummaryTop>
                  <Ionicons name={chapterCompleted ? 'trophy' : 'flag-outline'} size={21} color={chapterCompleted ? Theme.success : Theme.primary} />
                  <TrialSummaryTitle>{chapterCompleted ? `Епоху завершено · ${completedTrialScore ?? 0}%` : `До Trial: ${completedTrialRequirements} з ${trialRequirementCount}`}</TrialSummaryTitle>
                </TrialSummaryTop>
                <TrialSummaryText>
                  {chapterCompleted
                    ? `Відкрито ${unlockedCount} фрагментів, засвоєно ${masteredCount}. Епоха залишиться в твоєму архіві.`
                    : `Відкрито: ${unlockedCount}/${requiredUnlocked || fragments.length} · Реконструкції: ${completedReconstructionCount}/${requiredReconstructions || reconstructions.length} · Засвоєно: ${masteredCount}/${requiredMastered || fragments.length} · Відповідей: ${answeredCount}/${requiredAnswered} · Точність: ${accuracyPercent}%/${requiredAccuracy}%`}
                </TrialSummaryText>
              </TrialSummary>
            </>
          )}
        </ScrollContent>

        <ChronicleArchiveModal
          visible={archiveVisible}
          fragments={fragments}
          discoveredFragmentIds={archivedFragmentIds}
          onClose={() => setArchiveVisible(false)}
          onOpenFragment={(fragment) => {
            setArchiveVisible(false)
            router.push({
              pathname: '/chronicle-archive/[fragmentId]',
              params: { fragmentId: fragment.id, chapterId: chapter?.id ?? '' },
            } as never)
          }}
        />

        {nestorPrompt ? (
          <NestorDialog
            visible
            title={nestorPrompt.title}
            message={nestorPrompt.message}
            primaryLabel={nestorPrompt.primaryLabel}
            mode={nestorPrompt.mode}
            mood={nestorPrompt.mood}
            onPrimary={nestorPrompt.onPrimary}
            onDismiss={() => setNestorPrompt(null)}
            secondaryLabel="Не зараз"
          />
        ) : null}
      </SafeArea>
    </ScreenGradient>
  )
}
