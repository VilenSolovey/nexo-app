import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, type ListRenderItem } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { QuizType, Quiz } from '@nexo/types/quiz.types';
import { useAllQuizzes } from '@nexo/hooks/useAllQuizzes';
import { QuizLayout } from '@nexo/components/Quiz/Discovery/QuizLayout';
import { QuizSearchBar } from '@nexo/components/Quiz/Discovery/QuizSearchBar';
import { QuizFilterTabs } from '@nexo/components/Quiz/Discovery/QuizFilterTabs';
import { QuizCard } from '@nexo/components/Quiz/Discovery/QuizCard';
import { QuizStartModal } from '@nexo/components/Quiz/Discovery/QuizStartModal';
import { useAuth } from '@nexo/contexts/AuthProvider';
import { useUserQuizProgress } from '@nexo/hooks/useUserQuizProgress';
import { useRefreshOnReturn } from '@nexo/hooks/useRefreshOnReturn';
import {
  Header,
  HeaderTitle,
  LoadingText,
  QuizEntrance,
  QuizList,
} from '@nexo/components/Quiz/Discovery/Quiz.styled';
import { Theme } from '@nexo/constants/theme'
import { isQuizProgressCompleted } from '@nexo/utils/quiz-progress';

export default function QuizzesScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { focusQuiz } = useLocalSearchParams<{ focusQuiz?: string | string[] }>();
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedType, setSelectedType] = useState<QuizType | 'all'>('all');
  const {
    quizzes,
    loading: quizzesLoading,
    ready: quizzesReady,
    error: quizzesError,
    refetch: refetchQuizzes,
  } = useAllQuizzes(userId)
  const {
    progressMap,
    loading: progressLoading,
    ready: progressReady,
    error: progressError,
    refetch: refetchProgress,
  } = useUserQuizProgress(userId)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)

  const requestedFocusQuiz = Array.isArray(focusQuiz) ? focusQuiz[0] : focusQuiz
  const selectedQuiz = useMemo(
    () => quizzes.find((quiz) => quiz.id === selectedQuizId) ?? null,
    [quizzes, selectedQuizId],
  )

  const handleQuizPress = useCallback((quizId: string) => {
    setSelectedQuizId(quizId)
  }, [])

  const handleCloseModal = useCallback(() => setSelectedQuizId(null), [])

  const pullToRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchQuizzes(),
        refetchProgress(),
      ])
    } finally {
      setIsRefreshing(false)
    }
  }, [refetchProgress, refetchQuizzes])

  const filteredQuizzes = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return quizzes.filter((quiz) => {
      const matchesType = selectedType === 'all' || quiz.type === selectedType
      const matchesSearch = quiz.title.toLowerCase().includes(normalizedSearch)
      const completed = isQuizProgressCompleted(progressMap.get(quiz.id), quiz.maxAttempts)
      return matchesType && matchesSearch && !completed
    })
  }, [progressMap, quizzes, searchQuery, selectedType])

  useEffect(() => {
    if (!requestedFocusQuiz || quizzesLoading) return

    const quiz = quizzes.find((item) => item.id === requestedFocusQuiz)
    if (!quiz) return

    setSelectedQuizId(quiz.id)
    router.setParams({ focusQuiz: undefined })
  }, [quizzes, quizzesLoading, requestedFocusQuiz, router])

  const shouldShowInitialLoading =
    (!quizzesReady && quizzesLoading) || (!progressReady && progressLoading)
  const blockingError =
    (!quizzesReady ? quizzesError : null) ??
    (!progressReady ? progressError : null)

  const refreshOnReturn = useCallback(
    () => Promise.all([refetchQuizzes(), refetchProgress()]),
    [refetchProgress, refetchQuizzes],
  )
  useRefreshOnReturn(refreshOnReturn)

  const renderQuiz = useCallback<ListRenderItem<Quiz>>(
    ({ item: quiz, index }) => (
      <QuizEntrance index={Math.min(index, 5)} delay={160}>
        <QuizCard quiz={quiz} onPress={handleQuizPress} />
      </QuizEntrance>
    ),
    [handleQuizPress],
  )

  return (
    <QuizLayout>
      <QuizEntrance index={0}>
        <Header>
          <HeaderTitle>Вікторини</HeaderTitle>
        </Header>
      </QuizEntrance>

      <QuizEntrance index={1}>
        <QuizSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </QuizEntrance>

      <QuizEntrance index={2}>
        <QuizFilterTabs
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />
      </QuizEntrance>

      <QuizList
        data={shouldShowInitialLoading || blockingError ? [] : filteredQuizzes}
        keyExtractor={(quiz) => quiz.id}
        renderItem={renderQuiz}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={pullToRefresh}
            tintColor={Theme.primary}
            colors={[Theme.primary]}
          />
        }
        ListEmptyComponent={shouldShowInitialLoading ? (
          <LoadingText>Завантажується...</LoadingText>
        ) : blockingError ? (
          <LoadingText>Помилка: {blockingError}</LoadingText>
        ) : (
          <LoadingText>Немає доступних вікторин</LoadingText>
        )}
      />
      
      <QuizStartModal
        visible={selectedQuiz !== null}
        quiz={selectedQuiz}
        progress={selectedQuiz ? progressMap.get(selectedQuiz.id) ?? null : null}
        onClose={handleCloseModal}
      />
    </QuizLayout>
  );
}
